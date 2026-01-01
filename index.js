const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

// CORS middleware - Allow requests from frontend
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
app.get('/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: result[0].current_time,
      postgres_version: result[0].pg_version
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// Example route with database query
app.get('/api/users', async (req, res) => {
  try {
    // Example: Get all users from a users table (create this table if needed)
    const users = await sql`SELECT * FROM users LIMIT 10`;
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    // If table doesn't exist, return empty array
    if (error.message.includes('does not exist')) {
      res.json({
        success: true,
        data: [],
        message: 'Table does not exist yet. Create a users table to see data here.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Get bank_type enum values
app.get('/api/bank-type', async (req, res) => {
  try {
    // Query PostgreSQL system catalog to get enum values
    const result = await sql`
      SELECT enumlabel as value 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'bank_type'
      )
      ORDER BY enumsortorder
    `;
    
    res.json({
      success: true,
      data: result,
      values: result.map(row => row.value),
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching bank_type enum:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get box_type enum values
app.get('/api/box-type', async (req, res) => {
  try {
    // Query PostgreSQL system catalog to get enum values
    const result = await sql`
      SELECT enumlabel as value 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'box_type'
      )
      ORDER BY enumsortorder
    `;
    
    res.json({
      success: true,
      data: result,
      values: result.map(row => row.value),
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching box_type enum:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ============================================
// CART ENDPOINTS
// ============================================

// Get cart items for a user
app.get('/api/cart', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id query parameter is required'
      });
    }

    const cartItems = await sql`
      SELECT 
        ci.*,
        p.name as product_name,
        p.price,
        p.currency,
        p.images,
        p.product_type,
        p.status as product_status
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${user_id}
      ORDER BY ci.created_at DESC
    `;
    
    res.json({
      success: true,
      data: cartItems,
      count: cartItems.length
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add item to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { user_id, product_id, quantity, box_type_preference } = req.body;
    
    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'user_id, product_id, and quantity are required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'quantity must be greater than 0'
      });
    }

    // Check if product exists
    const product = await sql`
      SELECT id, name, status FROM products WHERE id = ${product_id}
    `;
    
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Insert or update cart item
    const result = await sql`
      INSERT INTO cart_items (user_id, product_id, quantity, box_type_preference)
      VALUES (${user_id}, ${product_id}, ${quantity}, ${box_type_preference || null})
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET 
        quantity = cart_items.quantity + ${quantity},
        box_type_preference = COALESCE(EXCLUDED.box_type_preference, cart_items.box_type_preference),
        updated_at = NOW()
      RETURNING *
    `;
    
    res.status(201).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ORDER ENDPOINTS
// ============================================

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      user_id,
      order_number,
      subtotal,
      isf,
      lsf,
      shipping_fee,
      solo_shipping_fee,
      shared_shipping_fee,
      total,
      currency = 'PHP',
      status = 'pending',
      payment_status = 'pending',
      payment_type = 'full',
      payment_method,
      downpayment_amount,
      balance,
      qr_code,
      box_type_preference,
      shipping_address,
      order_items
    } = req.body;

    // Validation
    if (!user_id || !order_number || !subtotal || !total || !box_type_preference || !shipping_address || !order_items) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, order_number, subtotal, total, box_type_preference, shipping_address, order_items'
      });
    }

    if (!Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'order_items must be a non-empty array'
      });
    }

    // Calculate shipping fee if not provided
    const calculatedShippingFee = shipping_fee || (isf || 0) + (lsf || 0);

    // Start transaction - create order
    const order = await sql`
      INSERT INTO orders (
        user_id, order_number, subtotal, isf, lsf, shipping_fee,
        solo_shipping_fee, shared_shipping_fee, total, currency,
        status, payment_status, payment_type, payment_method,
        downpayment_amount, balance, qr_code, box_type_preference, shipping_address
      )
      VALUES (
        ${user_id}, ${order_number}, ${subtotal}, ${isf || 0}, ${lsf || 0}, ${calculatedShippingFee},
        ${solo_shipping_fee || null}, ${shared_shipping_fee || null}, ${total}, ${currency},
        ${status}, ${payment_status}, ${payment_type}, ${payment_method ? JSON.stringify(payment_method) : null},
        ${downpayment_amount || null}, ${balance || null}, ${qr_code || null}, ${box_type_preference}, ${JSON.stringify(shipping_address)}
      )
      RETURNING *
    `;

    const orderId = order[0].id;

    // Insert order items
    const itemsToInsert = order_items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_type: item.product_type || 'onhand',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      image_url: item.image_url || null,
      preorder_release_date: item.preorder_release_date || null
    }));

    for (const item of itemsToInsert) {
      await sql`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_type,
          quantity, unit_price, total, image_url, preorder_release_date
        )
        VALUES (
          ${item.order_id}, ${item.product_id}, ${item.product_name}, ${item.product_type},
          ${item.quantity}, ${item.unit_price}, ${item.total}, ${item.image_url}, ${item.preorder_release_date}
        )
      `;
    }

    // Get complete order with items
    const completeOrder = await sql`
      SELECT o.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_type', oi.product_type,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total', oi.total,
              'image_url', oi.image_url,
              'preorder_release_date', oi.preorder_release_date
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${orderId}
      GROUP BY o.id
    `;

    res.status(201).json({
      success: true,
      data: completeOrder[0]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get orders (with optional user_id, status, payment_status filters)
app.get('/api/orders', async (req, res) => {
  try {
    const { user_id, status, payment_status } = req.query;
    let orders;
    if (user_id && status && payment_status) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id} AND o.status = ${status} AND o.payment_status = ${payment_status}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else if (user_id && status) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id} AND o.status = ${status}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else if (user_id && payment_status) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id} AND o.payment_status = ${payment_status}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else if (user_id) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else {
      // No filters - get all orders (limited)
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 100
      `;
    }
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a specific order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await sql`
      SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_type', oi.product_type,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total', oi.total,
              'image_url', oi.image_url,
              'preorder_release_date', oi.preorder_release_date
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${id}
      GROUP BY o.id
    `;

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order[0]
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Example POST route
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Example: Insert a user (create users table first)
    const result = await sql`
      INSERT INTO users (name, email, created_at) 
      VALUES (${name}, ${email}, NOW()) 
      RETURNING *
    `;
    
    res.status(201).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    if (error.message.includes('does not exist')) {
      res.status(500).json({
        success: false,
        error: 'Users table does not exist. Please create it first.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Express.js server with Neon Postgres is running!',
    endpoints: {
      health: '/health',
      getUsers: 'GET /api/users',
      createUser: 'POST /api/users',
      getBankType: 'GET /api/bank-type',
      getBoxType: 'GET /api/box-type',
      getCart: 'GET /api/cart?user_id=UUID',
      addToCart: 'POST /api/cart',
      createOrder: 'POST /api/orders',
      getOrders: 'GET /api/orders?user_id=UUID&status=string&payment_status=string',
      getOrderById: 'GET /api/orders/:id'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Database connected to Neon Postgres`);
});

