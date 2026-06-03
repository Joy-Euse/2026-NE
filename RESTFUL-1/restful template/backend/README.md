# Backend Microservices

Backend for the TZW LTD Fire Extinguisher Management System.

## Services

| Service | Port | Status |
| --- | ---: | --- |
| API Gateway | 4000 | Routes domain APIs |
| Authentication Service | 4001 | Implemented in Phase 3 |
| User Management Service | 4002 | Implemented in Phase 3 |
| Fire Extinguisher Service | 4003 | Foundation only |
| Inspection & Maintenance Service | 4004 | Foundation only |
| Notification Service | 4005 | Foundation only |
| Reporting Service | 4006 | Existing scaffold |
| Audit Log Service | 4007 | Basic audit receiver |

## Run With Docker

```bash
cd backend
docker-compose up --build
```

## Phase 3 Auth Endpoints

All endpoints are exposed through the API Gateway.

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/validate`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Users:

- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/role`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`

## Prisma

Auth and User services use Prisma. Generate clients inside each service after installing dependencies:

```bash
npm run prisma:generate
```

Create migrations when the database is available:

```bash
npm run prisma:migrate
```

## OpenAPI

Swagger UI is available at:

- `http://localhost:4001/docs`
- `http://localhost:4002/docs`

Each service also includes an `openapi.yaml` file.
