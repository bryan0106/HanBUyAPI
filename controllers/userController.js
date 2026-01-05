const sql = require('../utils/database');

const getUsers = async (req, res) => {
  try {
    const { role, approval_status } = req.query;
    
    let users;
    if (role && approval_status) {
      users = await sql`
        SELECT 
          id, 
          email, 
          name, 
          phone, 
          address, 
          role, 
          approval_status,
          client_level,
          created_at,
          updated_at
        FROM users 
        WHERE role = ${role} AND approval_status = ${approval_status}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } else if (role) {
      users = await sql`
        SELECT 
          id, 
          email, 
          name, 
          phone, 
          address, 
          role, 
          approval_status,
          client_level,
          created_at,
          updated_at
        FROM users 
        WHERE role = ${role}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } else if (approval_status) {
      users = await sql`
        SELECT 
          id, 
          email, 
          name, 
          phone, 
          address, 
          role, 
          approval_status,
          client_level,
          created_at,
          updated_at
        FROM users 
        WHERE approval_status = ${approval_status}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } else {
      users = await sql`
        SELECT 
          id, 
          email, 
          name, 
          phone, 
          address, 
          role, 
          approval_status,
          client_level,
          created_at,
          updated_at
        FROM users 
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
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
};

const createUser = async (req, res) => {
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
};

const getBankType = async (req, res) => {
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
};

const getBoxType = async (req, res) => {
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
};

module.exports = {
  getUsers,
  createUser,
  getBankType,
  getBoxType
};

