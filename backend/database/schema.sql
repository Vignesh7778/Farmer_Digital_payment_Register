-- Database Schema Setup
-- Farmers, Produce Types, Collections Register, and Payment History

-- Enable uuid-ossp if needed (already enabled in Supabase by default, but safe to declare)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Farmers Table
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    village VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for search optimization
CREATE INDEX IF NOT EXISTS idx_farmers_name ON farmers(name);
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);

-- 2. Produce Table (Crop registry)
CREATE TABLE IF NOT EXISTS produce (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL, -- e.g., 'kg', 'liter', 'bunch', 'piece'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_produce_name ON produce(name);

-- 3. Collections Table (Produce Collection Register)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    produce_id UUID NOT NULL REFERENCES produce(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL,
    rate NUMERIC(10, 2) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL, -- Calculated via trigger
    collection_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for dashboard and statements query performance
CREATE INDEX IF NOT EXISTS idx_collections_farmer ON collections(farmer_id);
CREATE INDEX IF NOT EXISTS idx_collections_produce ON collections(produce_id);
CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collection_date);

-- 4. Payment History Table (Audit Trail of payments/status edits)
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    balance_pending NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_date TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT chk_payment_status CHECK (status IN ('Pending', 'Paid', 'Partially Paid'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_collection ON payment_history(collection_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
