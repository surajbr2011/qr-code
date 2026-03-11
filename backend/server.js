require('dotenv').config();
console.log("!!! SERVER RESTART DETECTED - LOADING NEW SCHEMA !!!");
// Force restart
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

const app = express();
const server = http.createServer(app);
const path = require('path');

const morgan = require('morgan');
const logger = require('./src/utils/logger');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    process.env.FRONTEND_URL,
    process.env.CUSTOMER_FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
    process.env.STAFF_FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Register Stripe webhook endpoint BEFORE body parsing to get raw body for signature verification
const paymentsController = require('./src/controllers/paymentsController');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentsController.webhookHandler);

app.use(express.json());


// Swagger docs
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/docs/swagger');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Connect Database
connectDB();

// Start scheduler for reports
const { startScheduler } = require('./src/utils/scheduler');
startScheduler();

// Socket.io Setup with CORS and JWT auth
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            process.env.FRONTEND_URL || "http://localhost:5173",
            process.env.CUSTOMER_FRONTEND_URL,
            process.env.ADMIN_FRONTEND_URL,
            process.env.STAFF_FRONTEND_URL
        ].filter(Boolean), // Remove undefined values
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Socket auth middleware (verifies JWT sent from client via `auth: { token }`)
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        // For MVP: Allow connection even without token, or handle basic auth if needed.
        // if (!token) return next(new Error('Authentication error: token missing'));

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.data.user = { id: decoded.id };
            } catch (e) {
                console.log("Invalid token, proceeding as guest listener");
            }
        }
        return next();
    } catch (err) {
        console.log('Socket auth error:', err.message);
        return next();
    }
});

io.on('connection', (socket) => {
    console.log('Authenticated client connected:', socket.id, 'user:', socket.data.user?.id);

    // Join a room specific to the user so we can emit to that user
    if (socket.data.user && socket.data.user.id) {
        const room = `user_${socket.data.user.id}`;
        socket.join(room);
    }

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible in routes
app.set('io', io);

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.get('/api/test-server', (req, res) => res.send('SERVER UPDATE WORKING'));

// Import Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
console.log("Registering Promo Code Routes...");
app.use('/api/promocodes', require('./src/routes/promoCodeRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/expenses', require('./src/routes/expenseRoutes'));
app.use('/api/payments', require('./src/routes/paymentsRoutes'));
app.use('/api/hotel', require('./src/routes/hotelRoutes'));
app.use('/api/qrcodes', require('./src/routes/qrCodeRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));
app.use('/api/support', require('./src/routes/supportRoutes'));
app.use('/api/razorpay', require('./src/routes/razorpayRoutes'));
app.use('/api/offers', require('./src/routes/offerRoutes'));
// app.use('/api/promocodes', require('./src/routes/promoCodeRoutes'));
app.use('/api/new-qr', require('./scripts/qrcode'));
app.use('/api/shifts', require('./src/routes/shiftRoutes'));

// Seed Admin
const seedAdmin = require('./seeder');
seedAdmin();

const PORT = process.env.PORT || 5001;

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[CRITICAL] Port ${PORT} is already in use. Please kill the process using this port and try again.`);
    } else {
        console.error(`[CRITICAL] Server failed to start:`, err);
    }
    process.exit(1);
});


// Error handlers (should be after routes)
app.use(notFound);
app.use(errorHandler); 
