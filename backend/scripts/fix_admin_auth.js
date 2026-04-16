const mongoose = require('mongoose');
const Staff = require('../src/models/Staff');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixAdminAuth = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_db');
        console.log('Connected.');

        const email = 'admin@example.com'.toLowerCase();
        const newPassword = 'Password123'; 

        // Search for existing admin with case-insensitive email
        let admin = await Staff.findOne({ 
            $or: [
                { email: email },
                { employeeId: 'ADMIN01' }
            ]
        });

        if (!admin) {
            console.log('Creating new Admin account...');
            admin = await Staff.create({
                name: 'Super Admin',
                email: email,
                employeeId: 'ADMIN01',
                password: newPassword,
                role: 'admin',
                isActive: true
            });
            console.log('Admin created successfully.');
        } else {
            console.log('Updating existing Admin account (Found by email or ID)...');
            admin.email = email;
            admin.password = newPassword;
            admin.role = 'admin'; 
            admin.employeeId = 'ADMIN01';
            admin.isActive = true;
            await admin.save();
            console.log('Admin credentials updated successfully.');
        }

        console.log('-------------------------------------------');
        console.log('CREDENTIALS RECTIFIED:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log('-------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error fixing credentials:', error);
        process.exit(1);
    }
};

fixAdminAuth();
