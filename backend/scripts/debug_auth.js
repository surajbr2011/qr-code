const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Staff = require('../src/models/Staff');
const User = require('../src/models/User');

const check = async () => {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        await mongoose.connect(process.env.MONGO_URI);
        log('Connected to DB');

        const staffList = await Staff.find({});
        log('--- ALL STAFF RECORDS ---');
        staffList.forEach(s => log(`Name: ${s.name}, Email: ${s.email}, EmployeeID: ${s.employeeId}, Role: ${s.role}, ID: ${s._id}`));

        const userList = await User.find({});
        log('\n--- ALL USER RECORDS ---');
        userList.forEach(u => log(`Name: ${u.name}, Email: ${u.email}, Phone: ${u.phone}, Role: ${u.role}, tableRoom: ${u.tableRoom}, ID: ${u._id}`));

        fs.writeFileSync('debug_output_full.txt', output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('debug_output_full.txt', err.stack);
        process.exit(1);
    }
};

check();
