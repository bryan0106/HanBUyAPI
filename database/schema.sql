-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
  images TEXT[], -- Array of image URLs
  category VARCHAR(100),
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  weight DECIMAL(10, 3), -- in kg
  dimensions JSONB, -- { length, width, height } in cm
  product_type VARCHAR(20) NOT NULL DEFAULT 'onhand',
  -- Values: 'onhand', 'preorder', 'kr_website'
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- Values: 'active', 'inactive', 'out_of_stock'
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ============================================
-- CART ITEMS TABLE (Optional - for persistent carts)
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  box_type_preference VARCHAR(10) CHECK (box_type_preference IN ('solo', 'shared')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- One cart item per product per user
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  isf DECIMAL(10, 2) NOT NULL, -- International Service Fee (Korea to Manila)
  lsf DECIMAL(10, 2) NOT NULL, -- Local Service Fee (Manila to customer)
  shipping_fee DECIMAL(10, 2) NOT NULL, -- Total (ISF + LSF)
  solo_shipping_fee DECIMAL(10, 2),
  shared_shipping_fee DECIMAL(10, 2),
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
  
  -- Order Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'confirmed', 'processing', 'packed', 
  --         'in_transit_to_manila', 'received_at_manila', 
  --         'consolidated', 'shipped', 'delivered', 'cancelled'
  
  -- Payment
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'partial', 'paid', 'failed', 'refunded'
  payment_type VARCHAR(20) NOT NULL DEFAULT 'full',
  -- Values: 'full', 'downpayment'
  payment_method JSONB, -- { type: 'qr_code', bank: 'GCASH', ... }
  downpayment_amount DECIMAL(10, 2),
  downpayment_paid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2),
  qr_code TEXT,
  proof_of_payment_url TEXT,
  paid_at TIMESTAMP,
  
  -- Shipping
  box_type_preference VARCHAR(10) NOT NULL CHECK (box_type_preference IN ('solo', 'shared')),
  shipping_address JSONB NOT NULL, -- { street, city, province, zipCode, country }
  
  -- Fulfillment
  fulfillment_status VARCHAR(50),
  -- Values: 'pending_packing', 'packed', 'in_transit_to_manila', 
  --         'received_at_manila', 'consolidated', 'ready_for_delivery',
  --         'out_for_delivery', 'delivered'
  box_id UUID, -- References boxes(id) - nullable initially
  ph_courier_tracking_number VARCHAR(100),
  ph_courier_name VARCHAR(50),
  
  -- Timestamps
  packed_at TIMESTAMP,
  shipped_to_manila_at TIMESTAMP,
  received_at_manila_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_box_id ON orders(box_id);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL, -- Denormalized for historical accuracy
  product_type VARCHAR(20) NOT NULL, -- 'onhand', 'preorder', 'kr_website'
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  preorder_release_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

