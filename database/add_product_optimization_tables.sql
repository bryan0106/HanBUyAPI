-- ============================================
-- PRODUCT API OPTIMIZATION - Additional Tables
-- ============================================

-- ============================================
-- STORES/WAREHOUSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Philippines',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active);

-- ============================================
-- PRODUCT STORES TABLE (Junction table)
-- ============================================
CREATE TABLE IF NOT EXISTS product_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  min_threshold INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_product_stores_product_id ON product_stores(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stores_store_id ON product_stores(store_id);

-- ============================================
-- UPDATE PRODUCTS TABLE
-- ============================================

-- Add reserved stock column
ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_stock INTEGER DEFAULT 0;

-- Add min threshold column
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_threshold INTEGER DEFAULT 10;

-- Add preorder fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS order_deadline TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS release_date TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expected_delivery TIMESTAMP;

-- Add price conversion fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS php_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_conversion_rate DECIMAL(10, 6) DEFAULT 0.042;

-- Add tags field (array)
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add full_description field
ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description TEXT;

-- Add specifications field (JSONB)
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;

-- Update product_variations table to include more fields
ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'size';
ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- ============================================
-- SAMPLE STORES DATA (Optional - for testing)
-- ============================================
-- INSERT INTO stores (name, location, country) VALUES
-- ('Manila Warehouse', 'Manila, Philippines', 'Philippines'),
-- ('Korea Warehouse', 'Seoul, Korea', 'Korea')
-- ON CONFLICT DO NOTHING;

