const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/razorpayController');

router.post('/order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;
