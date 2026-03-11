const Staff = require('./src/models/Staff');

const seedAdmin = async () => {
    try {
        const adminExists = await Staff.findOne({ email: 'admin@example.com' });
        if (!adminExists) {
            await Staff.create({
                name: 'Super Admin',
                email: 'admin@example.com',
                employeeId: 'ADMIN01',
                password: 'password123', // Initial password
                role: 'admin'
            });
            console.log('Admin seeded: admin@example.com / password123');
        } else {
            if (!adminExists.employeeId) {
                adminExists.employeeId = 'ADMIN01';
                await adminExists.save();
                console.log('Admin updated with Employee ID: ADMIN01');
            } else {
                console.log('Admin already exists.');
            }
        }
    } catch (error) {
        console.error('Seed Error:', error);
    }
};

module.exports = seedAdmin;
