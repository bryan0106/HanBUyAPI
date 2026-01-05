const sql = require('../utils/database');

const register = async (req, res) => {
  try {
    const { email, password, name, phone, address, role = 'customer' } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Store password as plain text (simple authentication - NOT for production)
    // Insert new user
    const result = await sql`
      INSERT INTO users (email, password_hash, name, phone, address, role, approval_status)
      VALUES (
        ${email}, 
        ${password}, 
        ${name}, 
        ${phone || null}, 
        ${address ? JSON.stringify(address) : null},
        ${role},
        ${role === 'admin' ? 'approved' : 'pending'}
      )
      RETURNING id, email, name, phone, address, role, approval_status, created_at, updated_at
    `;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  try {
    // 1. Find user by email
    const users = await sql`
      SELECT 
        id, 
        email, 
        password_hash, 
        name, 
        phone, 
        address, 
        role, 
        approval_status,
        client_level,
        created_at,
        updated_at
      FROM users 
      WHERE email = ${email}
    `;

    // Check if user exists (use same error message for security)
    if (!users || users.length === 0 || !users[0].password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const userData = users[0];

    // 2. Verify password using simple string comparison (simple authentication - NOT for production)
    // Debug logging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Login attempt - Email:', email);
      console.log('Stored password_hash:', userData.password_hash ? 'exists' : 'null/empty');
      console.log('Provided password:', password);
      console.log('Passwords match:', userData.password_hash === password);
    }

    if (userData.password_hash !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // 3. Check approval status (admin can bypass)
    if (userData.role !== 'admin' && userData.approval_status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Account not approved',
        message: 'Your account is pending approval. Please wait for admin approval.'
      });
    }

    // 4. Remove password_hash and return user data
    const { password_hash, ...safeUserData } = userData;

    // 5. Return success response
    res.json({
      success: true,
      user: safeUserData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during login. Please try again later.'
    });
  }
};

module.exports = {
  register,
  login
};

