# Smart Parking Management System

A console-based C++ parking management system for configuring parking slots, registering vehicle entry and exit, calculating parking fees, tracking parking history, and saving reports to text files.

The project is built around a Kigali City smart parking scenario and demonstrates basic data structures such as `vector` and `unordered_map`, along with file handling, input validation, and object-oriented programming.

## Features

- Configure parking slots by slot ID, supported vehicle type, and zone.
- Register vehicle entry and automatically allocate the first available matching slot.
- Handle vehicle exit, release the slot, and calculate the parking fee.
- Update hourly parking prices for motorcycles, cars, and trucks.
- Display all slots, available slots, currently parked vehicles, parking history, and daily revenue.
- Save parking slot data, parking history, and revenue reports to text files.

## Vehicle Types

The system supports three vehicle categories:

- Motorcycle
- Car
- Truck

Default hourly rates:

| Vehicle Type | Rate |
| --- | ---: |
| Motorcycle | 500 RWF/hour |
| Car | 1000 RWF/hour |
| Truck | 2000 RWF/hour |

Rates can be changed from the program menu while the program is running.

## Project Files

| File | Description |
| --- | --- |
| `vehicle_management_system.cpp` | Main C++ source code for the parking system. |
| `vehicle_management_system.exe` | Compiled Windows executable, if already built. |
| `parking_slots.txt` | Generated report containing configured parking slots. |
| `parking_history.txt` | Generated report containing completed parking records. |
| `daily_revenue.txt` | Generated report containing total daily revenue. |

The `.txt` report files are created when you choose **Save data to files** or when you exit the program normally.

## Requirements

- A C++ compiler that supports C++11 or later.
- Windows terminal, PowerShell, Command Prompt, or another terminal.

For example, you can use `g++` from MinGW-w64.

## How to Compile

Open a terminal in this project directory and run:

```bash
g++ vehicle_management_system.cpp -o vehicle_management_system.exe
```

If your compiler requires a standard version, use:

```bash
g++ -std=c++11 vehicle_management_system.cpp -o vehicle_management_system.exe
```

## How to Run

On Windows:

```bash
.\vehicle_management_system.exe
```

Then follow the menu prompts.

## Menu Options

When the program starts, it displays these options:

1. Configure parking slot
2. Register vehicle entry
3. Handle vehicle exit and payment
4. Update parking price
5. Display all parking slots
6. Display available slots
7. Display currently parked vehicles
8. Display vehicle parking history
9. Display daily revenue
10. Display current parking rates
11. Save data to files
12. Exit

## Input Rules

- Slot IDs must contain numbers only.
- Zone names may contain letters, spaces, and hyphens.
- Plate numbers may contain letters, numbers, and hyphens.
- Time must be entered in `HH:MM` format, such as `08:30` or `17:45`.
- Exit time must be later than entry time on the same day.

## Fee Calculation

Parking fees are calculated using this formula:

```text
charged hours = parking duration rounded up to the next full hour
fee = charged hours * vehicle hourly rate
```

Example:

```text
Entry time: 08:15
Exit time : 10:05
Duration  : 110 minutes
Charged   : 2 hours
```

## Saved Reports

The system saves three files:

- `parking_slots.txt`
  - Slot ID
  - Vehicle type
  - Zone
  - Slot status

- `parking_history.txt`
  - Plate number
  - Vehicle type
  - Slot ID
  - Entry time
  - Exit time
  - Charged hours
  - Fee in RWF

- `daily_revenue.txt`
  - Total daily revenue in RWF

## Notes

- Data is stored in memory while the program is running.
- The program saves reports to text files, but it does not currently reload saved data when started again.
- Parking records are only added to history after a vehicle exits.

## Author

Developed BY Iradukunda Joyeuse
