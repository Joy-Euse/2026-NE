#include <iostream>
#include <vector>
#include <unordered_map>
#include <iomanip>
#include <limits>
#include <regex>
#include <algorithm>
#include <cmath>

using namespace std;

enum class VehicleType {
    MOTORCYCLE = 1,
    CAR = 2,
    TRUCK = 3
};

enum class SlotStatus {
    AVAILABLE,
    OCCUPIED
};

string toUpperCase(string text) {
    transform(text.begin(), text.end(), text.begin(), ::toupper);
    return text;
}

string trim(string text) {
    while (!text.empty() && isspace(text.front())) {
        text.erase(text.begin());
    }

    while (!text.empty() && isspace(text.back())) {
        text.pop_back();
    }

    return text;
}

void clearInput() {
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

string vehicleTypeToString(VehicleType type) {
    switch (type) {
        case VehicleType::MOTORCYCLE:
            return "Motorcycle";
        case VehicleType::CAR:
            return "Car";
        case VehicleType::TRUCK:
            return "Truck";
        default:
            return "Unknown";
    }
}

string statusToString(SlotStatus status) {
    return status == SlotStatus::AVAILABLE ? "Available" : "Occupied";
}

int getValidInt(string message, int minValue, int maxValue) {
    int value;

    while (true) {
        cout << message;

        if (cin >> value && value >= minValue && value <= maxValue) {
            clearInput();
            return value;
        }

        cout << "Invalid input. Enter a number between "
             << minValue << " and " << maxValue << ".\n";

        clearInput();
    }
}

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

string getNonEmptyText(string message) {
    string value;

    while (true) {
        cout << message;
        getline(cin, value);
        value = trim(value);

        if (!value.empty()) {
            return value;
        }

        cout << "Input cannot be empty. Please try again.\n";
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

        if (isValidZoneName(zone)) {
            return zone;
        }

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

        if (isValidPlateNumber(plate)) {
            return plate;
        }

        cout << "Invalid plate number. Use letters, numbers, or hyphens only.\n";
    }
}

VehicleType chooseVehicleType() {
    cout << "\nVehicle Types:\n";
    cout << "1. Motorcycle\n";
    cout << "2. Car\n";
    cout << "3. Truck\n";

    int choice = getValidInt("Choose vehicle type: ", 1, 3);

    if (choice == 1) return VehicleType::MOTORCYCLE;
    if (choice == 2) return VehicleType::CAR;
    return VehicleType::TRUCK;
}

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

    string getSlotId() const {
        return slotId;
    }

    VehicleType getSupportedType() const {
        return supportedType;
    }

    string getZone() const {
        return zone;
    }

    SlotStatus getStatus() const {
        return status;
    }

    void occupy() {
        status = SlotStatus::OCCUPIED;
    }

    void release() {
        status = SlotStatus::AVAILABLE;
    }

    void display() const {
        cout << left << setw(15) << slotId
             << setw(15) << vehicleTypeToString(supportedType)
             << setw(20) << zone
             << setw(15) << statusToString(status) << endl;
    }
};

class Vehicle {
private:
    string plateNumber;
    VehicleType type;
    int entryTime;
    string allocatedSlotId;

public:
    Vehicle(string plate, VehicleType vehicleType, int time, string slotId) {
        plateNumber = plate;
        type = vehicleType;
        entryTime = time;
        allocatedSlotId = slotId;
    }

    string getPlateNumber() const {
        return plateNumber;
    }

    VehicleType getType() const {
        return type;
    }

    int getEntryTime() const {
        return entryTime;
    }

    string getAllocatedSlotId() const {
        return allocatedSlotId;
    }
};

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

    double getFee() const {
        return fee;
    }

    string getPlateNumber() const {
        return plateNumber;
    }

    void display() const {
        cout << left << setw(15) << plateNumber
             << setw(15) << vehicleTypeToString(vehicleType)
             << setw(15) << slotId
             << setw(15) << chargedHours
             << setw(15) << fixed << setprecision(0) << fee << " RWF" << endl;
    }
};

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
        cout << "\nCurrent Parking Rates:\n";
        cout << "Motorcycle: " << rates["Motorcycle"] << " RWF/hour\n";
        cout << "Car: " << rates["Car"] << " RWF/hour\n";
        cout << "Truck: " << rates["Truck"] << " RWF/hour\n";
    }
};

class SmartParkingSystem {
private:
    vector<ParkingSlot> slots;
    unordered_map<string, Vehicle> activeVehicles;
    vector<ParkingRecord> history;
    TariffManager tariffManager;

    bool slotExists(string slotId) {
        for (const ParkingSlot& slot : slots) {
            if (toUpperCase(slot.getSlotId()) == toUpperCase(slotId)) {
                return true;
            }
        }
        return false;
    }

    int findSlotIndex(string slotId) {
        for (int i = 0; i < slots.size(); i++) {
            if (toUpperCase(slots[i].getSlotId()) == toUpperCase(slotId)) {
                return i;
            }
        }
        return -1;
    }

    int findAvailableSlot(VehicleType type) {
        for (int i = 0; i < slots.size(); i++) {
            if (slots[i].getSupportedType() == type &&
                slots[i].getStatus() == SlotStatus::AVAILABLE) {
                return i;
            }
        }
        return -1;
    }

public:
    void configureSlot() {
        string slotId = toUpperCase(getNonEmptyText("Enter slot ID: "));

        if (slotExists(slotId)) {
            cout << "Slot ID already exists. Duplicate slots are not allowed.\n";
            return;
        }

        VehicleType type = chooseVehicleType();
        string zone = getValidZone("Enter zone name: ");

        slots.push_back(ParkingSlot(slotId, type, zone));

        cout << "Parking slot configured successfully.\n";
    }

    void registerVehicleEntry() {
        if (slots.empty()) {
            cout << "No parking slots configured. Add slots first.\n";
            return;
        }

        string plate = getValidPlateNumber("Enter vehicle plate number: ");

        if (activeVehicles.find(plate) != activeVehicles.end()) {
            cout << "This vehicle is already parked.\n";
            return;
        }

        VehicleType type = chooseVehicleType();

        int slotIndex = findAvailableSlot(type);

        if (slotIndex == -1) {
            cout << "No available slot for " << vehicleTypeToString(type) << ".\n";
            return;
        }

        int entryTime = getValidTimeInMinutes("Enter entry time");

        string allocatedSlotId = slots[slotIndex].getSlotId();
        slots[slotIndex].occupy();

        activeVehicles.emplace(
            plate,
            Vehicle(plate, type, entryTime, allocatedSlotId)
        );

        cout << "Vehicle entry registered successfully.\n";
        cout << "Allocated Slot: " << allocatedSlotId << endl;
    }

    void handleVehicleExit() {
        if (activeVehicles.empty()) {
            cout << "No vehicles are currently parked.\n";
            return;
        }

        string plate = getValidPlateNumber("Enter vehicle plate number: ");

        auto vehicleIterator = activeVehicles.find(plate);

        if (vehicleIterator == activeVehicles.end()) {
            cout << "Vehicle not found among currently parked vehicles.\n";
            return;
        }

        Vehicle vehicle = vehicleIterator->second;

        int exitTime = getValidTimeInMinutes("Enter exit time");

        if (exitTime <= vehicle.getEntryTime()) {
            cout << "Exit time must be later than entry time within the same day.\n";
            return;
        }

        int durationMinutes = exitTime - vehicle.getEntryTime();
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

        activeVehicles.erase(vehicleIterator);

        cout << "\nVehicle exited successfully.\n";
        cout << "Duration: " << durationMinutes << " minutes\n";
        cout << "Charged Hours: " << chargedHours << endl;
        cout << "Total Fee: " << fixed << setprecision(0) << fee << " RWF\n";
    }

    void updateParkingRate() {
        VehicleType type = chooseVehicleType();

        double newRate = getValidDouble("Enter new hourly rate: ", 1);

        tariffManager.updateRate(type, newRate);

        cout << "Parking rate updated successfully.\n";
    }

    void displaySlots() {
        if (slots.empty()) {
            cout << "No parking slots configured.\n";
            return;
        }

        cout << "\nParking Slots:\n";
        cout << left << setw(15) << "Slot ID"
             << setw(15) << "Type"
             << setw(20) << "Zone"
             << setw(15) << "Status" << endl;

        for (const ParkingSlot& slot : slots) {
            slot.display();
        }
    }

    void displayAvailableSlots() {
        bool found = false;

        cout << "\nAvailable Slots:\n";
        cout << left << setw(15) << "Slot ID"
             << setw(15) << "Type"
             << setw(20) << "Zone"
             << setw(15) << "Status" << endl;

        for (const ParkingSlot& slot : slots) {
            if (slot.getStatus() == SlotStatus::AVAILABLE) {
                slot.display();
                found = true;
            }
        }

        if (!found) {
            cout << "No available slots.\n";
        }
    }

    void displayParkedVehicles() {
        if (activeVehicles.empty()) {
            cout << "No vehicles are currently parked.\n";
            return;
        }

        cout << "\nCurrently Parked Vehicles:\n";
        cout << left << setw(15) << "Plate"
             << setw(15) << "Type"
             << setw(15) << "Slot ID"
             << setw(15) << "Entry Time" << endl;

        for (const auto& pair : activeVehicles) {
            Vehicle v = pair.second;

            cout << left << setw(15) << v.getPlateNumber()
                 << setw(15) << vehicleTypeToString(v.getType())
                 << setw(15) << v.getAllocatedSlotId()
                 << setw(15) << v.getEntryTime() << " mins" << endl;
        }
    }

    void displayHistory() {
        if (history.empty()) {
            cout << "No completed parking records found.\n";
            return;
        }

        cout << "\nParking History:\n";
        cout << left << setw(15) << "Plate"
             << setw(15) << "Type"
             << setw(15) << "Slot"
             << setw(15) << "Hours"
             << setw(15) << "Fee" << endl;

        for (const ParkingRecord& record : history) {
            record.display();
        }
    }

    void displayDailyRevenue() {
        double total = 0;

        for (const ParkingRecord& record : history) {
            total += record.getFee();
        }

        cout << "\nDaily Revenue: " << fixed << setprecision(0) << total << " RWF\n";
    }

    void displayRates() {
        tariffManager.displayRates();
    }
};

void displayMenu() {
    cout << "\n========== SMART PARKING MANAGEMENT SYSTEM ==========\n";
    cout << "1. Configure parking slot\n";
    cout << "2. Register vehicle entry\n";
    cout << "3. Handle vehicle exit and payment\n";
    cout << "4. Update parking price\n";
    cout << "5. Display all parking slots\n";
    cout << "6. Display available slots\n";
    cout << "7. Display currently parked vehicles\n";
    cout << "8. Display vehicle parking history\n";
    cout << "9. Display daily revenue\n";
    cout << "10. Display current parking rates\n";
    cout << "11. Exit\n";
}

int main() {
    SmartParkingSystem system;

    while (true) {
        displayMenu();

        int choice = getValidInt("Enter your choice: ", 1, 11);

        switch (choice) {
            case 1:
                system.configureSlot();
                break;

            case 2:
                system.registerVehicleEntry();
                break;

            case 3:
                system.handleVehicleExit();
                break;

            case 4:
                system.updateParkingRate();
                break;

            case 5:
                system.displaySlots();
                break;

            case 6:
                system.displayAvailableSlots();
                break;

            case 7:
                system.displayParkedVehicles();
                break;

            case 8:
                system.displayHistory();
                break;

            case 9:
                system.displayDailyRevenue();
                break;

            case 10:
                system.displayRates();
                break;

            case 11:
                cout << "Exiting Smart Parking Management System...\n";
                return 0;
        }
    }

    return 0;
}