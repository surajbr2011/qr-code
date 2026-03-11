const mongoose = require('mongoose');
const MenuItem = require('../src/models/MenuItem');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(async () => {
        try {
            const items = await MenuItem.find({});
            console.log(`Found ${items.length} menu items.`);
            if (items.length > 0) {
                console.log(JSON.stringify(items.slice(0, 3), null, 2));
            } else {
                console.log("No menu items found. The database is empty.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
