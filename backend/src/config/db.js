const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("=== DB CONNECTION DEBUG ===");
        console.log("MONGO_URI exists in env?", !!process.env.MONGO_URI);

        let uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : 'mongodb://127.0.0.1:27017/restaurant-qr-db';

        // Log the first few characters safely to confirm what it is reading
        console.log("URI being used begins with:", uri.substring(0, 14) + "...");

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Do not exit the process, let it try to restart or handle gracefully
    }
};

module.exports = connectDB;
