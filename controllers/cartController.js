const sql = require('../utils/database');

const getCart = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id query parameter is required'
      });
    }

    const cartItems = await sql`
      SELECT 
        ci.*,
        p.name as product_name,
        p.price,
        p.currency,
        p.images,
        p.product_type,
        p.status as product_status
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${user_id}
      ORDER BY ci.created_at DESC
    `;
    
    res.json({
      success: true,
      data: cartItems,
      count: cartItems.length
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity, box_type_preference } = req.body;
    
    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'user_id, product_id, and quantity are required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'quantity must be greater than 0'
      });
    }

    // Check if product exists
    const product = await sql`
      SELECT id, name, status FROM products WHERE id = ${product_id}
    `;
    
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Insert or update cart item
    const result = await sql`
      INSERT INTO cart_items (user_id, product_id, quantity, box_type_preference)
      VALUES (${user_id}, ${product_id}, ${quantity}, ${box_type_preference || null})
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET 
        quantity = cart_items.quantity + ${quantity},
        box_type_preference = COALESCE(EXCLUDED.box_type_preference, cart_items.box_type_preference),
        updated_at = NOW()
      RETURNING *
    `;
    
    res.status(201).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart
};

