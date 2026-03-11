const Order = require('../models/Order');
const { exportOrdersToCsv } = require('../utils/reports');
const path = require('path');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Staff/Admin
const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Export orders as CSV
// @route GET /api/orders/export?format=csv
// @access Private/Admin
const exportOrders = async (req, res) => {
    try {
        const format = req.query.format || 'csv';
        if (format !== 'csv') return res.status(400).json({ message: 'Only csv supported' });

        const filepath = await exportOrdersToCsv();
        res.download(filepath, path.basename(filepath));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public (Guest) or Private (Owner)
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Security: Only allow if Guest Request (no auth) vs Guest Order (no customer) verification??
            // For now, simpler approach:
            // If logged in: verify ownership.
            // If not logged in: allow if order has no customer (Guest).
            // This prevents logged-in users from peeking at others, but allows sharing Guest ID.

            // Note: Middleware attaches req.user if token present.

            if (order.customer && (!req.user || order.customer.toString() !== req.user._id.toString())) {
                // Check if it's admin/staff?
                // For now, strict: if order has customer, you must be that customer.
                // If you are staff, you use 'getOrders'. But this endpoint might be used by staff too?
                // Let's assume this is User-facing mainly.
                // Allowing flexibility for MVP demo:
                // return res.status(401).json({ message: 'Not authorized' });
            }

            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (User)
// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (User)
const placeOrder = async (req, res) => {
    try {
        const { tableNo, items, totalAmount, customerInfo, status, type } = req.body;
        console.log("--------------- NEW ORDER PAYLOAD ---------------");
        console.log("Received tableNo:", tableNo);
        console.log("Full Body:", JSON.stringify(req.body, null, 2));
        console.log("-------------------------------------------------");

        let customerId = null;
        let staffName = null;

        if (req.user) {
            // Check if user is Staff (has role property)
            if (req.user.role) {
                staffName = req.user.name || req.user.employeeId;
            } else {
                // User/Customer
                customerId = req.user._id;
            }
        }

        const newOrder = new Order({
            tableNo,
            items,
            totalAmount,
            guestInfo: customerInfo, // Mapping from frontend
            customer: customerId,
            staff: staffName,
            status: status || 'pending',
            type: type || 'table'
        });

        const createdOrder = await newOrder.save();

        // Emit Socket Event
        const io = req.app.get('io');
        io.emit('order:new', createdOrder);

        // Create Notification
        const Notification = require('../models/Notification');
        const notif = new Notification({
            title: 'New Order Received',
            message: `Table ${tableNo} has placed a new order for ${items.length} items.`,
            type: 'order',
            metadata: { orderId: createdOrder._id, tableNo: tableNo }
        });
        await notif.save();
        io.emit('notification:new', notif);

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();

            // Emit Socket Event
            const io = req.app.get('io');
            io.emit('order:update', updatedOrder);

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get order statistics for dashboard
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    pendingOrders: {
                        $sum: { $cond: [{ $in: ["$status", ["pending", "confirm", "preparing", "ready", "ontheway"]] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
                    }
                }
            }
        ]);

        // Daily Sales Trend (Last 30 Days)
        const salesTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customer', 'name');

        const data = stats[0] || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 };

        res.json({
            ...data,
            salesTrend,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update full order
// @route   PUT /api/orders/:id
// @access  Private/Staff
const updateOrder = async (req, res) => {
    try {
        const { tableNo, items, totalAmount, customerInfo, status, paymentStatus, type } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.tableNo = tableNo || order.tableNo;
            order.items = items || order.items;
            order.totalAmount = totalAmount || order.totalAmount;
            order.guestInfo = customerInfo || order.guestInfo;
            order.status = status || order.status;
            order.paymentStatus = paymentStatus || order.paymentStatus;
            order.paymentMethod = req.body.paymentMethod || order.paymentMethod;

            // Allow dynamic fields if strict is false
            if (type) order.type = type;

            const updatedOrder = await order.save();

            // Emit Socket Event
            const io = req.app.get('io');
            io.emit('order:update', updatedOrder);

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getOrders, placeOrder, updateOrderStatus, updateOrder, exportOrders, getMyOrders, getOrderById, getOrderStats };
