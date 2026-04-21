require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const staffs = await Staff.find({}, 'email employeeId');
        console.log("Staff Accounts:", staffs);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
