const express = require('express');
const router = express.Router();
const { getNotificationsByClerkId } = require('../controllers/notificationController');

// GET /api/notifications/:clerkId
router.get('/:clerkId', getNotificationsByClerkId);

module.exports = router;