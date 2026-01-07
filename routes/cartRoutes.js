const express = require('express');
const router = express.Router();
const { getCart, addToCart, deleteCartItem, updateCartItem } = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getCart);
router.post('/', requireAuth, addToCart);
router.delete('/:id', requireAuth, deleteCartItem);
router.put('/:id', requireAuth, updateCartItem);

module.exports = router;

