-- Seed Test Users for HanBuy Platform
-- Run this script to insert test accounts into your Neon database
-- 
-- IMPORTANT: 
-- 1. First run: database/add_user_auth_columns.sql to add required columns
-- 2. Passwords need to be hashed with bcrypt before inserting
--    Use a bcrypt hasher tool or your backend to generate password hashes
--    Example: bcrypt.hash('test123', 10) or use online tool: https://bcrypt-generator.com/
--
-- For testing, you can use these pre-hashed passwords (password: 'test123'):
-- $2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq

-- Admin User
-- Password: 'admin123' (you need to generate the hash)
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  phone,
  role,
  approval_status,
  address,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001', -- UUID for admin
  'admin@hanbuy.com',
  '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- REPLACE WITH ACTUAL BCRYPT HASH for 'admin123'
  'Admin User',
  '+63 900 000 0000',
  'admin',
  'approved',
  '{"street": "Manila Office", "city": "Manila", "province": "Metro Manila", "zipCode": "1000", "country": "Philippines"}'::jsonb,
  '2024-01-01 00:00:00'::timestamp,
  '2024-01-01 00:00:00'::timestamp
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  approval_status = EXCLUDED.approval_status,
  updated_at = NOW();

-- Customer 1: Maria Santos
-- Password: 'test123' (you need to generate the hash)
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  phone,
  role,
  approval_status,
  address,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002', -- UUID for customer 1
  'customer1@test.com',
  '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- REPLACE WITH ACTUAL BCRYPT HASH for 'test123'
  'Maria Santos',
  '+63 912 345 6789',
  'customer',
  'approved',
  '{"street": "123 Rizal Street", "city": "Makati", "province": "Metro Manila", "zipCode": "1200", "country": "Philippines"}'::jsonb,
  '2024-01-15 00:00:00'::timestamp,
  '2024-01-15 00:00:00'::timestamp
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  approval_status = EXCLUDED.approval_status,
  updated_at = NOW();

-- Customer 2: Juan Dela Cruz
-- Password: 'test123' (you need to generate the hash)
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  phone,
  role,
  approval_status,
  address,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003', -- UUID for customer 2
  'customer2@test.com',
  '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- REPLACE WITH ACTUAL BCRYPT HASH for 'test123'
  'Juan Dela Cruz',
  '+63 923 456 7890',
  'customer',
  'approved',
  '{"street": "456 EDSA", "city": "Quezon City", "province": "Metro Manila", "zipCode": "1100", "country": "Philippines"}'::jsonb,
  '2024-02-01 00:00:00'::timestamp,
  '2024-02-01 00:00:00'::timestamp
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  approval_status = EXCLUDED.approval_status,
  updated_at = NOW();

-- Customer 3: Ana Garcia
-- Password: 'test123' (you need to generate the hash)
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  phone,
  role,
  approval_status,
  address,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440004', -- UUID for customer 3
  'customer3@test.com',
  '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- REPLACE WITH ACTUAL BCRYPT HASH for 'test123'
  'Ana Garcia',
  '+63 934 567 8901',
  'customer',
  'approved',
  '{"street": "789 Ayala Avenue", "city": "BGC", "province": "Taguig", "zipCode": "1634", "country": "Philippines"}'::jsonb,
  '2024-03-10 00:00:00'::timestamp,
  '2024-03-10 00:00:00'::timestamp
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  approval_status = EXCLUDED.approval_status,
  updated_at = NOW();

-- ============================================
-- Verify inserted users
-- ============================================
SELECT 
  id,
  email,
  name,
  role,
  approval_status,
  created_at
FROM users
WHERE email IN (
  'admin@hanbuy.com',
  'customer1@test.com',
  'customer2@test.com',
  'customer3@test.com'
)
ORDER BY role, email;


