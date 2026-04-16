const Staff = require('./src/models/Staff');

const seedAdmin = async () => {
    try {
        const email = 'admin@example.com'.toLowerCase();
        const password = 'Password123';
        const employeeId = 'ADMIN01';

        let admin = await Staff.findOne({ 
            $or: [
                { email: email },
                { employeeId: employeeId }
            ]
        });

        if (!admin) {
            await Staff.create({
                name: 'Super Admin',
                email: email,
                employeeId: employeeId,
                password: password,
                role: 'admin',
                isActive: true
            });
            console.log(`Admin seeded: ${email} / ${password}`);
        } else {
            // Ensure ID is set even for existing admin
            if (!admin.employeeId || admin.email !== email) {
                admin.employeeId = employeeId;
                admin.email = email;
                await admin.save();
                console.log('Admin updated with correct primary credentials.');
            } else {
                console.log('Admin already exists.');
            }
        }
    } catch (error) {
        console.error('Seed Error:', error);
    }
};

module.exports = seedAdmin;
