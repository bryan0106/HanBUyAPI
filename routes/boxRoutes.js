const express = require('express');
const router = express.Router();
const { getBoxes, getBoxById, createBox, updateBoxStatus, getBoxPenalty } = require('../controllers/boxController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, getBoxes);
router.get('/:id', requireAuth, getBoxById);
router.post('/', requireAuth, createBox);
router.patch('/:id/status', requireAuth, requireAdmin, updateBoxStatus);
router.get('/:id/penalty', requireAuth, getBoxPenalty);

module.exports = router;


