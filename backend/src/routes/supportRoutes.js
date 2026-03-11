const express = require('express');
const router = express.Router();
const { getTickets, createTicket, addMessage, resolveTicket } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTickets);
router.post('/', protect, createTicket);
router.post('/:id/message', protect, addMessage);
router.put('/:id/resolve', protect, resolveTicket);

module.exports = router;
