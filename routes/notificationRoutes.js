const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, getPreferences, updatePreferences } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markAsRead);
router.get('/preferences', requireAuth, getPreferences);
router.patch('/preferences', requireAuth, updatePreferences);

module.exports = router;


