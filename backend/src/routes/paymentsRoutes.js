const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentsController');

// Create PaymentIntent (expects JSON body)
router.post('/create-intent', createPaymentIntent);
router.post('/simulate-success', require('../controllers/paymentsController').simulatePaymentSuccess);

/**
 * @openapi
 * /api/payments/create-intent:
 *   post:
 *     summary: Create a Stripe PaymentIntent for an order
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns clientSecret
 */

module.exports = router;
