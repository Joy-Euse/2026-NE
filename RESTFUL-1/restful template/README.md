# Fire Extinguisher Management System

RESTful microservices project for TZW LTD using Node.js, Express.js, PostgreSQL, Prisma, JWT, Docker, and React.

## Backend Services

```text
React Frontend
  -> API Gateway (4000)
      -> Auth Service (4001)
      -> User Service (4002)
      -> Fire Extinguisher Service (4003)
      -> Inspection & Maintenance Service (4004)
      -> Notification Service (4005)
      -> Report Service (4006)
      -> Audit Log Service (4007)
```

## Run Backend

```bash
cd backend
docker-compose up --build
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Implemented Backend Scope

Phase 2 foundation and Phase 3 Authentication/User Management are in progress in the backend:

- Prisma schemas for Auth and User services.
- JWT access tokens.
- Refresh token storage and revocation.
- Registration, login, logout, refresh, token validation.
- Password change, forgot password, reset password.
- User profile APIs.
- Admin user management APIs.
- Role-based authorization for admin routes.
- OpenAPI files for Auth and User services.

Business logic for extinguisher inventory, inspections, maintenance, notifications, and reports comes in later phases.
