# Face Recognition with ArcFace ONNX and 5-Point Alignment

<img src="https://via.placeholder.com/800x200/007bff/ffffff?text=ArcFace+ONNX+%2B+5-Point+Alignment" alt="Project Banner" width="800"/>

**Author:** IRADUKUNDA Joyeuse
**Instructor:** Gabriel Baziramwabo  
**Organization:** Rwanda Coding Academy  

This project implements a **Distributed Face Recognition and Tracking System** for IoT-based servo control using:

- **ArcFace** model (ONNX) for face recognition
- **5-point facial landmark alignment** for precise face detection
- **MQTT** for distributed communication between components
- **ESP8266** microcontroller for edge-based servo control
- **Real-time Web Dashboard** for system monitoring

The system is designed for **embedded systems applications**, demonstrating how computer vision, IoT communication, and edge computing work together in a practical face-tracking servo control system.

## Table of Contents

- [Assessment Details (Week 06)](#assessment-details-week-06)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Usage](#usage)

## System Architecture

This distributed system consists of four main components:

1. **Vision Node (PC)**: Detects, recognizes, and tracks faces using ArcFace and MediaPipe. Publishes movement commands via MQTT.
2. **MQTT Broker (VPS)**: Central message broker facilitating communication between all components.
3. **ESP8266 (Edge Controller)**: Subscribes to movement commands and controls a servo motor to physically track the detected face.
4. **Web Dashboard**: Real-time visualization of system status, tracking data, and lock status.

## Features

- **Face Recognition & Locking**: Lock onto a specific enrolled identity and track their movements
- **Distributed Architecture**: Components communicate via MQTT, allowing flexible deployment
- **Real-time Servo Control**: ESP8266 controls servo motor based on face position
- **Live Dashboard**: Web-based monitoring with WebSocket updates
- **Action Detection**: Detects blinks, smiles, and head movements
- **CPU-friendly**: Runs on standard laptops without GPU requirements

## Project Structure

```
Face_recognition_with_Arcface/
├── src/
│   ├── vision_node.py       # Main vision processing + MQTT publisher
│   ├── face_locking.py      # Face locking & action detection
│   ├── haar_5pt.py          # Face detection core
│   └── recognize.py         # ArcFace recognition
├── backend/
│   ├── server.js            # MQTT-to-WebSocket relay
│   └── package.json
├── dashboard/
│   └── index.html           # Real-time web dashboard
├── esp8266/
│   └── vision_servo/
│       └── vision_servo.ino # Arduino firmware for ESP8266
├── data/
│   └── db/                  # Face database (face_db.npz)
└── models/
    └── embedder_arcface.onnx
```

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
cd backend && npm install
```

### 2. Enroll Your Face
```bash
python -m src.enroll --name gloria
```

### 3. Start the System

**On VPS (or local MQTT broker):**
```bash
mosquitto -c mosquitto.conf
```

**On PC - Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**On PC - Terminal 2 (Vision Node):**
```bash
python src/vision_node.py --broker broker.hivemq.com --name gloria
```

### 4. Flash ESP8266
Upload `esp8266/vision_servo/vision_servo.ino` using Arduino IDE.

### 5. Access Dashboard
Open: [http://157.173.101.159:9313]([http://157.173.101.159:9313/])

## Assessment Runbook

### What This Project Covers

| Requirement | Implementation |
| --- | --- |
| Enroll one authorized speaker | `src/enroll.py` captures face crops and saves `data/db/face_db.npz` plus metadata in `data/db/face_db.json`. |
| Recognize only the enrolled speaker | `src/face_locking.py` compares every detected face against the database and locks only when the matched name equals the requested target. Other known/unknown faces are ignored for motor control. |
| Track speaker in real time | `src/vision_node.py` receives the locked target face box from `FaceLockSystem` and computes its horizontal center. |
| Convert tracking error to commands | Left of frame deadband publishes `MOVE_LEFT`; right publishes `MOVE_RIGHT`; center publishes `CENTERED`; missing target publishes `NO_FACE`. |
| MQTT publish/subscribe | PC publishes to `vision/Joyeuse/movement`; ESP8266 subscribes to the same topic; dashboard/backend relay the movement messages. |
| Drive servo on ESP8266 | `esp8266/vision_servo/vision_servo.ino` uses `D5` / `GPIO14` as the servo signal pin. |
| Robust re-acquisition | When the target is lost, PC publishes `NO_FACE`; ESP8266 enters search sweep mode until target commands return. |
| Evidence logging | `src/vision_node.py` writes CSV logs to `data/logs/` with timestamp, speaker ID, confidence, lock state, motor command, and MQTT topic. `src/face_locking.py` also writes a session history file for lock/action events. |

### Recognize -> Track -> Command Pipeline

```text
USB Camera
  -> Haar + MediaPipe 5-point face detection
  -> ArcFace embedding per detected face
  -> Compare with enrolled template in data/db/face_db.npz
  -> Accept only requested speaker name
  -> Compute target face center vs frame center
  -> Apply deadband
  -> Publish MOVE_LEFT / MOVE_RIGHT / CENTERED / NO_FACE to MQTT
  -> ESP8266 receives command
  -> Servo on D5/GPIO14 moves camera or scans for re-acquisition
```

### Hardware Wiring

```text
Servo signal wire -> ESP8266 D5 / GPIO14
Servo VCC         -> stable 5V / VIN
Servo GND         -> ESP8266 GND and power supply GND
```

Use a stable servo power source. Do not rely on a weak USB port for servo current if the motor jitters or resets the ESP8266.

### Run Order

1. Create and activate a Python environment.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Install the dashboard/backend packages.

```bash
cd backend
npm install
cd ..
```

3. Enroll the speaker if `data/db/face_db.npz` does not already contain the target.

```bash
python -m src.enroll
```

When prompted, enter the speaker name, for example `joyeuse`. Capture 10-30 images using `SPACE`, or press `a` for auto-capture, then press `s` to save.

4. Flash the ESP8266 sketch.

Open `esp8266/vision_servo/vision_servo.ino` in Arduino IDE and select an ESP8266 board such as NodeMCU 1.0. Install these Arduino libraries if needed:

```text
ESP8266 board package
PubSubClient
Servo / ESP8266Servo-compatible servo library
```

Upload the sketch. The current Wi-Fi configuration is:

```text
SSID: YOUR_WIFI_SSID
Password: YOUR_WIFI_PASSWORD
MQTT broker: broker.hivemq.com:1883
Topic: vision/Joyeuse/movement
Servo pin: D5 / GPIO14
```

5. Start the dashboard relay.

```bash
cd backend
npm start
```

Open the dashboard at:

```text
http://localhost:8080
```

6. Start the vision controller.

```bash
python -m src.vision_node --broker broker.hivemq.com --name joyeuse
```

Use the same `--name` that appears in `data/db/face_db.json`.
The project is configured to use external camera index `1` for enrollment and live tracking.

7. Demonstrate the required scenarios.

```text
Speaker moves left/right: dashboard and ESP receive MOVE_LEFT / MOVE_RIGHT.
Speaker centered: dashboard and ESP receive CENTERED.
Speaker hidden/occluded: system publishes NO_FACE and servo starts sweep/search.
Other faces appear: only the enrolled speaker is used for motor commands.
Evidence logs: check data/logs/<speaker>_evidence_<timestamp>.csv.
```

## Assessment Details (Week 06)

### System Description
This project implements a **Distributed Face Recognition and Locking System** using:
1.  **Vision Node (PC)**: Detects, recognizes, and tracks faces using ArcFace and MediaPipe. Publishes movement commands.
2.  **MQTT Broker (VPS)**: Facilitates communication between the PC, ESP8266, and Dashboard.
3.  **ESP8266 (Edge)**: Subscribes to movement commands and controls a Servo motor to track the face.
4.  **Web Dashboard**: Visualizes the real-time blocking status and tracking info.

### MQTT Topics
-   `vision/Joyeuse/movement`: JSON payload with `status` (MOVE_LEFT, MOVE_RIGHT, CENTERED), `target`, and `locked` state.
-   `vision/Joyeuse/heartbeat`: System health status.

### Live Dashboard
**URL**: [http://157.173.101.159:9313/]

## Face Locking
The new Face Locking feature (`src/face_locking.py` and `vision_node.py`) allows you to track a single enrolled identity continuously.

**How it works:**
1.  **Search**: The system looks for the user using ArcFace recognition.
2.  **Lock**: Once found, it tracks the user's face position.
3.  **Action Detection**: It measures facial landmarks to detect:
    - **Blinks**: Using Eye Aspect Ratio (EAR).
    - **Smiles**: Using mouth width ratios.
    - **Movement**: Using nose position (Left/Right).

**History**:
A file named `<name>_history_<timestamp>.txt` is created to record all detected actions.
