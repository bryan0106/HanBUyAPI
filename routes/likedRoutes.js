const express = require('express');
const router = express.Router();
const { getLikedItems, addLikedItem, removeLikedItem } = require('../controllers/likedController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getLikedItems);
router.post('/', requireAuth, addLikedItem);
router.delete('/:productId', requireAuth, removeLikedItem);

module.exports = router;


