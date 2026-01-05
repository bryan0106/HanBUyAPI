const cors = require('cors');

// CORS configuration - using environment variables
const getAllowedOrigins = () => {
  const origins = [];
  
  // Always allow localhost for development
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000');
  }
  
  // Add origins from environment variable (comma-separated)
  if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    origins.push(...envOrigins);
  }
  
  // Add Vercel pattern if enabled (default: true for production)
  if (process.env.ALLOW_VERCEL_PREVIEWS !== 'false') {
    origins.push(/^https:\/\/.*\.vercel\.app$/);
  }
  
  return origins.length > 0 ? origins : ['http://localhost:3000'];
};

const corsMiddleware = cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

module.exports = corsMiddleware;

