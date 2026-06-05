# System Architecture — Utility Billing System

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│   Swagger UI (http://localhost:8080/swagger-ui)   Mobile / Web App  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  HTTPS / REST (JSON)
┌───────────────────────────────▼─────────────────────────────────────┐
│                        SPRING BOOT APPLICATION                      │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────────────────────────────┐   │
│  │   Security   │   │              API LAYER                   │   │
│  │   Filter     │──▶│  /api/auth   /api/me   /api/bills        │   │
│  │   (JWT)      │   │  /api/customers        /api/payments     │   │
│  └──────────────┘   │  /api/meters           /api/tariffs      │   │
│                     │  /api/meter-readings   /api/notifications│   │
│                     └──────────────┬─────────────────────────  │   │
│                                    │                            │   │
│                     ┌──────────────▼─────────────────────────┐ │   │
│                     │           SERVICE LAYER                 │ │   │
│                     │  AuthService    BillService             │ │   │
│                     │  CustomerService  PaymentService        │ │   │
│                     │  MeterService   NotificationService     │ │   │
│                     │  TariffService  MeterReadingService     │ │   │
│                     └──────────────┬─────────────────────────┘ │   │
│                                    │                            │   │
│                     ┌──────────────▼─────────────────────────┐ │   │
│                     │         REPOSITORY LAYER (JPA)         │ │   │
│                     └──────────────┬─────────────────────────┘ │   │
│                                    │                            │   │
└────────────────────────────────────┼────────────────────────────────┘
                                     │  JDBC
┌────────────────────────────────────▼────────────────────────────────┐
│                      PostgreSQL  (billing_sys)                      │
└─────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────┐
│                    Gmail SMTP  (Email Notifications)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Package Structure

```
com.java.ne
├── config/
│   ├── SecurityConfig.java        # Spring Security + JWT filter chain
│   ├── OpenApiConfig.java         # Swagger / OpenAPI 3 with Bearer auth
│   └── JpaAuditingConfig.java     # Populates createdBy / updatedBy fields
│
├── security/
│   ├── JwtTokenProvider.java      # Generate & validate JWT tokens
│   ├── JwtAuthenticationFilter.java # Intercepts every request, sets SecurityContext
│   └── CustomUserDetailsService.java # Loads AppUser by email for authentication
│
├── controller/                    # REST endpoints (HTTP in / out)
│   ├── AuthController.java        # POST /api/auth/register|login
│   ├── MeController.java          # GET  /api/me/profile|bills|payments
│   ├── CustomerController.java
│   ├── MeterController.java
│   ├── MeterReadingController.java
│   ├── TariffController.java
│   ├── BillController.java
│   ├── PaymentController.java
│   ├── NotificationController.java
│   └── UserController.java
│
├── service/                       # Business logic (interfaces + impls)
│   ├── AuthService.java
│   ├── CustomerService.java
│   ├── MeterService.java
│   ├── MeterReadingService.java
│   ├── TariffService.java
│   ├── BillService.java
│   ├── PaymentService.java
│   ├── NotificationService.java
│   └── impl/                      # Concrete implementations
│
├── entity/                        # JPA-mapped database tables
│   ├── BaseAuditableEntity.java   # createdAt, updatedAt, createdBy, updatedBy
│   ├── AppUser.java               # System user (staff + customer login accounts)
│   ├── Customer.java              # Utility service consumer
│   ├── Meter.java
│   ├── MeterReading.java
│   ├── Tariff.java
│   ├── TariffTier.java
│   ├── Bill.java
│   ├── Payment.java
│   └── Notification.java
│
├── dto/
│   ├── request/                   # Inbound validated payloads (Java records)
│   └── response/                  # Outbound JSON shapes (Java records)
│
├── repository/                    # Spring Data JPA interfaces
├── mapper/                        # Entity → DTO conversions (BillingMapper)
├── enums/                         # Domain constants
└── exception/                     # Custom exceptions + GlobalExceptionHandler
```

---

## 3. Entity Relationship Diagram

```
┌────────────────┐        ┌──────────────────┐
│    AppUser     │        │     Customer     │
│────────────────│        │──────────────────│
│ id             │        │ id               │
│ fullName       │        │ fullName         │
│ email (unique) │        │ nationalId (uniq)│
│ phoneNumber    │        │ email            │
│ password       │        │ phoneNumber      │
│ role           │        │ address          │
│ status         │        │ status           │
│ customer_id ───│────────│                  │
└────────────────┘  0..1  └────────┬─────────┘
  (staff: NULL)                    │ 1
  (customer: FK)                   │
                            ┌──────▼──────────┐
                            │     Meter        │
                            │─────────────────│
                            │ id               │
                            │ meterNumber(uniq)│
                            │ meterType        │◄──── WATER | ELECTRICITY
                            │ installationDate │
                            │ status           │
                            └──────┬──────────┘
                                   │ 1
                                   │
                   ┌───────────────▼──────────────┐
                   │         MeterReading          │
                   │──────────────────────────────│
                   │ id                            │
                   │ meter_id                      │
                   │ previousReading               │
                   │ currentReading                │
                   │ consumption (current-previous)│
                   │ readingMonth                  │
                   │ readingYear                   │
                   │ readingDate                   │
                   │ UNIQUE(meter_id, month, year) │
                   └───────────────┬──────────────┘
                                   │ 1:1
                   ┌───────────────▼──────────────┐
                   │             Bill              │
                   │──────────────────────────────│
                   │ id                            │
                   │ billReference (unique)        │
                   │ customer_id                   │
                   │ meter_id                      │
                   │ meterReading_id (unique)      │
                   │ billingMonth / billingYear    │
                   │ consumption                   │
                   │ amountBeforeTax               │
                   │ fixedCharge                   │
                   │ taxAmount                     │
                   │ penaltyAmount                 │
                   │ totalAmount                   │
                   │ amountPaid                    │
                   │ outstandingBalance            │
                   │ status                        │◄── PENDING|APPROVED|
                   │ dueDate                       │    PARTIALLY_PAID|PAID|
                   │ approvedBy (AppUser FK)       │    OVERDUE|CANCELLED
                   │ approvedAt                    │
                   └───────────────┬──────────────┘
                                   │ 1
                         ┌─────────┴──────────┐
                         │                    │
             ┌───────────▼──────┐  ┌──────────▼─────────┐
             │    Payment        │  │   Notification     │
             │──────────────────│  │────────────────────│
             │ id                │  │ id                 │
             │ paymentReference  │  │ customer_id        │
             │ bill_id           │  │ bill_id            │
             │ amountPaid        │  │ message            │
             │ paymentMethod     │  │ status             │
             │ paymentDate       │  │ createdAt          │
             │ recordedBy(User)  │  │ sentAt             │
             └──────────────────┘  └────────────────────┘


┌──────────────────────┐      ┌──────────────────┐
│       Tariff         │      │   TariffTier     │
│──────────────────────│      │──────────────────│
│ id                   │      │ id               │
│ meterType            │◄─────│ tariff_id        │
│ tariffType           │  1:N │ minUnit          │
│ ratePerUnit          │      │ maxUnit (null=∞) │
│ fixedCharge          │      │ ratePerUnit      │
│ vatPercentage        │      └──────────────────┘
│ penaltyPercentage    │
│ effectiveFrom        │
│ effectiveTo (null=∞) │
│ active               │
└──────────────────────┘
```

---

## 4. Request Lifecycle

```
HTTP Request
    │
    ▼
JwtAuthenticationFilter
    │  Extract Bearer token from Authorization header
    │  Validate signature & expiry (JwtTokenProvider)
    │  Load AppUser by email (CustomUserDetailsService)
    │  Set SecurityContextHolder
    │
    ▼
SecurityFilterChain  (@PreAuthorize checks)
    │  ROLE_ADMIN / ROLE_OPERATOR / ROLE_FINANCE / ROLE_CUSTOMER
    │
    ▼
Controller  (validates @RequestBody via Bean Validation)
    │
    ▼
Service  (business rules, calculations)
    │  Throws: ResourceNotFoundException (404)
    │          DuplicateResourceException (409)
    │          InvalidBusinessOperationException (400)
    │
    ▼
Repository  (Spring Data JPA → Hibernate → PostgreSQL)
    │
    ▼
BillingMapper  (Entity → Response DTO)
    │
    ▼
ResponseEntity<DTO>  ──► JSON response to client
```

---

## 5. Security & Role Matrix

```
Endpoint                         ADMIN  OPERATOR  FINANCE  CUSTOMER
─────────────────────────────────────────────────────────────────────
POST  /api/auth/register           ✓        ✓        ✓        ✗
POST  /api/auth/login              ✓        ✓        ✓        ✓

GET   /api/me/profile              ✗        ✗        ✗        ✓ (own)
GET   /api/me/bills                ✗        ✗        ✗        ✓ (own)
GET   /api/me/payments             ✗        ✗        ✗        ✓ (own)

POST  /api/customers               ✓        ✓        ✗        ✗
GET   /api/customers               ✓        ✓        ✓        ✗
GET   /api/customers/{id}          ✓        ✓        ✓        ✓
PUT   /api/customers/{id}          ✓        ✗        ✗        ✗
PATCH /api/customers/{id}/deact    ✓        ✗        ✗        ✗

POST  /api/meters                  ✓        ✓        ✗        ✗
GET   /api/meters                  ✓        ✓        ✓        ✗
PATCH /api/meters/{id}/deactivate  ✓        ✓        ✗        ✗

POST  /api/meter-readings          ✓        ✓        ✗        ✗
GET   /api/meter-readings          ✓        ✓        ✓        ✗

POST  /api/tariffs                 ✓        ✗        ✓        ✗
GET   /api/tariffs                 ✓        ✓        ✓        ✗

POST  /api/bills/generate          ✓        ✗        ✓        ✗
PATCH /api/bills/{id}/approve      ✓        ✗        ✓        ✗
GET   /api/bills                   ✓        ✗        ✓        ✗
GET   /api/bills/customer/{id}     ✓        ✗        ✓        ✓ (own only)
GET   /api/bills/reference/{ref}   ✓        ✗        ✓        ✓ (own only)
GET   /api/bills/unpaid            ✓        ✗        ✓        ✗

POST  /api/payments                ✗        ✗        ✓        ✗
GET   /api/payments                ✓        ✗        ✓        ✗
GET   /api/payments/customer/{id}  ✓        ✗        ✓        ✓ (own only)

GET   /api/notifications           ✓        ✗        ✓        ✗
```

---

## 6. Billing Workflow (Core Business Flow)

```
[OPERATOR]                [FINANCE]               [CUSTOMER]
     │                        │                        │
     │ 1. Create Customer      │                        │
     │ POST /api/customers     │                        │
     │                        │                        │
     │ 2. Assign Meter         │                        │
     │ POST /api/meters        │                        │
     │                        │                        │
     │ 3. Record Monthly       │                        │
     │    Reading              │                        │
     │ POST /api/meter-readings│                        │
     │                        │                        │
     │                        │ 4. Generate Bill        │
     │                        │ POST /api/bills/generate│
     │                        │   └─ Looks up active    │
     │                        │      tariff for meter   │
     │                        │      type & date        │
     │                        │   └─ Calculates:        │
     │                        │      consumption charge │
     │                        │      + fixed charge     │
     │                        │      + VAT (18%)        │
     │                        │      + penalty (if any) │
     │                        │   └─ Creates Notif      │
     │                        │                        │
     │                        │ 5. Approve Bill         │
     │                        │ PATCH /api/bills/{id}/  │
     │                        │       approve           │
     │                        │                        │
     │                        │ 6. Record Payment       │
     │                        │ POST /api/payments      │
     │                        │   └─ Updates            │
     │                        │      amountPaid &       │
     │                        │      outstandingBalance │
     │                        │   └─ Status:            │
     │                        │      PARTIALLY_PAID or  │
     │                        │      PAID               │
     │                        │   └─ Creates Notif      │
     │                        │                        │
     │                        │               ◄─────────│
     │                        │         7. View bills   │
     │                        │         GET /api/me/    │
     │                        │             bills       │
```

---

## 7. Tariff Calculation Logic

```
FLAT tariff:
  usageCharge = consumption × ratePerUnit

TIER_BASED tariff (progressive):
  usageCharge = Σ ( min(consumption, tierMax) - tierMin ) × tierRate
                  for each tier where consumption > tierMin

  Example: 185 kWh with electricity tiers:
    Tier 1:   0–50  @ 100  → 50  × 100 =  5,000
    Tier 2:  50–150 @ 150  → 100 × 150 = 15,000
    Tier 3: 150–∞  @ 200  → 35  × 200 =  7,000
                              Total usage = 27,000 FRW

totalAmount = usageCharge + fixedCharge + VAT(usageCharge + fixedCharge) + penalty
dueDate     = first day of billingMonth + 1 month + 14 days
```

---

## 8. Database Schema Summary

```
PostgreSQL database: billing_sys

Tables:
  app_users        – system login accounts (staff + linked customers)
  customer         – utility service consumers
  meter            – physical meters assigned to customers
  meter_reading    – monthly readings (unique per meter+month+year)
  tariff           – pricing rules per meter type
  tariff_tier      – progressive pricing tiers for TIER_BASED tariffs
  bill             – generated bills (one per meter reading)
  payment          – payment transactions against bills
  notification     – in-system messages triggered by billing events

Key constraints:
  app_users.customer_id  → customer.id        (1:1, nullable)
  meter.customer_id      → customer.id        (N:1)
  meter_reading.meter_id → meter.id           (N:1, unique per month/year)
  bill.meter_reading_id  → meter_reading.id   (1:1 unique)
  bill.approved_by       → app_users.id       (N:1, nullable)
  payment.bill_id        → bill.id            (N:1)
  payment.recorded_by    → app_users.id       (N:1)
  notification.bill_id   → bill.id            (N:1, nullable)
  tariff_tier.tariff_id  → tariff.id          (N:1, cascade delete)

Audit columns on all main tables (via BaseAuditableEntity):
  created_at, updated_at, created_by, updated_by
```

---

## 9. Technology Stack

```
Layer              Technology
─────────────────────────────────────────────────────
Language           Java 17
Framework          Spring Boot 3.3.5
Security           Spring Security + JWT (jjwt 0.12.x)
ORM                Spring Data JPA / Hibernate
Database           PostgreSQL
Validation         Jakarta Bean Validation
Email              Spring Mail (Gmail SMTP)
API Docs           SpringDoc OpenAPI 3 / Swagger UI
Monitoring         Spring Boot Actuator (/actuator/health)
Utilities          Lombok, MapStruct-style manual mapper
Build              Maven (mvnw wrapper)
Containerization   Docker (.dockerignore present)
```
