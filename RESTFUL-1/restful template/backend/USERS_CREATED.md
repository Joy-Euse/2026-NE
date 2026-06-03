# User Setup Complete ✅

Successfully added 1 System Administrator and 2 Inspectors to the database.

## Created Users

### 1. System Administrator
- **Email:** `admin@fire.com`
- **Password:** `Admin@123456`
- **Role:** ADMIN
- **Status:** ACTIVE
- **Profile ID:** ab41a6d1-5484-46cb-af91-320c81074460
- **Auth ID:** a7478747-1969-4feb-a089-ee7519f860e3

### 2. Inspector 1
- **Email:** `inspector1@fire.com`
- **Password:** `Inspector@123456`
- **Role:** INSPECTOR
- **Status:** ACTIVE
- **Profile ID:** 94fbf620-bf05-488e-8dd9-5f7bea4efcf8
- **Auth ID:** 1e806f2b-f59f-4924-804a-51e692e87795

### 3. Inspector 2
- **Email:** `inspector2@fire.com`
- **Password:** `Inspector@123456`
- **Role:** INSPECTOR
- **Status:** ACTIVE
- **Profile ID:** 8cc779bd-3a61-4498-b78f-856e748aee6d
- **Auth ID:** d7919f03-e08e-4925-ba12-1e60948b70d5

## Database Locations

- **Auth Database:** `postgresql://postgres:user@localhost:5432/auth_db`
  - Table: `UserCredential`
  - Contains login credentials and authentication tokens

- **User Database:** `postgresql://postgres:user@localhost:5432/user_db`
  - Table: `UserProfile`
  - Contains user profile information and roles

## Testing Login

Navigate to the frontend at: **http://localhost:5175/**

### Login with Admin Account
1. Go to http://localhost:5175/login
2. Enter email: `admin@fire.com`
3. Enter password: `Admin@123456`
4. Click Login

Expected: You should be redirected to the Admin Dashboard

### Login with Inspector Account
1. Go to http://localhost:5175/login
2. Enter email: `inspector1@fire.com`
3. Enter password: `Inspector@123456`
4. Click Login

Expected: You should be redirected to the Inspector Dashboard

## What Each Role Can Do

### ADMIN (System Administrator)
- Access all features
- Manage users (create, update, delete)
- Change user roles
- View all inspections
- View all reports
- Access audit logs
- Change system settings

### INSPECTOR
- View assigned fire extinguishers
- Create and edit inspections
- View inspection history
- Create maintenance records
- View reports they created
- Update own profile

### USER (Regular User)
- View their assigned extinguishers
- View inspection results
- View maintenance history
- Update own profile

## API Testing

### Get Access Token
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fire.com",
    "password": "Admin@123456"
  }'
```

### List All Users (Admin Only)
```bash
curl -X GET http://localhost:4002/api/users \
  -H "Authorization: Bearer {access_token}"
```

## Files Modified

1. **Auth Service Seed Script**
   - Location: `/backend/services/auth-service/prisma/seed.js`
   - Purpose: Creates UserCredential records in auth database

2. **User Service Sync Script**
   - Location: `/backend/services/user-service/sync-profiles.js`
   - Purpose: Synchronizes UserProfile records with auth credentials

3. **Package.json Updates**
   - Added `seed` script to both auth-service and user-service
   - Commands:
     - `npm run seed` - Seeds the database

4. **Documentation**
   - Location: `/backend/SEED_USERS.md` - Detailed seeding guide
   - Location: `/backend/setup-users.ps1` - Automated setup script (Windows PowerShell)

## Common Issues & Solutions

### Issue: "Cannot login"
- **Solution:** Verify credentials are exactly as shown above
- **Solution:** Make sure services are running (auth-service on port 4001)
- **Solution:** Check browser console for specific error messages

### Issue: "Profile not found"
- **Solution:** Run the sync-profiles.js script again
- **Solution:** Verify user-service database has the UserProfile table

### Issue: "Access token expired"
- **Solution:** Login again to get a new token
- **Solution:** Use refresh token endpoint to get new access token

## Next Steps

1. ✅ Users are created and can login
2. Create additional regular users as needed
3. Assign fire extinguishers to inspectors
4. Start creating inspection records
5. Generate reports

## Password Reset

To change a user's password after login:

```bash
curl -X POST http://localhost:4001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "currentPassword": "Admin@123456",
    "newPassword": "NewPassword@123456"
  }'
```

## Database Backup

Before making changes to users or data, consider backing up both databases:

```bash
pg_dump -U postgres -d auth_db > auth_db_backup.sql
pg_dump -U postgres -d user_db > user_db_backup.sql
```

Restore from backup:
```bash
psql -U postgres -d auth_db < auth_db_backup.sql
psql -U postgres -d user_db < user_db_backup.sql
```

---

**Setup Date:** June 3, 2026
**System:** Fire Extinguisher Management System v1.0
