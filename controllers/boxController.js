const sql = require('../utils/database');

const getBoxes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = sql`SELECT * FROM boxes WHERE user_id = ${userId}`;
    
    if (status) {
      query = sql`SELECT * FROM boxes WHERE user_id = ${userId} AND status = ${status}`;
    }

    const boxes = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get box items for each box
    for (const box of boxes) {
      const items = await sql`SELECT * FROM box_items WHERE box_id = ${box.id}`;
      box.items = items;
    }

    res.json({
      success: true,
      data: boxes,
      count: boxes.length
    });
  } catch (error) {
    console.error('Error fetching boxes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getBoxById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const boxes = await sql`
      SELECT * FROM boxes WHERE id = ${id} AND user_id = ${userId}
    `;

    if (boxes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Box not found'
      });
    }

    const items = await sql`SELECT * FROM box_items WHERE box_id = ${id}`;

    res.json({
      success: true,
      data: {
        ...boxes[0],
        items
      }
    });
  } catch (error) {
    console.error('Error fetching box:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createBox = async (req, res) => {
  try {
    const { box_type, items } = req.body;
    const userId = req.user.id;

    if (!box_type || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'box_type and items array are required'
      });
    }

    const boxNumber = `BOX-${Date.now()}`;

    const box = await sql`
      INSERT INTO boxes (box_number, user_id, box_type, status)
      VALUES (${boxNumber}, ${userId}, ${box_type}, 'open')
      RETURNING *
    `;

    // Insert box items
    for (const item of items) {
      await sql`
        INSERT INTO box_items (box_id, product_id, order_id, quantity, weight, dimensions)
        VALUES (
          ${box[0].id}, ${item.product_id}, ${item.order_id || null}, 
          ${item.quantity}, ${item.weight || null}, 
          ${item.dimensions ? JSON.stringify(item.dimensions) : null}
        )
      `;
    }

    res.status(201).json({
      success: true,
      message: 'Box created successfully',
      data: box[0]
    });
  } catch (error) {
    console.error('Error creating box:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateBoxStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status is required'
      });
    }

    const result = await sql`
      UPDATE boxes 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Box not found'
      });
    }

    res.json({
      success: true,
      message: 'Box status updated',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating box status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getBoxPenalty = async (req, res) => {
  try {
    const { id } = req.params;

    const boxes = await sql`SELECT * FROM boxes WHERE id = ${id}`;

    if (boxes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Box not found'
      });
    }

    const box = boxes[0];
    const closedDate = box.closed_at ? new Date(box.closed_at) : new Date();
    const now = new Date();
    const daysOverdue = Math.max(0, Math.floor((now - closedDate) / (1000 * 60 * 60 * 24)) - 14); // 14 days grace period
    const penaltyRate = 0.05; // 5% per day
    const penaltyAmount = daysOverdue > 0 ? box.total * penaltyRate * daysOverdue : 0;

    res.json({
      success: true,
      data: {
        box_id: id,
        days_overdue: daysOverdue,
        penalty_rate: penaltyRate,
        penalty_amount: penaltyAmount,
        total_due: (box.total || 0) + penaltyAmount
      }
    });
  } catch (error) {
    console.error('Error calculating box penalty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getBoxes,
  getBoxById,
  createBox,
  updateBoxStatus,
  getBoxPenalty
};


