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
      getBoxType: 'GET /api/box-type'
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

