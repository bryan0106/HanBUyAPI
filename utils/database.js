const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

module.exports = sql;

