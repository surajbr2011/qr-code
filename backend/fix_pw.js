require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');
const bcrypt = require('bcryptjs');

async function fixPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await Staff.findOne({ email: 'admin@example.com' });
        if (admin) {
            console.log("Setting password to Password123 directly");
            // use findOneAndUpdate to bypass pre-save if we hash it ourselves, or use a method:
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Password123', salt);
            await Staff.updateOne({ email: 'admin@example.com' }, { $set: { password: hashedPassword } });
            console.log("Password fixed successfully!");
        } else {
             // Create one with proper hash
             const salt = await bcrypt.genSalt(10);
             const hashedPassword = await bcrypt.hash('Password123', salt);
             await Staff.collection.insertOne({
                 name: 'Super Admin',
                 email: 'admin@example.com',
                 employeeId: 'ADMIN01',
                 password: hashedPassword,
                 role: 'admin',
                 isActive: true,
                 createdAt: new Date(),
                 updatedAt: new Date()
             });
             console.log("Admin created successfully with fixed hash!");
        }
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
fixPassword();
