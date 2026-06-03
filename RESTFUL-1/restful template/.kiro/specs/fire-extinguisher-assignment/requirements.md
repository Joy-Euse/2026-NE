# Fire Extinguisher Assignment Feature - Requirements

## Feature Overview

Enable a structured workflow where administrators can assign fire extinguishers to users for accountability, users can request inspections for their assigned equipment, and administrators can assign inspectors to complete those inspections.

---

## User Stories

### As an ADMIN

**US-1**: As an ADMIN, I want to assign a fire extinguisher to a specific user, so that I can establish clear responsibility for equipment maintenance and inspection.

**Acceptance Criteria**:
- I can select any active fire extinguisher
- I can assign it to any user in the system
- I can add optional notes about the assignment
- I cannot assign retired extinguishers
- The assigned user receives a notification
- I receive a confirmation notification

---

**US-2**: As an ADMIN, I want to reassign a fire extinguisher from one user to another, so that I can adapt to organizational changes.

**Acceptance Criteria**:
- I can reassign an already-assigned extinguisher
- The previous assignment is replaced (not duplicated)
- Both the new user and I receive notifications
- The previous user receives an unassignment notification

---

**US-3**: As an ADMIN, I want to remove an extinguisher assignment, so that I can handle situations where equipment is no longer assigned to anyone.

**Acceptance Criteria**:
- I can remove an existing assignment
- The previously assigned user receives a notification
- An audit log entry is created
- If no assignment exists, I receive a clear error message

---

**US-4**: As an ADMIN, I want to view inspection requests from users, so that I can assign inspectors to fulfill them.

**Acceptance Criteria**:
- I can see inspections with status "REQUESTED"
- I can see who requested each inspection
- I can see the extinguisher details
- I can see the requested date and time

---

**US-5**: As an ADMIN, I want to assign an inspector to a requested inspection, so that the inspection can be completed.

**Acceptance Criteria**:
- I can select any user with INSPECTOR role
- The inspection status changes from REQUESTED to ASSIGNED
- The inspector receives a notification
- The requesting user receives a notification that their request was processed
- An audit log entry is created

---

**US-6**: As an ADMIN, I want to view all inspections (requested, assigned, scheduled, completed, cancelled), so that I can monitor the inspection workflow.

**Acceptance Criteria**:
- I can see all inspections across all users
- I can filter by status
- I can filter by date range
- I can filter by extinguisher or inspector

---

### As a USER

**US-7**: As a USER, I want to view the fire extinguishers assigned to me, so that I know which equipment I'm responsible for.

**Acceptance Criteria**:
- I can see a list of all fire extinguishers assigned to me
- Each extinguisher shows serial number, location, type, size, status, and expiry date
- I can see who assigned it to me and when
- I can see any notes from the admin
- I cannot see extinguishers assigned to other users
- The list supports pagination

---

**US-8**: As a USER, I want to receive a notification when a fire extinguisher is assigned to me, so that I'm aware of my new responsibility.

**Acceptance Criteria**:
- I receive a notification immediately after assignment
- The notification includes the extinguisher serial number and location
- The notification includes the assignment date

---

**US-9**: As a USER, I want to request an inspection for my assigned fire extinguisher, so that I can ensure it's properly maintained.

**Acceptance Criteria**:
- I can only request inspections for extinguishers assigned to me
- I can specify the desired inspection date and time
- The inspection is created with status "REQUESTED"
- I cannot request inspections for extinguishers not assigned to me
- An audit log entry is created for admin review

---

**US-10**: As a USER, I want to receive a notification when an inspector is assigned to my inspection request, so that I know my request is being processed.

**Acceptance Criteria**:
- I receive a notification when an admin assigns an inspector
- The notification includes the inspector information
- The notification includes the scheduled date and time

---

**US-11**: As a USER, I want to receive a notification when my inspection is completed, so that I know the status of my equipment.

**Acceptance Criteria**:
- I receive a notification immediately after completion
- The notification includes the inspection result (PASS/FAIL/NEEDS_MAINTENANCE)
- The notification includes any notes from the inspector

---

**US-12**: As a USER, I want to view only my requested inspections, so that I can track the inspections for my assigned equipment.

**Acceptance Criteria**:
- I can see all inspections I requested
- I cannot see inspections requested by other users
- I can filter by status
- I can filter by date range

---

### As an INSPECTOR

**US-13**: As an INSPECTOR, I want to view inspections assigned to me, so that I know which inspections I need to complete.

**Acceptance Criteria**:
- I can see all inspections assigned to me
- I can see the extinguisher details for each inspection
- I can see the scheduled date and time
- I can filter by status and date range

---

**US-14**: As an INSPECTOR, I want to receive a notification when an inspection is assigned to me, so that I'm aware of my responsibilities.

**Acceptance Criteria**:
- I receive a notification immediately after assignment
- The notification includes the extinguisher serial number and location
- The notification includes the scheduled date and time

---

**US-15**: As an INSPECTOR, I want to complete inspections assigned to me, so that I can record the inspection results.

**Acceptance Criteria**:
- I can only complete inspections assigned to me
- I must provide a result (PASS/FAIL/NEEDS_MAINTENANCE)
- I can add optional notes
- The inspection status changes to COMPLETED
- The requesting user receives a notification
- The assigning admin receives a notification
- An audit log entry is created

---

**US-16**: As an INSPECTOR, I can also schedule inspections directly (like ADMIN), so that I can proactively manage equipment maintenance.

**Acceptance Criteria**:
- I can create inspections with status SCHEDULED
- I can assign myself or another inspector
- I don't need to request admin approval
- Standard notifications are sent

---

## Business Rules

### Assignment Rules

1. **One Assignment Per Extinguisher**: Each fire extinguisher can be assigned to only one user at a time
2. **Retired Extinguishers**: Cannot assign extinguishers with status RETIRED
3. **Reassignment**: Reassigning an extinguisher automatically removes the previous assignment
4. **Cascade Delete**: Removing a fire extinguisher automatically removes its assignment

### Inspection Request Rules

1. **Ownership Verification**: USERs can only request inspections for extinguishers assigned to them
2. **Initial Status - USER**: Inspections created by USERs start with status REQUESTED
3. **Initial Status - ADMIN/INSPECTOR**: Inspections created by ADMIN/INSPECTOR start with status SCHEDULED
4. **Inspector Assignment**: Only ADMINs can assign inspectors to REQUESTED inspections
5. **Status Transition**: REQUESTED → ASSIGNED → COMPLETED
6. **Inspector Restriction**: INSPECTORs can only complete inspections assigned to them
7. **Admin Override**: ADMINs can complete any inspection

### Notification Rules

1. **Assignment Notifications**: Sent to assigned user and assigning admin
2. **Unassignment Notifications**: Sent to previously assigned user
3. **Inspector Assignment Notifications**: Sent to assigned inspector and requesting user
4. **Completion Notifications**: Sent to requesting user and assigning admin (if different)

### Audit Logging Rules

1. All assignment actions are logged with actor, resource, and outcome
2. All inspection state changes are logged
3. Failed authorization attempts are logged
4. Audit logs include relevant metadata (user IDs, extinguisher IDs, timestamps)

---

## Non-Functional Requirements

### Performance

- Assignment creation: < 500ms response time
- List my extinguishers: < 1s for 100 items
- Notification delivery: < 2s from action trigger
- Service-to-service calls: < 200ms latency

### Security

- All endpoints require authentication (JWT)
- Role-based authorization enforced at endpoint level
- Cross-service calls forward authentication context
- USERs cannot access other users' data
- INSPECTORs cannot complete unassigned inspections

### Scalability

- Support 10,000+ extinguishers
- Support 1,000+ concurrent users
- Support 100+ assignments per admin per day
- Pagination for all list endpoints

### Reliability

- Graceful handling of notification service failures
- Retry logic for service-to-service calls
- Transaction consistency for database operations
- Audit logs never fail silently

### Usability

- Clear error messages for authorization failures
- Informative notifications with actionable details
- Consistent API response structure
- Proper HTTP status codes

---

## Constraints

1. **Technology Stack**: Node.js, Express, Prisma, PostgreSQL
2. **Authentication**: JWT-based, issued by auth-service
3. **Service Communication**: Synchronous HTTP REST calls
4. **Database**: Database-per-service pattern (separate DBs for extinguisher-service and inspection-service)
5. **Role System**: Fixed roles (ADMIN, INSPECTOR, USER) defined in auth-service

---

## Dependencies

1. **auth-service**: User authentication and role management
2. **user-service**: User information and role validation
3. **notification-service**: Notification delivery
4. **audit-log-service**: Audit trail recording
5. **api-gateway**: Request routing and authentication

---

## Out of Scope (Future Enhancements)

1. Batch assignment of multiple extinguishers
2. Assignment history and audit trail viewing
3. Auto-assignment based on rules (location, zone, etc.)
4. Email/SMS notifications (currently in-app only)
5. Mobile push notifications
6. Assignment transfer between users
7. Inspection scheduling conflict detection
8. Inspector availability management

---

## Acceptance Criteria Summary

### Must Have (MVP)
- ✅ ADMIN can assign/unassign extinguishers
- ✅ USER can view assigned extinguishers
- ✅ USER can request inspections for assigned extinguishers only
- ✅ ADMIN can assign inspectors to REQUESTED inspections
- ✅ INSPECTOR can complete assigned inspections
- ✅ Notifications sent at each stage
- ✅ Audit logs for all actions
- ✅ Role-based access control enforced

### Should Have
- ✅ Reassignment capability (replace existing assignment)
- ✅ Pagination for list endpoints
- ✅ Status filtering for inspections
- ✅ Clear error messages

### Nice to Have (Deferred)
- ⏳ Batch operations
- ⏳ Assignment history
- ⏳ Email/SMS notifications
- ⏳ Advanced scheduling features

---

## Success Metrics

1. **Functional Success**:
   - All 16 user stories pass acceptance tests
   - 100% role-based authorization coverage
   - Zero unauthorized data access incidents

2. **Performance Success**:
   - 95th percentile response time < 1s
   - Notification delivery success rate > 99%

3. **User Success**:
   - Users can successfully request and track inspections
   - Admins can efficiently manage assignments and inspector allocation
   - Inspectors receive and complete assignments without confusion

---

*Document Version: 1.0*  
*Last Updated: 2026-06-03*  
*Status: Implementation Complete*
