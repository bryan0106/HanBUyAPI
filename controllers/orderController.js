const sql = require('../utils/database');

const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      order_number,
      subtotal,
      isf,
      lsf,
      shipping_fee,
      solo_shipping_fee,
      shared_shipping_fee,
      total,
      currency = 'PHP',
      status = 'pending',
      payment_status = 'pending',
      payment_type = 'full',
      payment_method,
      downpayment_amount,
      balance,
      qr_code,
      box_type_preference,
      shipping_address,
      order_items
    } = req.body;

    // Validation
    if (!user_id || !order_number || !subtotal || !total || !box_type_preference || !shipping_address || !order_items) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, order_number, subtotal, total, box_type_preference, shipping_address, order_items'
      });
    }

    if (!Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'order_items must be a non-empty array'
      });
    }

    // Calculate shipping fee if not provided
    const calculatedShippingFee = shipping_fee || (isf || 0) + (lsf || 0);

    // Start transaction - create order
    const order = await sql`
      INSERT INTO orders (
        user_id, order_number, subtotal, isf, lsf, shipping_fee,
        solo_shipping_fee, shared_shipping_fee, total, currency,
        status, payment_status, payment_type, payment_method,
        downpayment_amount, balance, qr_code, box_type_preference, shipping_address
      )
      VALUES (
        ${user_id}, ${order_number}, ${subtotal}, ${isf || 0}, ${lsf || 0}, ${calculatedShippingFee},
        ${solo_shipping_fee || null}, ${shared_shipping_fee || null}, ${total}, ${currency},
        ${status}, ${payment_status}, ${payment_type}, ${payment_method ? JSON.stringify(payment_method) : null},
        ${downpayment_amount || null}, ${balance || null}, ${qr_code || null}, ${box_type_preference}, ${JSON.stringify(shipping_address)}
      )
      RETURNING *
    `;

    const orderId = order[0].id;

    // Insert order items
    const itemsToInsert = order_items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_type: item.product_type || 'onhand',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      image_url: item.image_url || null,
      preorder_release_date: item.preorder_release_date || null
    }));

    for (const item of itemsToInsert) {
      await sql`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_type,
          quantity, unit_price, total, image_url, preorder_release_date
        )
        VALUES (
          ${item.order_id}, ${item.product_id}, ${item.product_name}, ${item.product_type},
          ${item.quantity}, ${item.unit_price}, ${item.total}, ${item.image_url}, ${item.preorder_release_date}
        )
      `;
    }

    // Get complete order with items
    const completeOrder = await sql`
      SELECT o.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_type', oi.product_type,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total', oi.total,
              'image_url', oi.image_url,
              'preorder_release_date', oi.preorder_release_date
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${orderId}
      GROUP BY o.id
    `;

    res.status(201).json({
      success: true,
      data: completeOrder[0]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const { user_id, status, payment_status } = req.query;
    let orders;
    if (user_id && status && payment_status) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id} AND o.status = ${status} AND o.payment_status = ${payment_status}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else if (user_id && status) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id} AND o.status = ${status}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else if (user_id && payment_status) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id} AND o.payment_status = ${payment_status}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else if (user_id) {
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${user_id}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else {
      // No filters - get all orders (limited)
      orders = await sql`
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_type', oi.product_type,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total,
                'image_url', oi.image_url,
                'preorder_release_date', oi.preorder_release_date
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 100
      `;
    }
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await sql`
      SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_type', oi.product_type,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total', oi.total,
              'image_url', oi.image_url,
              'preorder_release_date', oi.preorder_release_date
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${id}
      GROUP BY o.id
    `;

    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order[0]
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
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
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};

