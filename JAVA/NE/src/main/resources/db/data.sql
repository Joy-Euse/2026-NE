-- Seed data for local API testing.
-- All user passwords: password123
-- This file avoids fixed primary keys so it can run safely many times.

INSERT INTO customer (full_name, national_id, email, phone_number, address, status, created_at, updated_at, created_by, updated_by)
VALUES
    ('Alice Uwase', '1199880012345678', 'alice@example.com', '0788100001', 'KG 5 Ave, Kigali', 'ACTIVE', NOW(), NOW(), 'system', 'system'),
    ('Bob Niyonzima', '1198770023456789', 'bob@example.com', '0788100002', 'KN 3 Rd, Kigali', 'ACTIVE', NOW(), NOW(), 'system', 'system'),
    ('Claire Mutesi', '1200110034567890', 'claire@example.com', '0788100003', 'KK 15 St, Kigali', 'ACTIVE', NOW(), NOW(), 'system', 'system'),
    ('David Hakizimana', '1197660045678901', 'david@example.com', '0788100004', 'Musanze, Northern Province', 'INACTIVE', NOW(), NOW(), 'system', 'system')
ON CONFLICT (national_id) DO NOTHING;

INSERT INTO app_users (full_name, email, phone_number, password, status, role, email_verified, customer_id, created_at, updated_at, created_by, updated_by)
VALUES
    ('System Admin', 'admin@utility.test', '0780000001', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_ADMIN', TRUE, NULL, NOW(), NOW(), 'system', 'system'),
    ('Meter Operator', 'operator@utility.test', '0780000002', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_OPERATOR', TRUE, NULL, NOW(), NOW(), 'system', 'system'),
    ('Finance Officer', 'finance@utility.test', '0780000003', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_FINANCE', TRUE, NULL, NOW(), NOW(), 'system', 'system'),
    ('Joy euse Admin', 'iradukundajoyeuse34@gmail.com', '0780000009', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_ADMIN', TRUE, NULL, NOW(), NOW(), 'system', 'system')
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    status = EXCLUDED.status,
    role = EXCLUDED.role,
    email_verified = TRUE,
    updated_at = NOW(),
    updated_by = 'system';

INSERT INTO app_users (full_name, email, phone_number, password, status, role, email_verified, customer_id, created_at, updated_at, created_by, updated_by)
VALUES
    ('Alice Uwase', 'alice.login@utility.test', '0788100001', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_CUSTOMER', TRUE, (SELECT id FROM customer WHERE national_id = '1199880012345678'), NOW(), NOW(), 'system', 'system'),
    ('Bob Niyonzima', 'bob.login@utility.test', '0788100002', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_CUSTOMER', TRUE, (SELECT id FROM customer WHERE national_id = '1198770023456789'), NOW(), NOW(), 'system', 'system'),
    ('Claire Mutesi', 'claire.login@utility.test', '0788100003', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_CUSTOMER', TRUE, (SELECT id FROM customer WHERE national_id = '1200110034567890'), NOW(), NOW(), 'system', 'system')
ON CONFLICT (email) DO UPDATE
SET customer_id = EXCLUDED.customer_id,
    status = EXCLUDED.status,
    role = EXCLUDED.role,
    email_verified = TRUE,
    updated_at = NOW(),
    updated_by = 'system';

INSERT INTO meter (meter_number, meter_type, installation_date, status, customer_id, created_at, updated_at, created_by, updated_by)
VALUES
    ('WTR-10001', 'WATER', '2024-01-15', 'ACTIVE', (SELECT id FROM customer WHERE national_id = '1199880012345678'), NOW(), NOW(), 'system', 'system'),
    ('ELC-10001', 'ELECTRICITY', '2024-01-15', 'ACTIVE', (SELECT id FROM customer WHERE national_id = '1199880012345678'), NOW(), NOW(), 'system', 'system'),
    ('WTR-10002', 'WATER', '2024-03-10', 'ACTIVE', (SELECT id FROM customer WHERE national_id = '1198770023456789'), NOW(), NOW(), 'system', 'system'),
    ('ELC-10002', 'ELECTRICITY', '2024-03-10', 'ACTIVE', (SELECT id FROM customer WHERE national_id = '1198770023456789'), NOW(), NOW(), 'system', 'system'),
    ('WTR-10003', 'WATER', '2024-06-01', 'ACTIVE', (SELECT id FROM customer WHERE national_id = '1200110034567890'), NOW(), NOW(), 'system', 'system'),
    ('ELC-10003', 'ELECTRICITY', '2024-06-01', 'ACTIVE', (SELECT id FROM customer WHERE national_id = '1200110034567890'), NOW(), NOW(), 'system', 'system'),
    ('WTR-10004', 'WATER', '2023-05-20', 'INACTIVE', (SELECT id FROM customer WHERE national_id = '1197660045678901'), NOW(), NOW(), 'system', 'system')
ON CONFLICT (meter_number) DO NOTHING;

INSERT INTO tariff (meter_type, tariff_type, rate_per_unit, fixed_charge, vat_percentage, penalty_percentage, effective_from, effective_to, active, created_at, updated_at, created_by, updated_by)
VALUES
    ('WATER', 'FLAT', 500.00, 1000.00, 18.00, 2.00, '2025-01-01', NULL, TRUE, NOW(), NOW(), 'system', 'system'),
    ('ELECTRICITY', 'TIER_BASED', 100.00, 1500.00, 18.00, 2.00, '2025-01-01', NULL, TRUE, NOW(), NOW(), 'system', 'system')
ON CONFLICT DO NOTHING;

INSERT INTO tariff_tier (tariff_id, min_unit, max_unit, rate_per_unit)
VALUES
    ((SELECT id FROM tariff WHERE meter_type = 'ELECTRICITY' AND active = TRUE ORDER BY id LIMIT 1), 0.00, 50.00, 100.00),
    ((SELECT id FROM tariff WHERE meter_type = 'ELECTRICITY' AND active = TRUE ORDER BY id LIMIT 1), 50.00, 150.00, 150.00),
    ((SELECT id FROM tariff WHERE meter_type = 'ELECTRICITY' AND active = TRUE ORDER BY id LIMIT 1), 150.00, NULL, 200.00)
ON CONFLICT DO NOTHING;

INSERT INTO meter_reading (meter_id, previous_reading, current_reading, consumption, reading_month, reading_year, reading_date, created_at, updated_at, created_by, updated_by)
VALUES
    ((SELECT id FROM meter WHERE meter_number = 'WTR-10001'), 0.00, 45.00, 45.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'WTR-10001'), 45.00, 102.00, 57.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'ELC-10001'), 0.00, 120.00, 120.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'ELC-10001'), 120.00, 305.00, 185.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'WTR-10002'), 0.00, 30.00, 30.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'WTR-10002'), 30.00, 75.00, 45.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'ELC-10002'), 0.00, 80.00, 80.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'ELC-10002'), 80.00, 200.00, 120.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'WTR-10003'), 0.00, 60.00, 60.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    ((SELECT id FROM meter WHERE meter_number = 'ELC-10003'), 0.00, 95.00, 95.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system')
ON CONFLICT DO NOTHING;
