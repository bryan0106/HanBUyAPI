const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true';
  
  if (DEBUG_AUTH) {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    console.log('Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');
    console.log('All headers:', Object.keys(req.headers));
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (DEBUG_AUTH) {
      console.log('❌ AUTH FAILED: No valid Authorization header');
      console.log('  - Header exists:', !!authHeader);
      console.log('  - Starts with Bearer:', authHeader?.startsWith('Bearer '));
    }
    return res.status(401).json({
      success: false,
      error: 'No token provided',
      code: 'UNAUTHORIZED',
      details: DEBUG_AUTH ? {
        hasHeader: !!authHeader,
        headerPrefix: authHeader?.substring(0, 10) || 'none'
      } : undefined
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (DEBUG_AUTH) {
    console.log('Token extracted (first 20 chars):', token.substring(0, 20) + '...');
    console.log('Token length:', token.length);
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    
    if (DEBUG_AUTH) {
      console.log('✅ Token verified successfully');
      console.log('Decoded user:', { id: decoded.id, email: decoded.email, role: decoded.role });
    }
    
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    if (DEBUG_AUTH) {
      console.log('❌ Token verification failed');
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      if (error.name === 'TokenExpiredError') {
        console.log('Token expired at:', error.expiredAt);
      }
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'UNAUTHORIZED',
      details: DEBUG_AUTH ? {
        errorName: error.name,
        errorMessage: error.message
      } : undefined
    });
  }
};

// Require authentication
const requireAuth = verifyToken;

// Require specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

// Require admin role
const requireAdmin = requireRole('admin');

module.exports = {
  verifyToken,
  requireAuth,
  requireRole,
  requireAdmin
};


