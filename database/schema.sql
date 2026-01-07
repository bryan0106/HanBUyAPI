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

-- ============================================
-- PRODUCT VARIATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., 'Size', 'Color'
  value VARCHAR(100) NOT NULL, -- e.g., 'Large', 'Red'
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id);

-- ============================================
-- BOXES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  -- Values: 'open', 'closed', 'shipped', 'delivered'
  box_type VARCHAR(10) NOT NULL CHECK (box_type IN ('solo', 'shared')),
  total_weight DECIMAL(10, 3), -- in kg
  total_cbm DECIMAL(10, 4), -- cubic meters
  shipping_fee DECIMAL(10, 2),
  penalty_amount DECIMAL(10, 2) DEFAULT 0,
  closed_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boxes_user_id ON boxes(user_id);
CREATE INDEX IF NOT EXISTS idx_boxes_status ON boxes(status);
CREATE INDEX IF NOT EXISTS idx_boxes_box_number ON boxes(box_number);

-- ============================================
-- BOX ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS box_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  weight DECIMAL(10, 3), -- in kg
  dimensions JSONB, -- { length, width, height } in cm
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_box_items_box_id ON box_items(box_id);
CREATE INDEX IF NOT EXISTS idx_box_items_product_id ON box_items(product_id);
CREATE INDEX IF NOT EXISTS idx_box_items_order_id ON box_items(order_id);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  box_id UUID REFERENCES boxes(id),
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) DEFAULT 0,
  penalty DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'paid', 'overdue', 'cancelled'
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_box_id ON invoices(box_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ============================================
-- COURIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS couriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'DHL', 'FEDEX'
  website_url TEXT,
  tracking_url_template TEXT, -- e.g., 'https://tracking.com/{tracking_number}'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TRACKING EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number VARCHAR(100) NOT NULL,
  courier_id UUID REFERENCES couriers(id),
  courier_name VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'in_transit', 'delivered', 'exception'
  location VARCHAR(255),
  description TEXT,
  event_type VARCHAR(50), -- 'pickup', 'in_transit', 'delivered', etc.
  estimated_delivery TIMESTAMP,
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  box_id UUID REFERENCES boxes(id),
  event_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_tracking_number ON tracking_events(tracking_number);
CREATE INDEX IF NOT EXISTS idx_tracking_events_user_id ON tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_order_id ON tracking_events(order_id);

-- ============================================
-- PAYMENT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  invoice_id UUID REFERENCES invoices(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method JSONB NOT NULL, -- { bank_type, account_number, etc. }
  payment_proof_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_verification',
  -- Values: 'pending_verification', 'verified', 'rejected'
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_invoice_id ON payment_history(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  -- Values: 'order', 'payment', 'box', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  link_url TEXT, -- Optional link to related resource
  metadata JSONB, -- Additional data
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  payment_updates BOOLEAN DEFAULT true,
  box_updates BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ============================================
-- LIKED ITEMS TABLE (Wishlist)
-- ============================================
CREATE TABLE IF NOT EXISTS liked_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- One like per product per user
);

CREATE INDEX IF NOT EXISTS idx_liked_items_user_id ON liked_items(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_items_product_id ON liked_items(product_id);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- MIME type
  file_size BIGINT, -- in bytes
  document_type VARCHAR(50) NOT NULL,
  -- Values: 'payment_proof', 'id', 'invoice', 'other'
  description TEXT,
  related_order_id UUID REFERENCES orders(id),
  related_invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_related_order_id ON documents(related_order_id);

-- Update orders table to reference boxes
ALTER TABLE orders ADD CONSTRAINT fk_orders_box_id FOREIGN KEY (box_id) REFERENCES boxes(id);

