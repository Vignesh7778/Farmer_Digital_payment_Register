-- Database Triggers and Functions Setup

-- 1. Trigger Function to Validate Fields and Calculate Amount on collections Insertion/Modification
CREATE OR REPLACE FUNCTION process_collection_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Validations
    IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be a positive number greater than zero.' USING ERRCODE = '23514'; -- Check constraint code
    END IF;

    IF NEW.rate IS NULL OR NEW.rate <= 0 THEN
        RAISE EXCEPTION 'Rate must be a positive number greater than zero.' USING ERRCODE = '23514';
    END IF;

    IF NEW.farmer_id IS NULL THEN
        RAISE EXCEPTION 'Farmer reference is required.' USING ERRCODE = '23502'; -- Not null violation
    END IF;

    IF NEW.produce_id IS NULL THEN
        RAISE EXCEPTION 'Produce reference is required.' USING ERRCODE = '23502';
    END IF;

    -- Server-side calculation of derived figure
    NEW.amount := NEW.quantity * NEW.rate;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind Trigger to collections Table
DROP TRIGGER IF EXISTS trg_process_collection_entry ON collections;
CREATE TRIGGER trg_process_collection_entry
BEFORE INSERT OR UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION process_collection_entry();


-- 2. Trigger Function to Auto-generate Payment History records for Auditable Audit Trail
CREATE OR REPLACE FUNCTION create_collection_payment_stub()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO payment_history (collection_id, status, amount_paid, balance_pending, remarks)
    VALUES (NEW.id, 'Pending', 0.00, NEW.amount, 'Initial system collection invoice logged.');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind Trigger to collections Table
DROP TRIGGER IF EXISTS trg_create_collection_payment_stub ON collections;
CREATE TRIGGER trg_create_collection_payment_stub
AFTER INSERT ON collections
FOR EACH ROW
EXECUTE FUNCTION create_collection_payment_stub();
