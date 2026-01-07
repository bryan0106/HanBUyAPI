const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, getInvoicePDF, createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, getInvoices);
router.get('/:id', requireAuth, getInvoiceById);
router.get('/:id/pdf', requireAuth, getInvoicePDF);
router.post('/', requireAuth, requireAdmin, createInvoice);
router.patch('/:id/status', requireAuth, updateInvoiceStatus);

module.exports = router;


