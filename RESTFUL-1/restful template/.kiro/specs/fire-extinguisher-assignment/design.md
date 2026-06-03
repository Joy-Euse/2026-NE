# Fire Extinguisher Assignment Feature - Design Document

## Overview

The Fire Extinguisher Assignment feature enables a structured workflow where ADMINs assign fire extinguishers to USERs, USERs request inspections for their assigned equipment, and ADMINs assign INSPECTORs to complete those inspections. The system provides notifications and audit logging at each stage.

---

## Architecture

### System Context
- **Services Involved**: 
  - `extinguisher-service` (port 4003) - Manages assignments
  - `inspection-service` (port 4004) - Manages inspection workflow
  - `notification-service` (port 4005) - Sends notifications
  - `audit-log-service` (port 4007) - Records audit logs
  - `api-gateway` (port 4000) - Routes all requests

### Communication Pattern
- Service-to-service HTTP calls for cross-service operations
- JWT token forwarding for authentication context
- Synchronous request/response model

---

## Database Design

### Extinguisher Service Schema

#### ExtinguisherAssignment Model
```prisma
model ExtinguisherAssignment {
  id                String           @id @default(uuid())
  extinguisherId    String           @unique @map("extinguisher_id")
  assignedUserId    String           @map("assigned_user_id")
  assignedByAdminId String           @map("assigned_by_admin_id")
  assignedAt        DateTime         @default(now()) @map("assigned_at")
  notes             String?
  extinguisher      FireExtinguisher @relation(fields: [extinguisherId], references: [id], onDelete: Cascade)

  @@index([assignedUserId])
  @@map("extinguisher_assignments")
}
```

**Relationships**:
- One-to-one with `FireExtinguisher` (enforced by `@unique` on `extinguisherId`)
- Cascade delete: removing extinguisher removes assignment

**Indexes**:
- `assignedUserId` - for fast lookup of user's assignments

---

### Inspection Service Schema

#### Updated Inspection Model
```prisma
model Inspection {
  id                  String             @id @default(uuid())
  extinguisherId       String             @map("extinguisher_id")
  scheduledByUserId    String             @map("scheduled_by_user_id")
  assignedInspectorId  String?            @map("assigned_inspector_id")
  assignedByAdminId    String?            @map("assigned_by_admin_id")  // NEW
  inspectionDate       DateTime           @map("inspection_date") @db.Date
  inspectionTime       String             @map("inspection_time")
  status               InspectionStatus   @default(REQUESTED)  // CHANGED
  result               InspectionResult?
  resultNotes          String?            @map("result_notes")
  cancelReason         String?            @map("cancel_reason")
  completedAt          DateTime?          @map("completed_at")
  cancelledAt          DateTime?          @map("cancelled_at")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")
  maintenanceLogs      MaintenanceLog[]

  @@index([extinguisherId, inspectionDate])
  @@index([assignedInspectorId, status])
  @@index([status, inspectionDate])
  @@map("inspections")
}
```

#### Updated InspectionStatus Enum
```prisma
enum InspectionStatus {
  REQUESTED   // NEW - USER requested inspection, waiting for inspector
  ASSIGNED    // NEW - ADMIN assigned inspector
  SCHEDULED   // Existing - direct scheduling by ADMIN/INSPECTOR
  COMPLETED   // Existing
  CANCELLED   // Existing
  OVERDUE     // Existing
}
```

**Key Changes**:
1. Added `assignedByAdminId` column to track which admin assigned the inspector
2. Added `REQUESTED` and `ASSIGNED` statuses to support the workflow
3. Changed default status from `SCHEDULED` to `REQUESTED`

---

## API Specification

### Extinguisher Service APIs

#### 1. Assign Extinguisher to User
**Endpoint**: `POST /api/extinguishers/:id/assign`  
**Auth**: ADMIN only  
**Request Body**:
```json
{
  "assignedUserId": "uuid",
  "notes": "Optional assignment notes"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "assignment": {
      "id": "uuid",
      "extinguisherId": "uuid",
      "assignedUserId": "uuid",
      "assignedByAdminId": "uuid",
      "assignedAt": "2026-06-03T10:30:00.000Z",
      "notes": "Office area responsibility"
    }
  }
}
```

**Business Rules**:
- Can reassign (upsert logic) - updates existing assignment
- Cannot assign RETIRED extinguishers
- Sends notifications to assigned user and admin
- Creates audit log entry

---

#### 2. List My Assigned Extinguishers
**Endpoint**: `GET /api/extinguishers/my`  
**Auth**: USER only  
**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional filter by ExtinguisherStatus)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "serialNumber": "EXT-001",
      "location": "Building A - Floor 2",
      "building": "Building A",
      "floor": "2",
      "zone": "East Wing",
      "type": "CO2",
      "size": "5 lb",
      "installationDate": "2025-01-15",
      "expiryDate": "2027-01-15",
      "status": "ACTIVE",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-06-03T10:30:00.000Z",
      "assignment": {
        "id": "uuid",
        "assignedUserId": "uuid",
        "assignedByAdminId": "uuid",
        "assignedAt": "2026-06-03T10:30:00.000Z",
        "notes": "Office area responsibility"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

**Business Rules**:
- Shows only extinguishers assigned to the authenticated user
- Includes assignment details in response

---

#### 3. Remove Extinguisher Assignment
**Endpoint**: `DELETE /api/extinguishers/:id/assignment`  
**Auth**: ADMIN only  

**Response** (200):
```json
{
  "success": true,
  "message": "Assignment removed successfully"
}
```

**Error** (404):
```json
{
  "success": false,
  "error": {
    "code": "ASSIGNMENT_NOT_FOUND",
    "message": "This extinguisher has no active assignment"
  }
}
```

**Business Rules**:
- Notifies the previously assigned user
- Creates audit log entry
- Returns 404 if no assignment exists

---

### Inspection Service APIs

#### 4. Create Inspection (Role-Aware)
**Endpoint**: `POST /api/inspections`  
**Auth**: USER, INSPECTOR, or ADMIN  
**Request Body**:
```json
{
  "extinguisherId": "uuid",
  "inspectionDate": "2026-06-15",
  "inspectionTime": "14:30",
  "assignedInspectorId": "uuid (optional, ADMIN/INSPECTOR only)"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "extinguisherId": "uuid",
    "scheduledByUserId": "uuid",
    "assignedInspectorId": null,
    "assignedByAdminId": null,
    "inspectionDate": "2026-06-15",
    "inspectionTime": "14:30",
    "status": "REQUESTED",
    "result": null,
    "resultNotes": null,
    "cancelReason": null,
    "completedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-06-03T11:00:00.000Z",
    "updatedAt": "2026-06-03T11:00:00.000Z"
  }
}
```

**Business Rules**:
- **USER role**: 
  - Can only create inspections for their assigned extinguishers
  - Initial status is `REQUESTED`
  - Verifies ownership via extinguisher-service
- **ADMIN/INSPECTOR role**:
  - Can create inspections for any extinguisher
  - Initial status is `SCHEDULED`
  - Can optionally assign inspector immediately

---

#### 5. Assign Inspector to Inspection
**Endpoint**: `PATCH /api/inspections/:id/assign-inspector`  
**Auth**: ADMIN only  
**Request Body**:
```json
{
  "assignedInspectorId": "uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "extinguisherId": "uuid",
    "scheduledByUserId": "uuid",
    "assignedInspectorId": "uuid",
    "assignedByAdminId": "uuid",
    "inspectionDate": "2026-06-15",
    "inspectionTime": "14:30",
    "status": "ASSIGNED",
    "result": null,
    "resultNotes": null,
    "cancelReason": null,
    "completedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-06-03T11:00:00.000Z",
    "updatedAt": "2026-06-03T11:15:00.000Z"
  }
}
```

**Business Rules**:
- Can only assign inspector to `REQUESTED` or `ASSIGNED` inspections
- Changes status to `ASSIGNED`
- Validates inspector has INSPECTOR role
- Notifies both the assigned inspector and the requesting user
- Creates audit log entry

---

## Workflow Diagrams

### Complete Assignment → Inspection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ADMIN assigns extinguisher to USER                           │
│    POST /api/extinguishers/:id/assign                           │
│    ↓                                                             │
│    • ExtinguisherAssignment created                             │
│    • Notifications sent (USER + ADMIN)                          │
│    • Audit log recorded                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. USER views assigned extinguishers                            │
│    GET /api/extinguishers/my                                    │
│    ↓                                                             │
│    • Returns only extinguishers assigned to USER                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. USER requests inspection                                     │
│    POST /api/inspections (role=USER)                            │
│    ↓                                                             │
│    • Verifies USER owns extinguisher                            │
│    • Creates inspection with status=REQUESTED                   │
│    • Audit log recorded (for ADMIN to pick up)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. ADMIN assigns INSPECTOR to inspection                        │
│    PATCH /api/inspections/:id/assign-inspector                  │
│    ↓                                                             │
│    • Status changes REQUESTED → ASSIGNED                        │
│    • Notifications sent (INSPECTOR + requesting USER)           │
│    • Audit log recorded                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. INSPECTOR completes inspection                               │
│    PATCH /api/inspections/:id/complete                          │
│    ↓                                                             │
│    • Status changes to COMPLETED                                │
│    • Result and notes recorded                                  │
│    • Notifications sent (requesting USER + assigning ADMIN)     │
│    • Audit log recorded                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Access Control Matrix

| Endpoint | USER | INSPECTOR | ADMIN |
|----------|------|-----------|-------|
| `POST /extinguishers/:id/assign` | ❌ | ❌ | ✅ |
| `GET /extinguishers/my` | ✅ | ❌ | ❌ |
| `DELETE /extinguishers/:id/assignment` | ❌ | ❌ | ✅ |
| `POST /inspections` (status=REQUESTED) | ✅* | ❌ | ❌ |
| `POST /inspections` (status=SCHEDULED) | ❌ | ✅ | ✅ |
| `PATCH /inspections/:id/assign-inspector` | ❌ | ❌ | ✅ |
| `PATCH /inspections/:id/complete` | ❌ | ✅** | ✅ |

*Only for owned extinguishers  
**Only for assigned inspections

---

## Service Communication

### Assignment Verification (Inspection → Extinguisher)

**Purpose**: Verify USER owns the extinguisher before allowing inspection request

**Client**: `assignment-service.client.js` in inspection-service  
**Target**: `GET /internal/extinguishers/:id/verify-assignment/:userId` in extinguisher-service

**Flow**:
```javascript
// inspection-service calls extinguisher-service
const isAssigned = await verifyUserAssignment({
  req,                    // forwards JWT token
  extinguisherId: "uuid",
  userId: "uuid"
});

// extinguisher-service checks assignment table
const assignment = await prisma.extinguisherAssignment.findFirst({
  where: { 
    extinguisherId: "uuid",
    assignedUserId: "uuid"
  }
});

if (!assignment) {
  throw new Error("User does not own this extinguisher");
}
```

---

## Notification Events

| Event | Recipient | Trigger | Type |
|-------|-----------|---------|------|
| Extinguisher Assigned | USER | ADMIN assigns | `EXTINGUISHER_ASSIGNED` |
| Assignment Confirmed | ADMIN | Assignment created | `EXTINGUISHER_ASSIGNMENT_CONFIRMED` |
| Extinguisher Unassigned | USER | ADMIN removes assignment | `EXTINGUISHER_UNASSIGNED` |
| Inspection Requested | ADMIN* | USER creates inspection | Audit log only |
| Inspector Assigned | INSPECTOR | ADMIN assigns inspector | `INSPECTION_INSPECTOR_ASSIGNED` |
| Inspector Assigned | USER | ADMIN assigns inspector | `INSPECTION_INSPECTOR_ASSIGNED` |
| Inspection Completed | USER | INSPECTOR completes | `INSPECTION_COMPLETED` |
| Inspection Completed | ADMIN | INSPECTOR completes | `INSPECTION_COMPLETED` |

*Note: USER inspection requests are logged for ADMINs to discover via audit logs or inspection list

---

## Error Handling

### Common Error Codes

| Code | Status | Scenario |
|------|--------|----------|
| `EXTINGUISHER_NOT_FOUND` | 404 | Extinguisher ID doesn't exist |
| `EXTINGUISHER_RETIRED` | 400 | Cannot assign retired extinguisher |
| `ASSIGNMENT_NOT_FOUND` | 404 | No assignment exists to remove |
| `INSPECTION_NOT_FOUND` | 404 | Inspection ID doesn't exist |
| `INVALID_INSPECTION_STATUS` | 400 | Cannot assign inspector to completed/cancelled inspection |
| `FORBIDDEN` | 403 | INSPECTOR trying to complete unassigned inspection |
| `USER_NOT_OWNER` | 403 | USER trying to request inspection for non-owned extinguisher |

---

## Implementation Files

### Extinguisher Service
- `prisma/schema.prisma` - ExtinguisherAssignment model
- `src/controllers/assignment.controller.js` - Assignment endpoints
- `src/routes/extinguisher.routes.js` - Route registration
- `src/validations/assignment.validation.js` - Request validation schemas
- `src/services/notification.service.js` - Notification client

### Inspection Service
- `prisma/schema.prisma` - Updated Inspection model with new statuses
- `src/controllers/inspection.controller.js` - Role-aware inspection logic
- `src/routes/inspection.routes.js` - Route registration
- `src/services/assignment-service.client.js` - Assignment verification client
- `src/validations/inspection.validation.js` - Request validation schemas
- `prisma/migrations/` - Database migration files

---

## Testing Considerations

### Unit Testing Focus Areas
1. Assignment controller - upsert logic, retired extinguisher rejection
2. Inspection controller - role-based status assignment
3. Service clients - proper error handling and token forwarding
4. Notification triggers - correct recipients and metadata

### Integration Testing Scenarios
1. Full workflow: assign → request → assign inspector → complete
2. Access control: USER cannot assign, INSPECTOR cannot complete others' inspections
3. Error paths: non-existent extinguisher, invalid inspector ID
4. Notification delivery verification
5. Audit log completeness

### Manual Testing Checklist
- [ ] ADMIN assigns extinguisher to USER
- [ ] USER sees assignment in `/my` endpoint
- [ ] USER cannot request inspection for non-owned extinguisher
- [ ] USER successfully requests inspection (status=REQUESTED)
- [ ] ADMIN assigns INSPECTOR to REQUESTED inspection
- [ ] INSPECTOR receives notification
- [ ] INSPECTOR completes inspection
- [ ] USER receives completion notification
- [ ] ADMIN removes assignment
- [ ] USER no longer sees extinguisher in `/my`

---

## Security Considerations

1. **Authorization**: All endpoints protected with role-based middleware
2. **Ownership Verification**: Cross-service validation prevents USERs from requesting inspections for unowned extinguishers
3. **Token Forwarding**: JWT tokens forwarded in service-to-service calls to maintain auth context
4. **Audit Trail**: All actions logged with actor, resource, and outcome
5. **Cascade Delete**: Assignments automatically removed when extinguisher is deleted

---

## Future Enhancements

1. **Batch Assignment**: Assign multiple extinguishers to a user at once
2. **Assignment History**: Track assignment changes over time
3. **Auto-Assignment**: Rule-based assignment by location/zone
4. **Notification Preferences**: Allow users to configure notification channels
5. **Inspection Reminders**: Proactive notifications before expiry
6. **Mobile Push**: Extend notifications to mobile devices
7. **Assignment Transfer**: Transfer extinguisher between users without unassign/reassign

---

*Document Version: 1.0*  
*Last Updated: 2026-06-03*  
*Status: Implementation Complete*
