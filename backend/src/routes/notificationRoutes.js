const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    clearAllNotifications
} = require('../controllers/notificationController');
const { protect, optionalAuth } = require('../middleware/authMiddleware'); // Use protect in prod

// For MVP/Demo, keeping relaxed auth or optionalAuth if needed, otherwise optionalAuth for now
router.route('/')
    .get(getNotifications)
    .post(createNotification)
    .delete(clearAllNotifications);

router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead); // Restored compatibility

router.route('/:id')
    .delete(deleteNotification);

router.delete('/clear-all', clearAllNotifications);

module.exports = router;
