-- PostgreSQL routine requirement:
-- This trigger automatically creates a notification when a bill row is inserted.
-- Run this file manually in PostgreSQL, or wire it into your preferred migration tool.

CREATE OR REPLACE FUNCTION create_bill_generation_notification()
RETURNS TRIGGER AS $$
DECLARE
    customer_name TEXT;
BEGIN
    SELECT full_name INTO customer_name
    FROM customer
    WHERE id = NEW.customer_id;

    INSERT INTO notification (customer_id, bill_id, message, status, created_at)
    VALUES (
        NEW.customer_id,
        NEW.id,
        'Dear ' || customer_name || ',' || CHR(10) ||
        'Your ' || LPAD(NEW.billing_month::TEXT, 2, '0') || '/' || NEW.billing_year ||
        ' utility bill of ' || NEW.total_amount || ' FRW has been successfully processed.',
        'PENDING',
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bill_generation_notification ON bill;

CREATE TRIGGER trg_bill_generation_notification
AFTER INSERT ON bill
FOR EACH ROW
EXECUTE FUNCTION create_bill_generation_notification();
