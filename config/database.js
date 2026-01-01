const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

// Test database connection
async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connected successfully at:', result[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
}

module.exports = {
  sql,
  testConnection
};

