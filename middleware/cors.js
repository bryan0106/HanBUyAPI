const cors = require('cors');

// CORS configuration - using environment variables
const getAllowedOrigins = () => {
  const origins = [];
  
  // Always allow localhost for local development, staging, and building
  // This works in all environments (development, staging, production)
  // Common ports used by frontend frameworks
  const localhostPorts = [3000, 3001, 5173, 8080, 4200, 5174, 5175];
  localhostPorts.forEach(port => {
    origins.push(`http://localhost:${port}`);
    origins.push(`http://127.0.0.1:${port}`);
  });
  
  // Also allow any localhost port pattern for maximum flexibility
  origins.push(/^http:\/\/localhost:\d+$/);
  origins.push(/^http:\/\/127\.0\.0\.1:\d+$/);
  
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

