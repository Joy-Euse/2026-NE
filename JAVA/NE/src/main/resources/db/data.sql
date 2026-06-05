-- Sample data for local API testing. Enable spring.sql.init.mode=always if you want Spring to load it.
-- Password for all users below: password123

INSERT INTO app_users (id, full_name, email, phone_number, password, status, role, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'System Admin', 'admin@utility.test', '+250780000001', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_ADMIN', NOW(), NOW(), 'system', 'system'),
    (2, 'Meter Operator', 'operator@utility.test', '+250780000002', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_OPERATOR', NOW(), NOW(), 'system', 'system'),
    (3, 'Finance Officer', 'finance@utility.test', '+250780000003', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_FINANCE', NOW(), NOW(), 'system', 'system'),
    (4, 'Customer User', 'customer@utility.test', '+250780000004', '$2a$10$9KkkI8mU/yOVQ2fx07L1aOIo6CFXY3GxvM77oOOkS4RVKxRZGWxEi', 'ACTIVE', 'ROLE_CUSTOMER', NOW(), NOW(), 'system', 'system')
ON CONFLICT (email) DO NOTHING;

INSERT INTO customer (id, full_name, national_id, email, phone_number, address, status, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'Alice Uwase', 'NID-10001', 'alice@example.com', '+250788100001', 'Kigali, Rwanda', 'ACTIVE', NOW(), NOW(), 'system', 'system')
ON CONFLICT (national_id) DO NOTHING;

INSERT INTO meter (id, meter_number, meter_type, installation_date, status, customer_id, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'WTR-10001', 'WATER', CURRENT_DATE - INTERVAL '1 year', 'ACTIVE', 1, NOW(), NOW(), 'system', 'system'),
    (2, 'ELC-10001', 'ELECTRICITY', CURRENT_DATE - INTERVAL '1 year', 'ACTIVE', 1, NOW(), NOW(), 'system', 'system')
ON CONFLICT (meter_number) DO NOTHING;

INSERT INTO tariff (id, meter_type, tariff_type, rate_per_unit, fixed_charge, vat_percentage, penalty_percentage, effective_from, effective_to, active, created_at, updated_at, created_by, updated_by)
VALUES
    (1, 'WATER', 'FLAT', 500.00, 1000.00, 18.00, 2.00, CURRENT_DATE, NULL, TRUE, NOW(), NOW(), 'system', 'system'),
    (2, 'ELECTRICITY', 'FLAT', 250.00, 1500.00, 18.00, 2.00, CURRENT_DATE, NULL, TRUE, NOW(), NOW(), 'system', 'system')
ON CONFLICT DO NOTHING;
