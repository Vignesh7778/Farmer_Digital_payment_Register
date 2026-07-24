-- Database Views for Detailed Reports and Queries

-- 1. Detailed Collections View joining Farmers, Produce, and Payment Status
CREATE OR REPLACE VIEW collections_detailed AS
SELECT 
    c.id AS collection_id,
    c.farmer_id,
    f.name AS farmer_name,
    f.phone AS farmer_phone,
    f.village AS farmer_village,
    c.produce_id,
    p.name AS produce_name,
    p.unit AS produce_unit,
    c.quantity,
    c.rate,
    c.amount,
    c.collection_date,
    c.created_at AS collection_created_at,
    COALESCE(ph.status, 'Pending') AS payment_status,
    ph.paid_date AS payment_paid_date,
    ph.remarks AS payment_remarks,
    ph.id AS payment_history_id,
    COALESCE(ph.amount_paid, 0.00) AS amount_paid,
    COALESCE(ph.balance_pending, c.amount) AS balance_pending
FROM collections c
JOIN farmers f ON c.farmer_id = f.id
JOIN produce p ON c.produce_id = p.id
LEFT JOIN LATERAL (
    -- Get the latest payment status history record for the collection
    SELECT id, status, paid_date, remarks, amount_paid, balance_pending
    FROM payment_history
    WHERE collection_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
) ph ON TRUE;

-- 2. Farmer Cumulative Summary Statement View
CREATE OR REPLACE VIEW farmer_statements_summary AS
SELECT 
    f.id AS farmer_id,
    f.name AS farmer_name,
    f.phone AS farmer_phone,
    f.village AS farmer_village,
    COUNT(c.id) AS total_deliveries,
    COALESCE(SUM(c.quantity), 0) AS total_quantity,
    COALESCE(SUM(c.amount), 0) AS total_amount,
    COALESCE(SUM(CASE WHEN ph.status = 'Paid' THEN c.amount WHEN ph.status = 'Partially Paid' THEN ph.amount_paid ELSE 0.00 END), 0) AS total_paid,
    COALESCE(SUM(CASE WHEN ph.status = 'Paid' THEN 0.00 WHEN ph.status = 'Partially Paid' THEN ph.balance_pending ELSE c.amount END), 0) AS total_pending
FROM farmers f
LEFT JOIN collections c ON f.id = c.farmer_id
LEFT JOIN LATERAL (
    SELECT status, amount_paid, balance_pending
    FROM payment_history 
    WHERE collection_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
) ph ON TRUE
GROUP BY f.id, f.name, f.phone, f.village;
