const Stripe = require('stripe');
const Order = require('../models/Order');

const stripe = process.env.STRIPE_SECRET ? new Stripe(process.env.STRIPE_SECRET) : null;

// Create PaymentIntent and return client secret
const createPaymentIntent = async (req, res) => {
    try {
        if (!stripe) {
            // Mock for dev environments without valid Stripe Key
            console.warn("Stripe Secret missing. Using Mock Payment Intent.");
            return res.json({ clientSecret: 'mock_secret_for_testing' });
        }
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ message: 'orderId is required' });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const amount = Math.round((order.totalAmount || 0) * 100); // cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: process.env.CURRENCY || 'usd',
            metadata: { orderId: order._id.toString() },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Webhook handler (expects raw body and Stripe signature)
const webhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata?.orderId;
            if (orderId) {
                try {
                    const order = await Order.findById(orderId);
                    if (order) {
                        order.paymentStatus = 'paid';
                        await order.save();

                        // Emit socket event to user room if available
                        const io = req.app.get('io');
                        if (io && order.customer) {
                            io.to(`user_${order.customer}`).emit('order:payment', { orderId: order._id, status: 'paid' });
                        }
                    }
                } catch (e) {
                    console.error('Failed to update order payment status', e);
                }
            }
            break;
        default:
            // Unexpected event type
            break;
    }

    res.json({ received: true });
};


// Simulate Payment Success (Dev Mode)
const simulatePaymentSuccess = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ message: 'orderId required' });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = 'paid';
        order.status = 'preparing';
        await order.save();

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('order:update', order);
            if (order.customer) {
                io.to(`user_${order.customer}`).emit('order:payment', { orderId: order._id, status: 'paid' });
            }
        }

        res.json({ success: true, message: 'Payment Simulated Successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createPaymentIntent, webhookHandler, simulatePaymentSuccess };
