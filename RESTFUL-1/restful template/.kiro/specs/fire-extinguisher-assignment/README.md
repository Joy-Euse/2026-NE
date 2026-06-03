# Fire Extinguisher Assignment Feature

> **Status**: ✅ Implemented and Ready for Use  
> **Version**: 1.0  
> **Last Updated**: 2026-06-03

---

## Quick Overview

The Fire Extinguisher Assignment feature enables a structured workflow for managing fire extinguisher accountability and inspections:

1. **ADMINs** assign fire extinguishers to **USERs**
2. **USERs** request inspections for their assigned extinguishers
3. **ADMINs** assign **INSPECTORs** to complete the inspections
4. **INSPECTORs** complete inspections and record results
5. All parties receive notifications at each stage

---

## Documentation Structure

This spec contains four documents:

### 📄 [requirements.md](requirements.md)
**What we're building and why**

- 16 user stories with acceptance criteria
- Business rules and constraints
- Non-functional requirements
- Success metrics
- Out of scope items

**Read this if you want to understand**:
- The feature from a user perspective
- What problems this solves
- Who can do what

---

### 📐 [design.md](design.md)
**How we built it**

- System architecture and service communication
- Database schemas and relationships
- Complete API specifications with examples
- Workflow diagrams and state machines
- Access control matrix
- Error handling patterns
- Security considerations

**Read this if you want to understand**:
- Technical implementation details
- API contracts and payloads
- Database structure
- How services communicate
- Where to find the code

---

### ✅ [tasks.md](tasks.md)
**Implementation checklist**

- Detailed task breakdown by phase
- Files created and modified
- Migration commands
- Testing scenarios
- Deployment steps

**Read this if you want to**:
- Track implementation progress
- Understand what was built
- Know which files to review
- Replicate the implementation

---

### 📖 This README
**Quick reference and getting started guide**

---

## Quick Start Guide

### Prerequisites

1. All backend services running (auth, user, extinguisher, inspection, notification, audit-log, gateway)
2. PostgreSQL databases for extinguisher-service and inspection-service
3. Prisma migrations applied and clients regenerated

### Testing the Feature

#### 1. Assign Extinguisher to User (as ADMIN)

```bash
curl -X POST http://localhost:4000/api/extinguishers/EXTINGUISHER_ID/assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedUserId": "USER_UUID",
    "notes": "Responsible for Building A - Floor 2"
  }'
```

**Expected**: 201 response with assignment details

---

#### 2. View Assigned Extinguishers (as USER)

```bash
curl -X GET http://localhost:4000/api/extinguishers/my \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

**Expected**: 200 response with list of assigned extinguishers

---

#### 3. Request Inspection (as USER)

```bash
curl -X POST http://localhost:4000/api/inspections \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extinguisherId": "ASSIGNED_EXTINGUISHER_ID",
    "inspectionDate": "2026-06-15",
    "inspectionTime": "14:30"
  }'
```

**Expected**: 201 response with inspection in status `REQUESTED`

---

#### 4. Assign Inspector (as ADMIN)

```bash
curl -X PATCH http://localhost:4000/api/inspections/INSPECTION_ID/assign-inspector \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedInspectorId": "INSPECTOR_UUID"
  }'
```

**Expected**: 200 response with inspection in status `ASSIGNED`

---

#### 5. Complete Inspection (as INSPECTOR)

```bash
curl -X PATCH http://localhost:4000/api/inspections/INSPECTION_ID/complete \
  -H "Authorization: Bearer INSPECTOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "result": "PASS",
    "resultNotes": "All checks passed, equipment in good condition"
  }'
```

**Expected**: 200 response with inspection in status `COMPLETED`

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/extinguishers/:id/assign` | ADMIN | Assign extinguisher to user |
| GET | `/api/extinguishers/my` | USER | List my assigned extinguishers |
| DELETE | `/api/extinguishers/:id/assignment` | ADMIN | Remove assignment |
| POST | `/api/inspections` | USER/INSPECTOR/ADMIN | Request/schedule inspection |
| PATCH | `/api/inspections/:id/assign-inspector` | ADMIN | Assign inspector to inspection |
| PATCH | `/api/inspections/:id/complete` | INSPECTOR/ADMIN | Complete inspection |

**Full API documentation**: See [design.md#api-specification](design.md#api-specification)

---

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     ASSIGNMENT WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

ADMIN                    USER                     ADMIN                   INSPECTOR
  │                       │                         │                         │
  │  1. Assign            │                         │                         │
  │────────────────────>  │  Notification           │                         │
  │                       │<────────────────────────│                         │
  │                       │                         │                         │
  │                       │  2. Request Inspection  │                         │
  │                       │────────────────────────>│                         │
  │                       │                         │                         │
  │                       │                         │  3. Assign Inspector    │
  │  Notification         │  Notification           │─────────────────────────>
  │<──────────────────────│<────────────────────────│                         │
  │                       │                         │                         │
  │                       │                         │    4. Complete          │
  │  Notification         │  Notification           │<────────────────────────│
  │<──────────────────────│<────────────────────────────────────────────────┘
  │                       │
```

**Detailed workflow**: See [design.md#workflow-diagrams](design.md#workflow-diagrams)

---

## Role Permissions

| Role | Can Assign | Can View My | Can Remove | Can Request | Can Assign Inspector | Can Complete |
|------|------------|-------------|------------|-------------|----------------------|--------------|
| ADMIN | ✅ | ❌ | ✅ | ✅ (scheduled) | ✅ | ✅ |
| INSPECTOR | ❌ | ❌ | ❌ | ✅ (scheduled) | ❌ | ✅ (assigned only) |
| USER | ❌ | ✅ | ❌ | ✅ (requested) | ❌ | ❌ |

**Full access control matrix**: See [design.md#access-control-matrix](design.md#access-control-matrix)

---

## Database Changes

### Extinguisher Service
- **New table**: `extinguisher_assignments`
- **Relationship**: One-to-one with `fire_extinguishers`

### Inspection Service
- **New statuses**: `REQUESTED`, `ASSIGNED` (in addition to existing SCHEDULED, COMPLETED, etc.)
- **New column**: `assigned_by_admin_id` in `inspections` table
- **Default status**: Changed from `SCHEDULED` to `REQUESTED`

**Full schema documentation**: See [design.md#database-design](design.md#database-design)

---

## Notifications

### Notification Events

| Event | Recipients | Trigger |
|-------|------------|---------|
| Extinguisher Assigned | USER, ADMIN | ADMIN assigns extinguisher |
| Extinguisher Unassigned | USER | ADMIN removes assignment |
| Inspector Assigned | INSPECTOR, USER | ADMIN assigns inspector |
| Inspection Completed | USER, ADMIN | INSPECTOR completes inspection |

**Full notification details**: See [design.md#notification-events](design.md#notification-events)

---

## Implementation Files

### Extinguisher Service
- `prisma/schema.prisma` - Database schema with ExtinguisherAssignment model
- `src/controllers/assignment.controller.js` - Assignment business logic (NEW)
- `src/routes/extinguisher.routes.js` - Route definitions (UPDATED)
- `src/validations/assignment.validation.js` - Request validation (NEW)
- `src/services/notification.service.js` - Notification client (NEW)

### Inspection Service
- `prisma/schema.prisma` - Database schema with updated statuses
- `src/controllers/inspection.controller.js` - Role-aware inspection logic (UPDATED)
- `src/routes/inspection.routes.js` - Route definitions (UPDATED)
- `src/services/assignment-service.client.js` - Assignment verification (NEW)
- `src/validations/inspection.validation.js` - Request validation (UPDATED)
- `prisma/migrations/` - Two new migrations

**Full file list**: See [tasks.md#summary](tasks.md#summary)

---

## Testing

### Manual Test Checklist

- [x] ADMIN assigns extinguisher to USER
- [x] USER sees assignment in `/my` endpoint
- [x] USER cannot request inspection for non-owned extinguisher
- [x] USER successfully requests inspection (status=REQUESTED)
- [x] ADMIN assigns INSPECTOR to REQUESTED inspection
- [x] INSPECTOR receives notification
- [x] INSPECTOR completes inspection
- [x] USER receives completion notification
- [x] ADMIN removes assignment
- [x] USER no longer sees extinguisher in `/my`

**Full testing guide**: See [design.md#testing-considerations](design.md#testing-considerations)

---

## Troubleshooting

### Common Issues

**Issue**: USER gets 403 when requesting inspection  
**Solution**: Verify the extinguisher is assigned to that user via `GET /api/extinguishers/my`

**Issue**: INSPECTOR cannot complete inspection  
**Solution**: Verify the inspection is assigned to that inspector (check `assignedInspectorId`)

**Issue**: Notifications not received  
**Solution**: Check notification-service is running and database has notification records

**Issue**: "User does not own this extinguisher" error  
**Solution**: ADMIN must assign the extinguisher first via `POST /api/extinguishers/:id/assign`

---

## Future Enhancements

1. **Batch Assignment** - Assign multiple extinguishers at once
2. **Assignment History** - Track assignment changes over time
3. **Auto-Assignment Rules** - Rule-based assignment by location/zone
4. **Email/SMS Notifications** - Multi-channel notification support
5. **Assignment Transfer** - Transfer between users without unassign/reassign
6. **Inspection Reminders** - Proactive notifications before expiry
7. **Mobile App** - Native mobile application support

**Full enhancement list**: See [requirements.md#out-of-scope](requirements.md#out-of-scope)

---

## Support

### For Developers
- Review [design.md](design.md) for technical details
- Check [tasks.md](tasks.md) for implementation checklist
- Inspect the actual implementation files listed above

### For Product/Business
- Review [requirements.md](requirements.md) for user stories and business rules
- Check workflow diagrams in [design.md](design.md)
- Review success metrics in [requirements.md#success-metrics](requirements.md#success-metrics)

### For QA/Testing
- Follow manual test checklist above
- Review [design.md#testing-considerations](design.md#testing-considerations)
- Check authorization matrix in [design.md#access-control-matrix](design.md#access-control-matrix)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-03 | Initial implementation complete |

---

**Feature Status**: ✅ **Production Ready**

All implementation tasks completed, tested, and deployed. Feature is ready for use.
