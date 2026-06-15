#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* client_id = "esp8266_Joyeuse";
const char* topic_movement = "vision/Joyeuse/movement";
const char* topic_heartbeat = "vision/Joyeuse/heartbeat";

// Servo Configuration
// NodeMCU D5 is ESP8266 GPIO14. Connect the servo signal wire to D5.
// Power the servo from a stable 5V supply/VIN and connect servo GND to ESP8266 GND.
Servo myServo;
const int servoPin = D5;
const char* servoPinLabel = "D5/GPIO14";
const int MIN_ANGLE = 0;
const int MAX_ANGLE = 180;
const int CENTER_ANGLE = 90;
int currentAngle = CENTER_ANGLE;

// --- Smooth Motion Control ---
// The PC vision node calculates face center X and publishes movement commands.
// The ESP turns those commands into small timed servo steps for natural motion.
bool isSearching = true;         // Start in search mode by default
int trackingDirection = 0;       // -1 = left, 0 = hold, 1 = right
int sweepStep = 1;               // Search direction and step size
unsigned long lastServoUpdate = 0;
const int TRACK_STEP_DEG = 1;
const int SEARCH_STEP_DEG = 1;
const unsigned long TRACK_UPDATE_MS = 70;
const unsigned long SEARCH_UPDATE_MS = 45;

// --- Watchdog Timer Variables ---
unsigned long lastFaceDetectTime = 0;
const unsigned long FACE_TIMEOUT = 2000; // 2 seconds without a face triggers a search

WiFiClient espClient;
PubSubClient client(espClient);

const char* wifiStatusName(wl_status_t status) {
  switch (status) {
    case WL_IDLE_STATUS: return "IDLE";
    case WL_NO_SSID_AVAIL: return "NO_SSID_AVAILABLE";
    case WL_SCAN_COMPLETED: return "SCAN_COMPLETED";
    case WL_CONNECTED: return "CONNECTED";
    case WL_CONNECT_FAILED: return "CONNECT_FAILED";
    case WL_CONNECTION_LOST: return "CONNECTION_LOST";
    case WL_DISCONNECTED: return "DISCONNECTED";
    default: return "UNKNOWN";
  }
}

void setup_wifi() {
  delay(10);
  Serial.println("\nConnecting to WiFi...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  Serial.println("Scanning for WiFi networks...");
  int networkCount = WiFi.scanNetworks();
  bool foundConfiguredSsid = false;
  for (int i = 0; i < networkCount; i++) {
    String foundSsid = WiFi.SSID(i);
    Serial.print("  ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(foundSsid);
    Serial.print(" (RSSI ");
    Serial.print(WiFi.RSSI(i));
    Serial.println(" dBm)");
    if (foundSsid == ssid) {
      foundConfiguredSsid = true;
    }
  }
  if (!foundConfiguredSsid) {
    Serial.println("WARNING: Configured SSID was not found. Check spelling/case or use a 2.4 GHz network.");
  }

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (millis() - startedAt > 30000) {
      Serial.println();
      Serial.print("WiFi connection timed out. Status: ");
      Serial.println(wifiStatusName(WiFi.status()));
      Serial.println("Restarting WiFi connection attempt...");
      WiFi.disconnect();
      delay(1000);
      WiFi.begin(ssid, password);
      startedAt = millis();
    }
  }
  Serial.println("\nWiFi connected");
  Serial.print("ESP8266 IP: ");
  Serial.println(WiFi.localIP());
}

void writeServoAngle(int angle) {
  if (angle < MIN_ANGLE) angle = MIN_ANGLE;
  if (angle > MAX_ANGLE) angle = MAX_ANGLE;
  if (angle == currentAngle) return;

  currentAngle = angle;
  myServo.write(currentAngle);
}

void stepServo(int direction, int stepDeg) {
  if (direction == 0) return;
  writeServoAngle(currentAngle + (direction * stepDeg));
}

String extractCommand(String message) {
  message.toUpperCase();

  if (message.indexOf("MOVE_LEFT") >= 0 || message.indexOf("MOVED_LEFT") >= 0 || message.indexOf("\"LEFT\"") >= 0) {
    return "MOVE_LEFT";
  }
  if (message.indexOf("MOVE_RIGHT") >= 0 || message.indexOf("MOVED_RIGHT") >= 0 || message.indexOf("\"RIGHT\"") >= 0) {
    return "MOVE_RIGHT";
  }
  if (message.indexOf("CENTERED") >= 0 || message.indexOf("STOP") >= 0 || message.indexOf("STOPPED") >= 0) {
    return "CENTERED";
  }
  if (message.indexOf("NO_FACE") >= 0 || message.indexOf("OUT_OF_FRAME") >= 0 || message.indexOf("SCAN") >= 0) {
    return "NO_FACE";
  }

  return "";
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  String command = extractCommand(message);
  
  // Parse commands from the PC. The PC already applied the face-center dead zone;
  // the ESP only follows the resulting direction smoothly.
  if (command == "MOVE_LEFT") {
    isSearching = false; 
    lastFaceDetectTime = millis(); // Reset the timer!
    trackingDirection = -1;
  } 
  else if (command == "MOVE_RIGHT") {
    isSearching = false; 
    lastFaceDetectTime = millis(); // Reset the timer!
    trackingDirection = 1;
  } 
  else if (command == "CENTERED") {
    isSearching = false; 
    lastFaceDetectTime = millis(); // Reset the timer!
    trackingDirection = 0;
  } 
  else if (command == "NO_FACE") {
    isSearching = true;  // Explicit command to start searching
    trackingDirection = 0;
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(client_id)) {
      Serial.println("Connected!");
      client.subscribe(topic_movement); 
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" trying again in 5s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println();
  Serial.println("=== ESP8266 Vision Servo Starting ===");
  myServo.attach(servoPin, 500, 2400);
  myServo.write(currentAngle);
  Serial.print("Servo signal configured on ");
  Serial.println(servoPinLabel);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void updateServoMotion(unsigned long now) {
  // Smooth search mode: scan slowly from the current angle and reverse at limits.
  if (isSearching) {
    if (now - lastServoUpdate < SEARCH_UPDATE_MS) return;
    lastServoUpdate = now;

    if (currentAngle >= MAX_ANGLE) {
      sweepStep = -SEARCH_STEP_DEG;
    } else if (currentAngle <= MIN_ANGLE) {
      sweepStep = SEARCH_STEP_DEG;
    }

    stepServo(sweepStep > 0 ? 1 : -1, SEARCH_STEP_DEG);
    return;
  }

  // Smooth tracking mode: move only one small step per interval.
  // CENTERED messages set trackingDirection to 0, so the servo holds still.
  if (now - lastServoUpdate < TRACK_UPDATE_MS) return;
  lastServoUpdate = now;
  stepServo(trackingDirection, TRACK_STEP_DEG);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();

  // --- WATCHDOG TIMER ---
  // If we aren't currently searching, but it's been more than 2 seconds 
  // since we last saw a face, force the system back into search mode.
  if (!isSearching && (now - lastFaceDetectTime > FACE_TIMEOUT)) {
    Serial.println("Face lost! Watchdog triggered. Starting search...");
    isSearching = true;
    trackingDirection = 0;
  }

  updateServoMotion(now);

  // --- SYSTEM HEARTBEAT ---
  static unsigned long lastHeartbeat = 0;
  if (now - lastHeartbeat > 5000) {
    lastHeartbeat = now;
    String heartbeat = "{\"node\":\"esp8266\",\"status\":\"ONLINE\",\"servo_pin\":\"";
    heartbeat += servoPinLabel;
    heartbeat += "\",\"angle\":";
    heartbeat += currentAngle;
    heartbeat += ",\"searching\":";
    heartbeat += isSearching ? "true" : "false";
    heartbeat += "}";
    client.publish(topic_heartbeat, heartbeat.c_str());
  }
}
