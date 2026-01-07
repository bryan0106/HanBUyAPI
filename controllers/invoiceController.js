const sql = require('../utils/database');

const getInvoices = async (req, res) => {
  try {
    const { status, box_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = sql`SELECT * FROM invoices WHERE user_id = ${userId}`;
    const conditions = [sql`user_id = ${userId}`];

    if (status) {
      conditions.push(sql`status = ${status}`);
    }
    if (box_id) {
      conditions.push(sql`box_id = ${box_id}`);
    }

    query = sql`SELECT * FROM invoices WHERE ${sql.join(conditions, sql` AND `)}`;

    const invoices = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get invoice items for each invoice
    for (const invoice of invoices) {
      const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${invoice.id}`;
      invoice.items = items;
    }

    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const invoices = await sql`
      SELECT * FROM invoices WHERE id = ${id} AND user_id = ${userId}
    `;

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id}`;

    res.json({
      success: true,
      data: {
        ...invoices[0],
        items
      }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const invoices = await sql`
      SELECT * FROM invoices WHERE id = ${id} AND user_id = ${userId}
    `;

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // In production, generate PDF using pdfkit or similar
    // For now, return JSON
    res.json({
      success: true,
      message: 'PDF generation not implemented yet',
      data: invoices[0]
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { box_id, items, due_date } = req.body;

    if (!box_id || !items || !Array.isArray(items) || items.length === 0 || !due_date) {
      return res.status(400).json({
        success: false,
        error: 'box_id, items array, and due_date are required'
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const total = subtotal; // Add shipping/penalty if needed

    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = await sql`
      INSERT INTO invoices (
        invoice_number, user_id, box_id, subtotal, total, due_date
      )
      VALUES (
        ${invoiceNumber}, ${req.user.id}, ${box_id}, ${subtotal}, ${total}, ${due_date}
      )
      RETURNING *
    `;

    // Insert invoice items
    for (const item of items) {
      await sql`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
        VALUES (
          ${invoice[0].id}, ${item.description}, ${item.quantity}, 
          ${item.unit_price}, ${item.unit_price * item.quantity}
        )
      `;
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created',
      data: invoice[0]
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateInvoiceStatus = async (req, res) => {
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
      UPDATE invoices 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  getInvoicePDF,
  createInvoice,
  updateInvoiceStatus
};


