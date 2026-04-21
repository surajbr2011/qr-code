require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const staff = await Staff.findOne({ email: 'admin@example.com' });
        if (!staff) {
            console.log("Admin not found!");
            process.exit(1);
        }
        console.log("Admin found:", staff.email, staff.password.substring(0,10) + '...');
        const isMatch = await staff.matchPassword('Password123');
        console.log("Password match result:", isMatch);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
test();
