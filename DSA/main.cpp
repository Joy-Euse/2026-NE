#include <iostream>
#include <vector>
#include <unordered_map>
#include <fstream>
#include <iomanip>
#include <limits>
#include <regex>
#include <algorithm>
#include <cmath>

using namespace std;

// Vehicle categories supported by the parking system.
enum class VehicleType {
    MOTORCYCLE = 1,
    CAR = 2,
    TRUCK = 3
};

// Tracks whether a slot can accept a vehicle.
enum class SlotStatus {
    AVAILABLE,
    OCCUPIED
};

// Remove extra spaces around user input.
string trim(string text) {
    while (!text.empty() && isspace(text.front())) text.erase(text.begin());
    while (!text.empty() && isspace(text.back())) text.pop_back();
    return text;
}

string toUpperCase(string text) {
    transform(text.begin(), text.end(), text.begin(), ::toupper);
    return text;
}

// Reset cin after invalid input.
void clearInput() {
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

void printLine(char symbol = '=', int length = 70) {
    for (int i = 0; i < length; i++) cout << symbol;
    cout << endl;
}

void printHeader(string title) {
    cout << "\n";
    printLine('=', 72);
    cout << "  " << title << endl;
    printLine('=', 72);
}

void printSubHeader(string title) {
    cout << "\n";
    cout << "  " << title << endl;
    printLine('-', 72);
}

void printStatus(string type, string message) {
    cout << "\n[" << type << "] " << message << endl;
}

void waitForEnter() {
    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}

void printSlotTableHeader() {
    printLine('-', 72);
    cout << left << setw(15) << "Slot ID"
         << setw(15) << "Type"
         << setw(22) << "Zone"
         << setw(15) << "Status" << endl;
    printLine('-', 72);
}

string vehicleTypeToString(VehicleType type) {
    switch (type) {
        case VehicleType::MOTORCYCLE: return "Motorcycle";
        case VehicleType::CAR: return "Car";
        case VehicleType::TRUCK: return "Truck";
        default: return "Unknown";
    }
}

string statusToString(SlotStatus status) {
    return status == SlotStatus::AVAILABLE ? "Available" : "Occupied";
}

// Keep asking until the user enters a number in range.
int getValidInt(string message, int minValue, int maxValue) {
    int value;
    while (true) {
        cout << message;
        if (cin >> value && value >= minValue && value <= maxValue) {
            clearInput();
            return value;
        }
        cout << "Invalid input. Enter a number between " << minValue << " and " << maxValue << ".\n";
        clearInput();
    }
}

// Keep asking until the user enters a valid positive amount.
double getValidDouble(string message, double minValue) {
    double value;
    while (true) {
        cout << message;
        if (cin >> value && value >= minValue) {
            clearInput();
            return value;
        }
        cout << "Invalid input. Enter a valid positive number.\n";
        clearInput();
    }
}

// Read required text fields and trim accidental spaces.
string getNonEmptyText(string message) {
    string value;
    while (true) {
        cout << message;
        getline(cin, value);
        value = trim(value);
        if (!value.empty()) return value;
        cout << "Input cannot be empty. Please try again.\n";
    }
}

// Slot IDs are stored as numeric text for simple file output.
bool isValidNumericSlotId(string slotId) {
    regex pattern("^[0-9]+$");
    return regex_match(slotId, pattern);
}

string getValidSlotId(string message) {
    string slotId;
    while (true) {
        slotId = getNonEmptyText(message);
        if (isValidNumericSlotId(slotId)) return slotId;
        cout << "Invalid Slot ID. Slot ID must contain numbers only.\n";
    }
}

bool isValidZoneName(string zone) {
    regex pattern("^[A-Za-z]+([ -][A-Za-z]+)*$");
    return regex_match(zone, pattern);
}

string getValidZone(string message) {
    string zone;
    while (true) {
        zone = getNonEmptyText(message);
        if (isValidZoneName(zone)) return zone;
        cout << "Invalid zone. Use letters, spaces, or hyphens only.\n";
    }
}

bool isValidPlateNumber(string plate) {
    regex pattern("^[A-Za-z0-9-]+$");
    return regex_match(plate, pattern);
}

string getValidPlateNumber(string message) {
    string plate;
    while (true) {
        plate = toUpperCase(getNonEmptyText(message));
        if (isValidPlateNumber(plate)) return plate;
        cout << "Invalid plate number. Use letters, numbers, or hyphens only.\n";
    }
}

// Display the vehicle type menu and convert the choice to an enum.
VehicleType chooseVehicleType() {
    printSubHeader("Vehicle Type");
    cout << "  1. Motorcycle\n";
    cout << "  2. Car\n";
    cout << "  3. Truck\n\n";

    int choice = getValidInt("Choose vehicle type: ", 1, 3);

    if (choice == 1) return VehicleType::MOTORCYCLE;
    if (choice == 2) return VehicleType::CAR;
    return VehicleType::TRUCK;
}

// Convert HH:MM input into minutes for easier duration calculations.
int getValidTimeInMinutes(string message) {
    int hour, minute;
    char colon;

    while (true) {
        cout << message << " HH:MM: ";

        if (cin >> hour >> colon >> minute &&
            colon == ':' &&
            hour >= 0 && hour <= 23 &&
            minute >= 0 && minute <= 59) {
            clearInput();
            return hour * 60 + minute;
        }

        cout << "Invalid time. Use format HH:MM, for example 08:30.\n";
        clearInput();
    }
}

// Convert stored minutes back to HH:MM display format.
string formatTime(int minutes) {
    int hour = minutes / 60;
    int minute = minutes % 60;

    string h = hour < 10 ? "0" + to_string(hour) : to_string(hour);
    string m = minute < 10 ? "0" + to_string(minute) : to_string(minute);

    return h + ":" + m;
}

// Represents one physical parking slot.
class ParkingSlot {
private:
    string slotId;
    VehicleType supportedType;
    string zone;
    SlotStatus status;

public:
    ParkingSlot(string id, VehicleType type, string zoneName) {
        slotId = id;
        supportedType = type;
        zone = zoneName;
        status = SlotStatus::AVAILABLE;
    }

    string getSlotId() const { return slotId; }
    VehicleType getSupportedType() const { return supportedType; }
    string getZone() const { return zone; }
    SlotStatus getStatus() const { return status; }

    void updateDetails(string newId, VehicleType newType, string newZone) {
        slotId = newId;
        supportedType = newType;
        zone = newZone;
    }

    void occupy() { status = SlotStatus::OCCUPIED; }
    void release() { status = SlotStatus::AVAILABLE; }

    void display() const {
        cout << left << setw(15) << slotId
             << setw(15) << vehicleTypeToString(supportedType)
             << setw(22) << zone
             << setw(15) << statusToString(status) << endl;
    }
};

// Represents a vehicle that is currently parked.
class Vehicle {
private:
    string plateNumber;
    VehicleType type;
    int entryTime;
    string allocatedSlotId;

public:
    Vehicle() {}

    Vehicle(string plate, VehicleType vehicleType, int time, string slotId) {
        plateNumber = plate;
        type = vehicleType;
        entryTime = time;
        allocatedSlotId = slotId;
    }

    string getPlateNumber() const { return plateNumber; }
    VehicleType getType() const { return type; }
    int getEntryTime() const { return entryTime; }
    string getAllocatedSlotId() const { return allocatedSlotId; }

    void updateVehicle(string newPlate, VehicleType newType, int newEntryTime, string newSlotId) {
        plateNumber = newPlate;
        type = newType;
        entryTime = newEntryTime;
        allocatedSlotId = newSlotId;
    }
};

// Stores a completed parking session after exit and payment.
class ParkingRecord {
private:
    string plateNumber;
    VehicleType vehicleType;
    string slotId;
    int entryTime;
    int exitTime;
    int chargedHours;
    double fee;

public:
    ParkingRecord(string plate, VehicleType type, string slot,
                  int entry, int exit, int hours, double totalFee) {
        plateNumber = plate;
        vehicleType = type;
        slotId = slot;
        entryTime = entry;
        exitTime = exit;
        chargedHours = hours;
        fee = totalFee;
    }

    double getFee() const { return fee; }
    string getPlateNumber() const { return plateNumber; }
    string getSlotId() const { return slotId; }
    VehicleType getVehicleType() const { return vehicleType; }
    int getEntryTime() const { return entryTime; }
    int getExitTime() const { return exitTime; }
    int getChargedHours() const { return chargedHours; }

    void display() const {
        cout << left << setw(15) << plateNumber
             << setw(15) << vehicleTypeToString(vehicleType)
             << setw(15) << slotId
             << setw(15) << formatTime(entryTime)
             << setw(15) << formatTime(exitTime)
             << setw(15) << chargedHours
             << fixed << setprecision(0) << fee << " RWF" << endl;
    }
};

// Manages hourly rates by vehicle type.
class TariffManager {
private:
    unordered_map<string, double> rates;

public:
    TariffManager() {
        rates["Motorcycle"] = 500;
        rates["Car"] = 1000;
        rates["Truck"] = 2000;
    }

    double getRate(VehicleType type) {
        return rates[vehicleTypeToString(type)];
    }

    void updateRate(VehicleType type, double newRate) {
        rates[vehicleTypeToString(type)] = newRate;
    }

    void displayRates() {
        printHeader("Current Parking Rates");
        cout << left << setw(16) << "Vehicle Type" << "Rate\n";
        printLine('-', 32);
        cout << left << setw(16) << "Motorcycle" << fixed << setprecision(0) << rates["Motorcycle"] << " RWF/hour\n";
        cout << left << setw(16) << "Car" << fixed << setprecision(0) << rates["Car"] << " RWF/hour\n";
        cout << left << setw(16) << "Truck" << fixed << setprecision(0) << rates["Truck"] << " RWF/hour\n";
    }
};

// Coordinates slots, active vehicles, history, pricing, and file exports.
class SmartParkingSystem {
private:
    vector<ParkingSlot> slots;
    unordered_map<string, Vehicle> activeVehicles;
    vector<ParkingRecord> history;
    TariffManager tariffManager;

    // Check duplicate slot IDs before creating or renaming slots.
    bool slotExists(string slotId) {
        for (const ParkingSlot& slot : slots) {
            if (slot.getSlotId() == slotId) return true;
        }
        return false;
    }

    // Return the vector index for a slot ID, or -1 when missing.
    int findSlotIndex(string slotId) {
        for (int i = 0; i < (int)slots.size(); i++) {
            if (slots[i].getSlotId() == slotId) return i;
        }
        return -1;
    }

    // Find the first open slot that supports the selected vehicle type.
    int findAvailableSlot(VehicleType type) {
        for (int i = 0; i < (int)slots.size(); i++) {
            if (slots[i].getSupportedType() == type &&
                slots[i].getStatus() == SlotStatus::AVAILABLE) {
                return i;
            }
        }
        return -1;
    }

public:
    void configureSlot() {
        printHeader("Configure Parking Slot");

        string slotId = getValidSlotId("Enter slot ID: ");

        if (slotExists(slotId)) {
            printStatus("ERROR", "Slot ID already exists.");
            return;
        }

        VehicleType type = chooseVehicleType();
        string zone = getValidZone("Enter zone name: ");

        slots.push_back(ParkingSlot(slotId, type, zone));
        printStatus("SUCCESS", "Parking slot configured successfully.");
    }

    void updateParkingSlot() {
        printHeader("Update Parking Slot");

        if (slots.empty()) {
            printStatus("INFO", "No parking slots configured.");
            return;
        }

        string currentSlotId = getValidSlotId("Enter slot ID to update: ");
        int slotIndex = findSlotIndex(currentSlotId);

        if (slotIndex == -1) {
            printStatus("ERROR", "Parking slot not found.");
            return;
        }

        if (slots[slotIndex].getStatus() == SlotStatus::OCCUPIED) {
            printStatus("ERROR", "Occupied slots cannot be updated. Handle vehicle exit first.");
            return;
        }

        // Avoid creating two slots with the same ID.
        string newSlotId = getValidSlotId("Enter new slot ID: ");

        if (newSlotId != currentSlotId && slotExists(newSlotId)) {
            printStatus("ERROR", "New Slot ID already exists.");
            return;
        }

        VehicleType newType = chooseVehicleType();
        string newZone = getValidZone("Enter new zone name: ");

        slots[slotIndex].updateDetails(newSlotId, newType, newZone);
        printStatus("SUCCESS", "Parking slot updated successfully.");
    }

    void deleteParkingSlot() {
        printHeader("Delete Parking Slot");

        if (slots.empty()) {
            printStatus("INFO", "No parking slots configured.");
            return;
        }

        string slotId = getValidSlotId("Enter slot ID to delete: ");
        int slotIndex = findSlotIndex(slotId);

        if (slotIndex == -1) {
            printStatus("ERROR", "Parking slot not found.");
            return;
        }

        if (slots[slotIndex].getStatus() == SlotStatus::OCCUPIED) {
            printStatus("ERROR", "Occupied slots cannot be deleted. Handle vehicle exit first.");
            return;
        }

        slots.erase(slots.begin() + slotIndex);
        printStatus("SUCCESS", "Parking slot deleted successfully.");
    }

    void registerVehicleEntry() {
        printHeader("Vehicle Entry Registration");

        if (slots.empty()) {
            printStatus("INFO", "No parking slots configured. Add slots first.");
            return;
        }

        string plate = getValidPlateNumber("Enter vehicle plate number: ");

        if (activeVehicles.find(plate) != activeVehicles.end()) {
            printStatus("ERROR", "This vehicle is already parked.");
            return;
        }

        VehicleType type = chooseVehicleType();
        int slotIndex = findAvailableSlot(type);

        if (slotIndex == -1) {
            printStatus("INFO", "No available slot for " + vehicleTypeToString(type) + ".");
            return;
        }

        int entryTime = getValidTimeInMinutes("Enter entry time");

        string allocatedSlotId = slots[slotIndex].getSlotId();
        slots[slotIndex].occupy();

        activeVehicles.emplace(plate, Vehicle(plate, type, entryTime, allocatedSlotId));

        printStatus("SUCCESS", "Vehicle entry registered successfully.");
        cout << left << setw(18) << "Plate Number" << ": " << plate << endl;
        cout << left << setw(18) << "Vehicle Type" << ": " << vehicleTypeToString(type) << endl;
        cout << left << setw(18) << "Entry Time" << ": " << formatTime(entryTime) << endl;
        cout << left << setw(18) << "Allocated Slot" << ": " << allocatedSlotId << endl;
    }

    void updateVehicleEntry() {
        printHeader("Update Vehicle Entry");

        if (activeVehicles.empty()) {
            printStatus("INFO", "No vehicles are currently parked.");
            return;
        }

        string currentPlate = getValidPlateNumber("Enter current vehicle plate number: ");
        auto vehicleIterator = activeVehicles.find(currentPlate);

        if (vehicleIterator == activeVehicles.end()) {
            printStatus("ERROR", "Vehicle not found among currently parked vehicles.");
            return;
        }

        Vehicle oldVehicle = vehicleIterator->second;

        printSubHeader("Current Vehicle Entry");
        cout << left << setw(18) << "Plate Number" << ": " << oldVehicle.getPlateNumber() << endl;
        cout << left << setw(18) << "Vehicle Type" << ": " << vehicleTypeToString(oldVehicle.getType()) << endl;
        cout << left << setw(18) << "Entry Time" << ": " << formatTime(oldVehicle.getEntryTime()) << endl;
        cout << left << setw(18) << "Slot ID" << ": " << oldVehicle.getAllocatedSlotId() << endl;
        cout << endl;

        string newPlate = getValidPlateNumber("Enter new plate number: ");

        if (newPlate != currentPlate && activeVehicles.find(newPlate) != activeVehicles.end()) {
            printStatus("ERROR", "Another currently parked vehicle already uses this plate number.");
            return;
        }

        VehicleType newType = chooseVehicleType();
        int newEntryTime = getValidTimeInMinutes("Enter new entry time");

        string oldSlotId = oldVehicle.getAllocatedSlotId();
        int oldSlotIndex = findSlotIndex(oldSlotId);

        if (oldSlotIndex == -1) {
            printStatus("ERROR", "Old allocated slot was not found. Update cancelled.");
            return;
        }

        string newSlotId = oldSlotId;

        if (newType != oldVehicle.getType()) {
            // Changing vehicle type may require moving to a compatible slot.
            int newSlotIndex = findAvailableSlot(newType);

            if (newSlotIndex == -1) {
                printStatus("INFO", "No available slot for " + vehicleTypeToString(newType) + ". Update cancelled.");
                return;
            }

            slots[oldSlotIndex].release();
            slots[newSlotIndex].occupy();
            newSlotId = slots[newSlotIndex].getSlotId();
        }

        activeVehicles.erase(vehicleIterator);
        activeVehicles.emplace(newPlate, Vehicle(newPlate, newType, newEntryTime, newSlotId));

        printStatus("SUCCESS", "Vehicle entry updated successfully.");
        cout << left << setw(18) << "Plate Number" << ": " << newPlate << endl;
        cout << left << setw(18) << "Vehicle Type" << ": " << vehicleTypeToString(newType) << endl;
        cout << left << setw(18) << "Entry Time" << ": " << formatTime(newEntryTime) << endl;
        cout << left << setw(18) << "Allocated Slot" << ": " << newSlotId << endl;
    }

    void handleVehicleExit() {
        printHeader("Vehicle Exit and Payment");

        if (activeVehicles.empty()) {
            printStatus("INFO", "No vehicles are currently parked.");
            return;
        }

        string plate = getValidPlateNumber("Enter vehicle plate number: ");
        auto vehicleIterator = activeVehicles.find(plate);

        if (vehicleIterator == activeVehicles.end()) {
            printStatus("ERROR", "Vehicle not found among currently parked vehicles.");
            return;
        }

        Vehicle vehicle = vehicleIterator->second;
        int exitTime = getValidTimeInMinutes("Enter exit time");

        if (exitTime <= vehicle.getEntryTime()) {
            printStatus("ERROR", "Exit time must be later than entry time within the same day.");
            return;
        }

        int durationMinutes = exitTime - vehicle.getEntryTime();
        // Any partial hour is charged as a full hour.
        int chargedHours = static_cast<int>(ceil(durationMinutes / 60.0));
        double rate = tariffManager.getRate(vehicle.getType());
        double fee = chargedHours * rate;

        int slotIndex = findSlotIndex(vehicle.getAllocatedSlotId());

        if (slotIndex != -1) {
            slots[slotIndex].release();
        }

        history.push_back(
            ParkingRecord(
                vehicle.getPlateNumber(),
                vehicle.getType(),
                vehicle.getAllocatedSlotId(),
                vehicle.getEntryTime(),
                exitTime,
                chargedHours,
                fee
            )
        );

        // Remove the vehicle from active parking after recording history.
        activeVehicles.erase(vehicleIterator);

        printStatus("SUCCESS", "Vehicle exited successfully.");
        printSubHeader("Payment Receipt");
        cout << left << setw(18) << "Plate Number" << ": " << vehicle.getPlateNumber() << endl;
        cout << left << setw(18) << "Vehicle Type" << ": " << vehicleTypeToString(vehicle.getType()) << endl;
        cout << left << setw(18) << "Slot ID" << ": " << vehicle.getAllocatedSlotId() << endl;
        cout << left << setw(18) << "Entry Time" << ": " << formatTime(vehicle.getEntryTime()) << endl;
        cout << left << setw(18) << "Exit Time" << ": " << formatTime(exitTime) << endl;
        cout << left << setw(18) << "Duration" << ": " << durationMinutes << " minutes\n";
        cout << left << setw(18) << "Charged Hours" << ": " << chargedHours << endl;
        cout << left << setw(18) << "Total Fee" << ": " << fixed << setprecision(0) << fee << " RWF\n";
    }

    void updateParkingRate() {
        printHeader("Update Parking Price");

        VehicleType type = chooseVehicleType();
        double newRate = getValidDouble("Enter new hourly rate: ", 1);

        tariffManager.updateRate(type, newRate);
        printStatus("SUCCESS", "Parking rate updated successfully.");
    }

    void displaySlots() {
        if (slots.empty()) {
            printStatus("INFO", "No parking slots configured.");
            return;
        }

        printHeader("All Parking Slots");
        printSlotTableHeader();

        for (const ParkingSlot& slot : slots) slot.display();
    }

    void displayAvailableSlots() {
        bool found = false;

        printHeader("Available Parking Slots");
        printSlotTableHeader();

        for (const ParkingSlot& slot : slots) {
            if (slot.getStatus() == SlotStatus::AVAILABLE) {
                slot.display();
                found = true;
            }
        }

        if (!found) printStatus("INFO", "No available slots.");
    }

    void displayParkedVehicles() {
        if (activeVehicles.empty()) {
            printStatus("INFO", "No vehicles are currently parked.");
            return;
        }

        printHeader("Currently Parked Vehicles");
        printLine('-', 72);
        cout << left << setw(15) << "Plate"
             << setw(15) << "Type"
             << setw(15) << "Slot ID"
             << setw(15) << "Entry Time" << endl;
        printLine('-', 72);

        for (const auto& pair : activeVehicles) {
            Vehicle v = pair.second;
            cout << left << setw(15) << v.getPlateNumber()
                 << setw(15) << vehicleTypeToString(v.getType())
                 << setw(15) << v.getAllocatedSlotId()
                 << setw(15) << formatTime(v.getEntryTime()) << endl;
        }
    }

    void displayHistory() {
        if (history.empty()) {
            printStatus("INFO", "No completed parking records found.");
            return;
        }

        printHeader("Parking History");
        printLine('-', 92);
        cout << left << setw(15) << "Plate"
             << setw(15) << "Type"
             << setw(15) << "Slot"
             << setw(15) << "Entry"
             << setw(15) << "Exit"
             << setw(15) << "Hours"
             << "Fee" << endl;
        printLine('-', 92);

        for (const ParkingRecord& record : history) record.display();
    }

    double calculateDailyRevenue() {
        double total = 0;
        for (const ParkingRecord& record : history) total += record.getFee();
        return total;
    }

    void displayDailyRevenue() {
        printHeader("Daily Revenue");
        cout << left << setw(18) << "Total Revenue" << ": "
             << fixed << setprecision(0) << calculateDailyRevenue() << " RWF\n";
    }

    void displayRates() {
        tariffManager.displayRates();
    }

    void saveParkingSlotsToFile() {
        ofstream file("parking_slots.txt");

        if (!file) {
            cout << "Error: Could not save parking_slots.txt\n";
            return;
        }

        file << "Slot_ID Vehicle_Type Zone Status\n";

        for (const ParkingSlot& slot : slots) {
            file << slot.getSlotId() << " "
                 << vehicleTypeToString(slot.getSupportedType()) << " "
                 << "\"" << slot.getZone() << "\" "
                 << statusToString(slot.getStatus()) << endl;
        }

        file.close();
    }

    void saveParkingHistoryToFile() {
        ofstream file("parking_history.txt");

        if (!file) {
            cout << "Error: Could not save parking_history.txt\n";
            return;
        }

        file << "Plate Vehicle_Type Slot_ID Entry_Time Exit_Time Charged_Hours Fee_RWF\n";

        for (const ParkingRecord& record : history) {
            file << record.getPlateNumber() << " "
                 << vehicleTypeToString(record.getVehicleType()) << " "
                 << record.getSlotId() << " "
                 << formatTime(record.getEntryTime()) << " "
                 << formatTime(record.getExitTime()) << " "
                 << record.getChargedHours() << " "
                 << fixed << setprecision(0) << record.getFee() << endl;
        }

        file.close();
    }

    void saveRevenueToFile() {
        ofstream file("daily_revenue.txt");

        if (!file) {
            cout << "Error: Could not save daily_revenue.txt\n";
            return;
        }

        file << "Daily_Revenue_RWF\n";
        file << fixed << setprecision(0) << calculateDailyRevenue() << endl;

        file.close();
    }

    void saveAllDataToFiles() {
        // Export the current reports in separate text files.
        saveParkingSlotsToFile();
        saveParkingHistoryToFile();
        saveRevenueToFile();

        printStatus("SUCCESS", "Data saved successfully.");
        cout << "  1. parking_slots.txt\n";
        cout << "  2. parking_history.txt\n";
        cout << "  3. daily_revenue.txt\n";
    }
};

void welcomeScreen() {
    printHeader("Smart Parking Management System");
    cout << "  Kigali City Parking Console\n\n";
    cout << "  Manage slots, vehicle entries, payments, rates, and reports\n";
    cout << "\nPress Enter to continue...";
    cin.get();
}

void displayMenu() {
    printHeader("Main Menu");

    cout << "  Slot Management\n";
    cout << "    1.  Configure parking slot\n";
    cout << "    2.  Update parking slot\n";
    cout << "    3.  Delete parking slot\n\n";

    cout << "  Vehicle Operations\n";
    cout << "    4.  Register vehicle entry\n";
    cout << "    5.  Update vehicle entry\n";
    cout << "    6.  Handle vehicle exit and payment\n\n";

    cout << "  Reports and Rates\n";
    cout << "    7.  Update parking price\n";
    cout << "    8.  Display all parking slots\n";
    cout << "    9.  Display available slots\n";
    cout << "    10. Display currently parked vehicles\n";
    cout << "    11. Display vehicle parking history\n";
    cout << "    12. Display daily revenue\n";
    cout << "    13. Display current parking rates\n\n";

    cout << "  System\n";
    cout << "    14. Save data to files\n";
    cout << "    15. Exit\n";

    printLine('=', 72);
}

int main() {
    SmartParkingSystem system;

    welcomeScreen();

    while (true) {
        displayMenu();

        int choice = getValidInt("Enter your choice: ", 1, 15);

        // Route each menu option to its matching system action.
        switch (choice) {
            case 1: system.configureSlot(); break;
            case 2: system.updateParkingSlot(); break;
            case 3: system.deleteParkingSlot(); break;
            case 4: system.registerVehicleEntry(); break;
            case 5: system.updateVehicleEntry(); break;
            case 6: system.handleVehicleExit(); break;
            case 7: system.updateParkingRate(); break;
            case 8: system.displaySlots(); break;
            case 9: system.displayAvailableSlots(); break;
            case 10: system.displayParkedVehicles(); break;
            case 11: system.displayHistory(); break;
            case 12: system.displayDailyRevenue(); break;
            case 13: system.displayRates(); break;
            case 14: system.saveAllDataToFiles(); break;
            case 15:
                system.saveAllDataToFiles();
                printHeader("Goodbye");
                cout << "  Thank you for using Smart Parking Management System.\n";
                cout << "  System closed successfully.\n";
                return 0;
        }

        waitForEnter();
    }
}
