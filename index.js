const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection on startup
async function initializeDatabase() {
  const sql = require('./utils/database');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
    console.error('❌ Please set DATABASE_URL in Render dashboard → Environment Variables');
    return false;
  }

  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Database connected successfully');
    console.log(`   Current time: ${result[0].current_time}`);
    console.log(`   PostgreSQL version: ${result[0].pg_version.split(' ')[0]} ${result[0].pg_version.split(' ')[1]}`);
    
    // Test if products table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        ) as exists
      `;
      
      if (!tableCheck[0].exists) {
        console.warn('⚠️  WARNING: products table does not exist!');
        console.warn('⚠️  Please run database/schema.sql and database/add_product_optimization_tables.sql');
      } else {
        console.log('✅ Products table exists');
      }
    } catch (tableError) {
      console.warn('⚠️  Could not check for products table:', tableError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    console.error('❌ Please check:');
    console.error('   1. DATABASE_URL is set correctly in Render dashboard');
    console.error('   2. Database is accessible from Render');
    console.error('   3. Connection string format is correct');
    return false;
  }
}

// Middleware
const corsMiddleware = require('./middleware/cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const routes = require('./routes');
app.use('/', routes);

// Error handling middleware (must be after routes)
app.use(errorHandler);
app.use(notFoundHandler);

// Start server
async function startServer() {
  const dbConnected = await initializeDatabase();
  
  if (!dbConnected) {
    console.error('❌ Server starting but database connection failed!');
    console.error('❌ API endpoints may not work correctly.');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
