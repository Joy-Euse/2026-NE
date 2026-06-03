# Adding Users (Admin & Inspectors) to Database

This guide explains how to add a system administrator and two inspectors to your Fire Extinguisher Management System database.

## Users to be Created

1. **Admin User**
   - Email: `admin@fire.com`
   - Password: `Admin@123456`
   - Role: `ADMIN`

2. **Inspector 1**
   - Email: `inspector1@fire.com`
   - Password: `Inspector@123456`
   - Role: `INSPECTOR`

3. **Inspector 2**
   - Email: `inspector2@fire.com`
   - Password: `Inspector@123456`
   - Role: `INSPECTOR`

## Method 1: Using Seed Script (Recommended)

### Step 1: Ensure Databases are Running
Make sure your PostgreSQL databases are running:
- `auth_db` at `localhost:5432`
- `user_db` at `localhost:5432`

### Step 2: Run the Seed Script

From the backend directory:
```bash
cd c:\Users\Tishok\Documents\Projects\2026 NE\RESTFUL-1\restful template\backend

# Install dependencies if not already installed
npm install

# Run the seed script
node seed.js
```

Expected output:
```
🌱 Starting seed process...

✓ Created credential in auth DB
  Email: admin@fire.com
  Auth ID: [some-uuid]
  Password: Admin@123456
✓ Created profile in user DB
  Profile ID: [some-uuid]
  Role: ADMIN

... (similar for inspector1 and inspector2)

✅ Seeding completed successfully!

📝 Created Users:
   1. admin@fire.com (ADMIN)
   2. inspector1@fire.com (INSPECTOR)
   3. inspector2@fire.com (INSPECTOR)
```

## Method 2: Manual API Calls

If you prefer not to use the seed script, you can manually create users via API calls:

### Step 1: Register Users

For each user, make a POST request to the Auth Service:

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fire.com",
    "password": "Admin@123456",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

This will create the user with role `USER` initially.

### Step 2: Promote to Admin/Inspector (requires an existing admin)

Once you have an admin, use the User Service API to change roles:

```bash
curl -X PATCH http://localhost:4002/api/users/{userId}/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "role": "ADMIN"
  }'
```

## Method 3: Direct Database Insertion (Advanced)

If you want to directly insert into the databases:

### For Auth DB (auth_db):
```sql
INSERT INTO "UserCredential" (id, email, "passwordHash", status, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'admin@fire.com', '$2a$12$...', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'inspector1@fire.com', '$2a$12$...', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'inspector2@fire.com', '$2a$12$...', 'ACTIVE', now(), now());
```

### For User DB (user_db):
```sql
INSERT INTO "UserProfile" (id, "authUserId", "firstName", "lastName", email, role, status, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), {auth_id_1}, 'System', 'Administrator', 'admin@fire.com', 'ADMIN', 'ACTIVE', now(), now()),
  (gen_random_uuid(), {auth_id_2}, 'John', 'Inspector', 'inspector1@fire.com', 'INSPECTOR', 'ACTIVE', now(), now()),
  (gen_random_uuid(), {auth_id_3}, 'Jane', 'Inspector', 'inspector2@fire.com', 'INSPECTOR', 'ACTIVE', now(), now());
```

## Testing the Setup

### 1. Login to Frontend

Navigate to: `http://localhost:5175/login`

Login with admin credentials:
- Email: `admin@fire.com`
- Password: `Admin@123456`

You should be able to access the admin dashboard.

### 2. Test API Access

Get access token:
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fire.com",
    "password": "Admin@123456"
  }'
```

List all users (requires ADMIN role):
```bash
curl -X GET http://localhost:4002/api/users \
  -H "Authorization: Bearer {access_token}"
```

## Troubleshooting

### Issue: "Email is already registered"
This means the user already exists in the system. Check if they were created in a previous run.

### Issue: "Database connection error"
Ensure PostgreSQL is running and the connection strings are correct:
- Auth DB: `postgresql://postgres:user@localhost:5432/auth_db`
- User DB: `postgresql://postgres:user@localhost:5432/user_db`

### Issue: Script fails with Prisma error
Make sure:
1. `@prisma/client` is installed in the backend root
2. Database migrations have been run: `npx prisma migrate deploy`
3. Environment variables are set correctly

## Changing Passwords

To change a user's password, use the Auth Service API:

```bash
curl -X POST http://localhost:4001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "currentPassword": "Admin@123456",
    "newPassword": "NewPassword@123456"
  }'
```

## Next Steps

After setting up the admin and inspectors:
1. Log in with admin credentials
2. Navigate to Users section to manage other users
3. Create regular users as needed
4. Assign inspection tasks to inspectors
5. View reports and maintenance records
