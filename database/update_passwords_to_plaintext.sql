-- Update existing user passwords to plain text for simple authentication
-- WARNING: This is for development/testing only - NOT for production!

-- Update test user passwords to plain text
-- Replace the password_hash with plain text passwords

-- Admin user
UPDATE users 
SET password_hash = 'admin123'
WHERE email = 'admin@hanbuy.com';

-- Customer 1
UPDATE users 
SET password_hash = 'test123'
WHERE email = 'customer1@test.com';

-- Customer 2
UPDATE users 
SET password_hash = 'test123'
WHERE email = 'customer2@test.com';

-- Customer 3
UPDATE users 
SET password_hash = 'test123'
WHERE email = 'customer3@test.com';

-- Verify the updates
SELECT email, password_hash, role, approval_status
FROM users
WHERE email IN (
  'admin@hanbuy.com',
  'customer1@test.com',
  'customer2@test.com',
  'customer3@test.com'
);


