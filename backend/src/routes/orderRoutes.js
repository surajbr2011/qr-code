const express = require('express');
const router = express.Router();
const { getOrders, placeOrder, updateOrderStatus, updateOrder, exportOrders, getMyOrders, getOrderById, getOrderStats } = require('../controllers/orderController');

const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.route('/').get(getOrders).post(optionalAuth, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/export', exportOrders);
router.get('/stats', getOrderStats); // Should be protected in prod, keeping open or optional for dev speed
router.route('/:id')
    .get(optionalAuth, getOrderById)
    .put(protect, updateOrder);
router.route('/:id/status').put(updateOrderStatus);

module.exports = router;
