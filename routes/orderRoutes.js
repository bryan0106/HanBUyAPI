const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getOrders);
router.get('/:id', requireAuth, getOrderById);
router.patch('/:id/status', requireAuth, requireAdmin, updateOrderStatus);

module.exports = router;

