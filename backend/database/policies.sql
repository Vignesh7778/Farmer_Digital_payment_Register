-- Row Level Security (RLS) Configuration and Policies Setup

-- Enable RLS on all tables
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- 1. Farmers Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON farmers;
CREATE POLICY "Enable read access for all users" 
ON farmers FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON farmers;
CREATE POLICY "Enable insert access for all users" 
ON farmers FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON farmers;
CREATE POLICY "Enable update access for all users" 
ON farmers FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON farmers;
CREATE POLICY "Enable delete access for all users" 
ON farmers FOR DELETE 
USING (true);


-- 2. Produce Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON produce;
CREATE POLICY "Enable read access for all users" 
ON produce FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON produce;
CREATE POLICY "Enable insert access for all users" 
ON produce FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON produce;
CREATE POLICY "Enable update access for all users" 
ON produce FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON produce;
CREATE POLICY "Enable delete access for all users" 
ON produce FOR DELETE 
USING (true);


-- 3. Collections Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON collections;
CREATE POLICY "Enable read access for all users" 
ON collections FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON collections;
CREATE POLICY "Enable insert access for all users" 
ON collections FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON collections;
CREATE POLICY "Enable update access for all users" 
ON collections FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON collections;
CREATE POLICY "Enable delete access for all users" 
ON collections FOR DELETE 
USING (true);


-- 4. Payment History Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_history;
CREATE POLICY "Enable read access for all users" 
ON payment_history FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON payment_history;
CREATE POLICY "Enable insert access for all users" 
ON payment_history FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON payment_history;
CREATE POLICY "Enable update access for all users" 
ON payment_history FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON payment_history;
CREATE POLICY "Enable delete access for all users" 
ON payment_history FOR DELETE 
USING (true);
