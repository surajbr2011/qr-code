const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');
require('dotenv').config();

const listStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const staffMembers = await Staff.find({});

        if (staffMembers.length === 0) {
            console.log('No staff accounts found in the database.');
        } else {
            console.log('Found Staff Accounts:');
            staffMembers.forEach(s => {
                console.log(`- Role: [${s.role}] | Name: ${s.name} | Email: ${s.email}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listStaff();
