const sql = require('../utils/database');

const getHealth = async (req, res) => {
  try {
    // Test basic database connection
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    // Check if products table exists
    let productsTableExists = false;
    let productsCount = 0;
    let productsTableError = null;
    
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        ) as exists
      `;
      productsTableExists = tableCheck[0].exists;
      
      if (productsTableExists) {
        // Try to count products (this will fail if table structure is wrong)
        try {
          const countResult = await sql`SELECT COUNT(*) as count FROM products`;
          productsCount = parseInt(countResult[0].count);
        } catch (countError) {
          productsTableError = countError.message;
        }
      }
    } catch (tableError) {
      productsTableError = tableError.message;
    }
    
    const health = {
      status: 'OK',
      database: 'Connected',
      timestamp: result[0].current_time,
      postgres_version: result[0].pg_version.split(' ')[0] + ' ' + result[0].pg_version.split(' ')[1],
      tables: {
        products: {
          exists: productsTableExists,
          count: productsTableExists ? productsCount : null,
          error: productsTableError
        }
      }
    };
    
    // If products table doesn't exist, return warning status
    if (!productsTableExists) {
      health.status = 'WARNING';
      health.message = 'Products table does not exist. Please run database migrations.';
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        detail: error.detail,
        hint: error.hint
      } : undefined
    });
  }
};

module.exports = {
  getHealth
};

