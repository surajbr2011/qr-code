const mongoose = require('mongoose');
const Order = require('../src/models/Order');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(async () => {
        try {
            const pending = await Order.find({ status: 'pending' });
            console.log(`Pending Orders: ${pending.length}`);
            if (pending.length > 0) {
                console.log('Sample Order ID:', pending[0]._id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
