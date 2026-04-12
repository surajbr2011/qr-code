const express = require('express');
const app = express();
const connectDB = require('./src/config/db');

console.log("Attempting to load routes...");

try {
    const authRoutes = require('./src/routes/authRoutes');
    console.log("Auth Routes loaded.");
    app.use('/api/auth', authRoutes);

    const hotelRoutes = require('./src/routes/hotelRoutes');
    console.log("Hotel Routes loaded.");
    app.use('/api/hotel', hotelRoutes);

    console.log("All routes loaded successfully.");
} catch (e) {
    console.error("CRASH DETECTED:", e);
}
