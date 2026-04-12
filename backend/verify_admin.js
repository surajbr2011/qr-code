const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const verifyLogin = async () => {
    try {
        console.log('Connecting to DB:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@example.com';
        const password = 'password123';

        const admin = await Staff.findOne({ email });

        if (!admin) {
            console.log('Admin User NOT Found!');
        } else {
            console.log('Admin Found:', admin.email);
            console.log('Stored Hash:', admin.password);

            // Check via model method
            try {
                const isMatch = await admin.matchPassword(password);
                console.log('Model matchPassword check:', isMatch ? 'SUCCESS' : 'FAILED');
            } catch (e) {
                console.log('Model matchPassword threw error:', e.message);
            }

            // Check via direct bcrypt
            const directMatch = await bcrypt.compare(password, admin.password);
            console.log('Direct bcrypt compare:', directMatch ? 'SUCCESS' : 'FAILED');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyLogin();
