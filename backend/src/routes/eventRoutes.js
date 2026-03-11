const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.post('/', protect, authorizeRoles('admin'), createEvent);
router.delete('/:id', protect, authorizeRoles('admin'), deleteEvent);

module.exports = router;
