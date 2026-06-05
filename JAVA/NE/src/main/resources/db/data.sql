-- Seed data for local API testing.
-- All user passwords: password123

-- 1. Customers must exist before app_users can reference customer_id.
INSERT INTO customer (id, full_name, national_id, email, phone_number, address, status, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'Alice Uwase', '1199880012345678', 'alice@example.com', '+250788100001', 'KG 5 Ave, Kigali', 'ACTIVE', NOW(), NOW(), 'system', 'system'),
    (2, 'Bob Niyonzima', '1198770023456789', 'bob@example.com', '+250788100002', 'KN 3 Rd, Kigali', 'ACTIVE', NOW(), NOW(), 'system', 'system'),
    (3, 'Claire Mutesi', '1200110034567890', 'claire@example.com', '+250788100003', 'KK 15 St, Kigali', 'ACTIVE', NOW(), NOW(), 'system', 'system'),
    (4, 'David Hakizimana', '1197660045678901', 'david@example.com', '+250788100004', 'Musanze, Northern Province', 'INACTIVE', NOW(), NOW(), 'system', 'system')
ON CONFLICT (national_id) DO NOTHING;

-- 2. Users. Customer role accounts are linked to their customer profile.
INSERT INTO app_users (id, full_name, email, phone_number, password, status, role, customer_id, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'System Admin', 'admin@utility.test', '+250780000001', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_ADMIN', NULL, NOW(), NOW(), 'system', 'system'),
    (2, 'Meter Operator', 'operator@utility.test', '+250780000002', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_OPERATOR', NULL, NOW(), NOW(), 'system', 'system'),
    (3, 'Finance Officer', 'finance@utility.test', '+250780000003', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_FINANCE', NULL, NOW(), NOW(), 'system', 'system'),
    (4, 'Alice Uwase', 'alice.login@utility.test', '+250788100001', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_CUSTOMER', 1, NOW(), NOW(), 'system', 'system'),
    (5, 'Bob Niyonzima', 'bob.login@utility.test', '+250788100002', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_CUSTOMER', 2, NOW(), NOW(), 'system', 'system'),
    (6, 'Claire Mutesi', 'claire.login@utility.test', '+250788100003', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_CUSTOMER', 3, NOW(), NOW(), 'system', 'system')
ON CONFLICT (email) DO NOTHING;

UPDATE app_users SET customer_id = 1 WHERE email = 'alice.login@utility.test' AND customer_id IS NULL;
UPDATE app_users SET customer_id = 2 WHERE email = 'bob.login@utility.test' AND customer_id IS NULL;
UPDATE app_users SET customer_id = 3 WHERE email = 'claire.login@utility.test' AND customer_id IS NULL;

-- 3. Meters.
INSERT INTO meter (id, meter_number, meter_type, installation_date, status, customer_id, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'WTR-10001', 'WATER', '2024-01-15', 'ACTIVE', 1, NOW(), NOW(), 'system', 'system'),
    (2, 'ELC-10001', 'ELECTRICITY', '2024-01-15', 'ACTIVE', 1, NOW(), NOW(), 'system', 'system'),
    (3, 'WTR-10002', 'WATER', '2024-03-10', 'ACTIVE', 2, NOW(), NOW(), 'system', 'system'),
    (4, 'ELC-10002', 'ELECTRICITY', '2024-03-10', 'ACTIVE', 2, NOW(), NOW(), 'system', 'system'),
    (5, 'WTR-10003', 'WATER', '2024-06-01', 'ACTIVE', 3, NOW(), NOW(), 'system', 'system'),
    (6, 'ELC-10003', 'ELECTRICITY', '2024-06-01', 'ACTIVE', 3, NOW(), NOW(), 'system', 'system'),
    (7, 'WTR-10004', 'WATER', '2023-05-20', 'INACTIVE', 4, NOW(), NOW(), 'system', 'system')
ON CONFLICT (meter_number) DO NOTHING;

-- 4. Tariffs.
INSERT INTO tariff (id, meter_type, tariff_type, rate_per_unit, fixed_charge, vat_percentage, penalty_percentage, effective_from, effective_to, active, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'WATER', 'FLAT', 500.00, 1000.00, 18.00, 2.00, '2025-01-01', NULL, TRUE, NOW(), NOW(), 'system', 'system'),
    (2, 'ELECTRICITY', 'TIER_BASED', 100.00, 1500.00, 18.00, 2.00, '2025-01-01', NULL, TRUE, NOW(), NOW(), 'system', 'system')
ON CONFLICT DO NOTHING;

INSERT INTO tariff_tier (id, tariff_id, min_unit, max_unit, rate_per_unit)
VALUES
    (1, 2, 0.00, 50.00, 100.00),
    (2, 2, 50.00, 150.00, 150.00),
    (3, 2, 150.00, NULL, 200.00)
ON CONFLICT DO NOTHING;

-- 5. Meter readings.
INSERT INTO meter_reading (id, meter_id, previous_reading, current_reading, consumption, reading_month, reading_year, reading_date, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 1, 0.00, 45.00, 45.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    (2, 1, 45.00, 102.00, 57.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    (3, 2, 0.00, 120.00, 120.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    (4, 2, 120.00, 305.00, 185.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    (5, 3, 0.00, 30.00, 30.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    (6, 3, 30.00, 75.00, 45.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    (7, 4, 0.00, 80.00, 80.00, 4, 2026, '2026-04-30', NOW(), NOW(), 'system', 'system'),
    (8, 4, 80.00, 200.00, 120.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    (9, 5, 0.00, 60.00, 60.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system'),
    (10, 6, 0.00, 95.00, 95.00, 5, 2026, '2026-05-31', NOW(), NOW(), 'system', 'system')
ON CONFLICT DO NOTHING;

-- Sequence alignment.
SELECT setval(pg_get_serial_sequence('app_users', 'id'), GREATEST((SELECT MAX(id) FROM app_users), 10));
SELECT setval(pg_get_serial_sequence('customer', 'id'), GREATEST((SELECT MAX(id) FROM customer), 10));
SELECT setval(pg_get_serial_sequence('meter', 'id'), GREATEST((SELECT MAX(id) FROM meter), 10));
SELECT setval(pg_get_serial_sequence('tariff', 'id'), GREATEST((SELECT MAX(id) FROM tariff), 10));
SELECT setval(pg_get_serial_sequence('tariff_tier', 'id'), GREATEST((SELECT MAX(id) FROM tariff_tier), 10));
SELECT setval(pg_get_serial_sequence('meter_reading', 'id'), GREATEST((SELECT MAX(id) FROM meter_reading), 20));
