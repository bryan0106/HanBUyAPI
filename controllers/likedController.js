const sql = require('../utils/database');

const getLikedItems = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const likedItems = await sql`
      SELECT li.*, p.name as product_name, p.price, p.currency, p.images, p.status as product_status
      FROM liked_items li
      JOIN products p ON li.product_id = p.id
      WHERE li.user_id = ${userId}
      ORDER BY li.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.json({
      success: true,
      data: likedItems,
      count: likedItems.length
    });
  } catch (error) {
    console.error('Error fetching liked items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const addLikedItem = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        error: 'product_id is required'
      });
    }

    // Check if product exists
    const product = await sql`SELECT id FROM products WHERE id = ${product_id}`;
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if already liked
    const existing = await sql`
      SELECT id FROM liked_items WHERE user_id = ${userId} AND product_id = ${product_id}
    `;

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Item already in liked list'
      });
    }

    const result = await sql`
      INSERT INTO liked_items (user_id, product_id)
      VALUES (${userId}, ${product_id})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Item added to liked list',
      data: result[0]
    });
  } catch (error) {
    console.error('Error adding liked item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const removeLikedItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const result = await sql`
      DELETE FROM liked_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Liked item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from liked list'
    });
  } catch (error) {
    console.error('Error removing liked item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getLikedItems,
  addLikedItem,
  removeLikedItem
};


