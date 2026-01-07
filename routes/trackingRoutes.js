const express = require('express');
const router = express.Router();
const { getTrackingByNumber, addIncomingTracking, getOutgoingTracking } = require('../controllers/trackingController');
const { requireAuth } = require('../middleware/auth');

router.get('/:trackingNumber', getTrackingByNumber);
router.post('/incoming', requireAuth, addIncomingTracking);
router.get('/outgoing', requireAuth, getOutgoingTracking);

module.exports = router;


