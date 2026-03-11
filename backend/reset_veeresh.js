const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetVeeresh = async () => {
    try {
        console.log('Connecting to DB:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'veereshgadagi133@gmail.com';
        const newPassword = 'password123';

        const user = await Staff.findOne({ email });

        if (!user) {
            console.log('User veeresh NOT Found!');
        } else {
            console.log('User Found:', user.email);

            // Reset Password
            // Since we improved the hook to only hash if modified, simply setting it triggers the hash.
            user.password = newPassword;
            await user.save();
            console.log('Password reset to:', newPassword);

            // VERIFY
            const updatedUser = await Staff.findOne({ email });
            const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
            console.log('Verification Logic Check:', isMatch ? 'SUCCESS' : 'FAILED');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetVeeresh();
