const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists

router.post('/start', protect, shiftController.startShift);
router.post('/close', protect, shiftController.closeShift);
router.get('/active', protect, shiftController.getActiveShift);
router.get('/history', protect, shiftController.getShiftHistory);

module.exports = router;
