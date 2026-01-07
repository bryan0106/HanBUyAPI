const sql = require('../utils/database');
const QRCode = require('qrcode');

const generateQRCode = async (req, res) => {
  try {
    const { order_id, amount, payment_method } = req.body;

    if (!order_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        error: 'order_id, amount, and payment_method are required'
      });
    }

    // Check if order exists
    const order = await sql`SELECT * FROM orders WHERE id = ${order_id}`;
    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${order_id.substring(0, 8).toUpperCase()}`;

    // Generate QR code (mock - in production, use actual payment gateway)
    const qrData = JSON.stringify({
      order_id,
      amount,
      payment_method,
      reference: paymentReference
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // Update order with QR code
    await sql`
      UPDATE orders 
      SET qr_code = ${qrCode}, payment_method = ${JSON.stringify(payment_method)}
      WHERE id = ${order_id}
    `;

    res.json({
      success: true,
      data: {
        qr_code: qrCode,
        payment_reference: paymentReference,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { order_id, amount, payment_method } = req.body;
    const file = req.file; // From multer

    if (!order_id || !amount) {
      return res.status(400).json({
        success: false,
        error: 'order_id and amount are required'
      });
    }

    // Check if order exists
    const order = await sql`SELECT * FROM orders WHERE id = ${order_id}`;
    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // In production, upload file to S3/cloud storage
    const proofUrl = file ? `/uploads/${file.filename}` : null;

    // Create payment record
    const payment = await sql`
      INSERT INTO payment_history (
        order_id, user_id, amount, payment_method, payment_proof_url, status
      )
      VALUES (
        ${order_id}, ${order[0].user_id}, ${amount}, 
        ${JSON.stringify(payment_method)}, ${proofUrl}, 'pending_verification'
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Payment confirmation submitted',
      data: {
        payment_id: payment[0].id,
        status: 'pending_verification'
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await sql`
      SELECT * FROM payment_history WHERE id = ${id}
    `;

    if (payment.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment[0]
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  generateQRCode,
  confirmPayment,
  getPayment
};


