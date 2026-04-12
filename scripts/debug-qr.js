const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testQRGeneration() {
    try {
        console.log('1. Attempting login...');
        const loginRes = await axios.post(`${API_URL}/auth/staff-login`, {
            email: 'admin@example.com',
            password: 'password123'
        });

        const token = loginRes.data.accessToken;
        console.log('Login successful. Token obtained.');
        console.log('Role:', loginRes.data.role);

        if (loginRes.data.role !== 'admin') {
            console.error('User is not admin! Cannot proceed.');
            return;
        }

        console.log('2. Attempting to create QR Code...');
        const testId = `TEST-${Date.now()}`;
        try {
            const qrRes = await axios.post(`${API_URL}/qrcodes`, {
                tableId: testId,
                zone: 'indoor',
                tableName: `Test Table ${testId}`,
                capacity: 4
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('QR Code Created Successfully!');
            console.log('Response:', qrRes.data);

            // Cleanup
            console.log('3. Cleanup: Deleting created QR Code...');
            await axios.delete(`${API_URL}/qrcodes/${qrRes.data._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Cleanup successful.');

        } catch (qrErr) {
            console.error('QR Creation Failed:', qrErr.response ? qrErr.response.data : qrErr.message);
        }

    } catch (err) {
        console.error('Login Failed:', err.response ? err.response.data : err.message);
    }
}

testQRGeneration();
