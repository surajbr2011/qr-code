const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({}).sort({ createdAt: -1 });
        const unreadCount = await Notification.countDocuments({ isRead: false });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark ALL notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notification (Internal/API)
// @route   POST /api/notifications
const createNotification = async (req, res) => {
    try {
        const { title, message, type, metadata } = req.body;

        const notification = new Notification({
            title,
            message,
            type,
            metadata
        });

        const createdNotification = await notification.save();

        // Emit Socket Event if io is available
        const io = req.app.get('io');
        if (io) {
            io.emit('notification:new', createdNotification);
        }

        res.status(201).json(createdNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            await notification.deleteOne();
            res.json({ message: 'Notification removed' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear ALL notifications
// @route   DELETE /api/notifications
// @access  Private/Admin
const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    clearAllNotifications
};
