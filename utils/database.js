const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Neon database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL environment variable is not set');
  console.warn('⚠️  Please set DATABASE_URL in Render dashboard → Environment Variables');
  console.warn('⚠️  Database queries will fail until DATABASE_URL is configured');
}

// Initialize Neon client
// Note: neon() doesn't validate the connection on initialization,
// it only errors when making queries, so the app can start even without DATABASE_URL
const sql = neon(DATABASE_URL || '');

module.exports = sql;

