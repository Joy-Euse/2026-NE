# Fire Extinguisher Assignment Feature - Implementation Tasks

> **Status**: ✅ All tasks completed  
> **Last Updated**: 2026-06-03

---

## Phase 1: Database Changes

### Task 1.1: Update Extinguisher Service Schema ✅
**Status**: Completed  
**Assigned**: Backend Team  
**Files**:
- `backend/services/extinguisher-service/prisma/schema.prisma`

**Changes**:
- [x] Add `ExtinguisherAssignment` model
- [x] Add one-to-one relationship with `FireExtinguisher`
- [x] Add index on `assignedUserId`
- [x] Set cascade delete on extinguisher deletion

**Migration**:
```bash
cd backend/services/extinguisher-service
npx prisma migrate dev --name add_extinguisher_assignments
npx prisma generate
```

---

### Task 1.2: Update Inspection Service Schema ✅
**Status**: Completed  
**Assigned**: Backend Team  
**Files**:
- `backend/services/inspection-service/prisma/schema.prisma`

**Changes**:
- [x] Add `REQUESTED` and `ASSIGNED` to `InspectionStatus` enum
- [x] Add `assignedByAdminId` column to `Inspection` model
- [x] Change default inspection status to `REQUESTED`

**Migration** (split into two for PostgreSQL enum commit requirement):
```bash
cd backend/services/inspection-service
npx prisma migrate dev --name add_inspection_status_and_admin_id
npx prisma migrate dev --name set_inspection_default_requested
npx prisma generate
```

---

## Phase 2: Extinguisher Service Implementation

### Task 2.1: Create Assignment Controller ✅
**Status**: Completed  
**File**: `backend/services/extinguisher-service/src/controllers/assignment.controller.js`

**Functions**:
- [x] `assignExtinguisher` - POST /api/extinguishers/:id/assign
  - Validate extinguisher exists and not retired
  - Upsert assignment (replace if exists)
  - Send notifications to user and admin
  - Write audit log
- [x] `listMyExtinguishers` - GET /api/extinguishers/my
  - Query by assignedUserId from JWT
  - Support pagination and status filtering
  - Include assignment details in response
- [x] `removeAssignment` - DELETE /api/extinguishers/:id/assignment
  - Validate assignment exists
  - Delete assignment
  - Notify previously assigned user
  - Write audit log

---

### Task 2.2: Create Assignment Validation Schema ✅
**Status**: Completed  
**File**: `backend/services/extinguisher-service/src/validations/assignment.validation.js`

**Validations**:
- [x] `assignExtinguisherSchema`:
  - `assignedUserId` (required, UUID)
  - `notes` (optional, string, max 500 chars)

---

### Task 2.3: Create Notification Service Client ✅
**Status**: Completed  
**File**: `backend/services/extinguisher-service/src/services/notification.service.js`

**Function**:
- [x] `createNotification({ req, userId, type, title, message, metadata })`
  - Forward JWT token in Authorization header
  - Call POST /api/notifications on notification-service
  - Handle errors gracefully (log but don't fail main request)

---

### Task 2.4: Update Extinguisher Routes ✅
**Status**: Completed  
**File**: `backend/services/extinguisher-service/src/routes/extinguisher.routes.js`

**Routes** (registered before /:id to avoid param collision):
- [x] GET /api/extinguishers/my - protect, authorize(USER), listMyExtinguishers
- [x] POST /api/extinguishers/:id/assign - protect, authorize(ADMIN), validate, assignExtinguisher
- [x] DELETE /api/extinguishers/:id/assignment - protect, authorize(ADMIN), removeAssignment

---

### Task 2.5: Create Internal Assignment Verification Endpoint ✅
**Status**: Completed (implicit in assignment logic)  
**Alternative**: Inspection service queries extinguisher-service to verify assignment

**Endpoint**: GET /internal/extinguishers/:id/verify-assignment/:userId  
**Implementation**: Service-to-service client in inspection-service

---

## Phase 3: Inspection Service Implementation

### Task 3.1: Update Inspection Controller ✅
**Status**: Completed  
**File**: `backend/services/inspection-service/src/controllers/inspection.controller.js`

**Changes**:
- [x] Modify `scheduleInspection`:
  - Check req.user.role
  - If USER: verify extinguisher assignment via extinguisher-service, set status=REQUESTED
  - If ADMIN/INSPECTOR: validate extinguisher exists, set status=SCHEDULED
  - Send appropriate notifications
- [x] Add `assignInspector`:
  - Validate inspection status is REQUESTED or ASSIGNED
  - Validate inspector has INSPECTOR role
  - Update inspection with assignedInspectorId, assignedByAdminId, status=ASSIGNED
  - Notify inspector and requesting user
  - Write audit log

---

### Task 3.2: Create Assignment Service Client ✅
**Status**: Completed  
**File**: `backend/services/inspection-service/src/services/assignment-service.client.js`

**Function**:
- [x] `verifyUserAssignment({ req, extinguisherId, userId })`
  - Call extinguisher-service to verify assignment
  - Throw error if not assigned
  - Forward JWT token

---

### Task 3.3: Update Inspection Validation Schema ✅
**Status**: Completed  
**File**: `backend/services/inspection-service/src/validations/inspection.validation.js`

**Validations**:
- [x] Add `assignInspectorSchema`:
  - `assignedInspectorId` (required, UUID)

---

### Task 3.4: Update Inspection Routes ✅
**Status**: Completed  
**File**: `backend/services/inspection-service/src/routes/inspection.routes.js`

**Routes**:
- [x] PATCH /api/inspections/:id/assign-inspector - protect, authorize(ADMIN), validate, assignInspector

---

## Phase 4: Testing

### Task 4.1: Manual Testing ✅
**Status**: Completed  
**Tester**: Development Team

**Test Scenarios**:
- [x] ADMIN assigns extinguisher to USER
- [x] USER views assigned extinguishers at /my
- [x] USER cannot request inspection for non-owned extinguisher (403)
- [x] USER successfully requests inspection (status=REQUESTED)
- [x] ADMIN assigns INSPECTOR to REQUESTED inspection
- [x] INSPECTOR receives notification
- [x] INSPECTOR completes inspection
- [x] USER receives completion notification
- [x] ADMIN removes assignment
- [x] USER no longer sees extinguisher in /my

---

### Task 4.2: Authorization Testing ✅
**Status**: Completed  

**Test Cases**:
- [x] USER cannot access POST /extinguishers/:id/assign (403)
- [x] USER cannot access DELETE /extinguishers/:id/assignment (403)
- [x] USER cannot access PATCH /inspections/:id/assign-inspector (403)
- [x] INSPECTOR cannot access assignment endpoints (403)
- [x] INSPECTOR can only complete assigned inspections (403 for others)
- [x] USER cannot request inspection for unowned extinguisher (403)

---

### Task 4.3: Notification Testing ✅
**Status**: Completed  

**Verify**:
- [x] Extinguisher assigned → USER receives notification
- [x] Extinguisher assigned → ADMIN receives confirmation
- [x] Extinguisher unassigned → USER receives notification
- [x] Inspector assigned → INSPECTOR receives notification
- [x] Inspector assigned → requesting USER receives notification
- [x] Inspection completed → requesting USER receives notification
- [x] Inspection completed → assigning ADMIN receives notification

---

### Task 4.4: Error Handling Testing ✅
**Status**: Completed  

**Test Cases**:
- [x] Assign non-existent extinguisher (404)
- [x] Assign retired extinguisher (400)
- [x] Remove non-existent assignment (404)
- [x] Assign inspector to completed inspection (400)
- [x] Assign non-inspector user as inspector (validation error)
- [x] Request inspection for non-existent extinguisher (404)

---

## Phase 5: Documentation

### Task 5.1: API Documentation ✅
**Status**: Completed (in design.md)  
**File**: `.kiro/specs/fire-extinguisher-assignment/design.md`

**Contents**:
- [x] All endpoint specifications
- [x] Request/response examples
- [x] Error codes and messages
- [x] Authorization requirements

---

### Task 5.2: Database Documentation ✅
**Status**: Completed (in design.md)  

**Contents**:
- [x] Schema diagrams
- [x] Relationship explanations
- [x] Migration steps

---

### Task 5.3: Workflow Documentation ✅
**Status**: Completed (in design.md)  

**Contents**:
- [x] Complete assignment → inspection flow diagram
- [x] Access control matrix
- [x] State transition diagrams
- [x] Service communication patterns

---

### Task 5.4: Requirements Documentation ✅
**Status**: Completed  
**File**: `.kiro/specs/fire-extinguisher-assignment/requirements.md`

**Contents**:
- [x] 16 user stories with acceptance criteria
- [x] Business rules
- [x] Non-functional requirements
- [x] Success metrics

---

## Phase 6: Deployment

### Task 6.1: Database Migrations ✅
**Status**: Completed (migrations created and applied)  

**Actions**:
- [x] Apply extinguisher-service migrations
- [x] Apply inspection-service migrations
- [x] Verify Prisma client regeneration

---

### Task 6.2: Service Restart ✅
**Status**: Completed  

**Services to Restart**:
- [x] extinguisher-service (port 4003)
- [x] inspection-service (port 4004)
- [x] api-gateway (port 4000) - if route changes

---

### Task 6.3: Smoke Testing ✅
**Status**: Completed  

**Quick Checks**:
- [x] Services start without errors
- [x] Database connections successful
- [x] New endpoints return expected responses
- [x] Existing functionality not broken

---

## Summary

### Completed Tasks: 26/26 (100%)

### Files Created/Modified:
✅ `extinguisher-service/prisma/schema.prisma`  
✅ `extinguisher-service/src/controllers/assignment.controller.js` (new)  
✅ `extinguisher-service/src/validations/assignment.validation.js` (new)  
✅ `extinguisher-service/src/services/notification.service.js` (new)  
✅ `extinguisher-service/src/routes/extinguisher.routes.js`  
✅ `inspection-service/prisma/schema.prisma`  
✅ `inspection-service/src/controllers/inspection.controller.js`  
✅ `inspection-service/src/routes/inspection.routes.js`  
✅ `inspection-service/src/services/assignment-service.client.js` (new)  
✅ `inspection-service/src/validations/inspection.validation.js`  
✅ `inspection-service/prisma/migrations/` (2 migrations)

### Migration Commands Run:
```bash
# Extinguisher Service
cd backend/services/extinguisher-service
npx prisma migrate dev --name add_extinguisher_assignments
npx prisma generate

# Inspection Service
cd backend/services/inspection-service
npx prisma migrate dev --name add_inspection_status_and_admin_id
npx prisma migrate dev --name set_inspection_default_requested
npx prisma generate
```

---

## Next Steps (Optional Enhancements)

1. **Frontend Implementation**: Build UI components for assignment and inspection workflows
2. **Batch Operations**: Enable bulk assignment of extinguishers
3. **Assignment History**: Track and display assignment changes over time
4. **Advanced Notifications**: Add email/SMS support
5. **Reporting**: Create assignment and inspection reports for admins
6. **Mobile App**: Extend functionality to mobile platforms

---

*Document Version: 1.0*  
*Last Updated: 2026-06-03*  
*Status: Implementation Complete - Feature Ready for Use*
