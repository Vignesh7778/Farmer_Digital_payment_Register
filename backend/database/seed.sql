-- Seed Data for FPG Produce Register

-- 1. Seed Farmers
INSERT INTO farmers (id, name, phone, village, created_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'Ravi Chandran', '9876543210', 'Melur', NOW() - INTERVAL '10 days'),
('f2222222-2222-2222-2222-222222222222', 'Kumar Swamy', '8765432109', 'Alanganallur', NOW() - INTERVAL '9 days'),
('f3333333-3333-3333-3333-333333333333', 'Selvam Muthu', '7654321098', 'Sholavandan', NOW() - INTERVAL '8 days'),
('f4444444-4444-4444-4444-444444444444', 'Rajesh K', '6543210987', 'Othakadai', NOW() - INTERVAL '7 days')
ON CONFLICT (phone) DO UPDATE 
SET name = EXCLUDED.name, village = EXCLUDED.village;

-- 2. Seed Produce Crops
INSERT INTO produce (id, name, unit, created_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'Tomato', 'kg', NOW() - INTERVAL '10 days'),
('a2222222-2222-2222-2222-222222222222', 'Banana', 'bunch', NOW() - INTERVAL '10 days'),
('a3333333-3333-3333-3333-333333333333', 'Milk', 'liter', NOW() - INTERVAL '10 days'),
('a4444444-4444-4444-4444-444444444444', 'Mango', 'kg', NOW() - INTERVAL '10 days'),
('a5555555-5555-5555-5555-555555555555', 'Coconut', 'piece', NOW() - INTERVAL '10 days')
ON CONFLICT (name) DO UPDATE 
SET unit = EXCLUDED.unit;

-- 3. Seed Collections
-- Triggers will automatically calculate amount and create payment_history stubs
INSERT INTO collections (id, farmer_id, produce_id, quantity, rate, collection_date, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 120.00, 20.00, CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('c2222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 45.00, 8.00, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('c3333333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 80.00, 35.00, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('c4444444-4444-4444-4444-444444444444', 'f3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 200.00, 18.50, CURRENT_DATE - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
('c5555555-5555-5555-5555-555555555555', 'f2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 15.00, 10.00, CURRENT_DATE, NOW()),
('c6666666-6666-6666-6666-666666666666', 'f4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 350.00, 50.00, CURRENT_DATE, NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Mark some Payments as 'Paid' to enrich payment status testing
-- We insert updates or new history entries to reflect changes in payment states
UPDATE payment_history 
SET status = 'Paid', paid_date = NOW() - INTERVAL '1 days', remarks = 'Receipt verified, cash handed over to farmer.'
WHERE collection_id IN ('c1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333');
