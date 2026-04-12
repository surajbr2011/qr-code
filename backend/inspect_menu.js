const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
require('dotenv').config();

const inspectMenu = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const items = await MenuItem.find({});
        console.log(`Found ${items.length} items`);

        if (items.length > 0) {
            console.log('--- Sample Item 1 ---');
            console.log(JSON.stringify(items[0], null, 2));
            console.log('--- Sample Item 2 ---');
            console.log(JSON.stringify(items[1], null, 2));

            // Check Boolean specifically
            const vegCount = items.filter(i => i.veg === true).length;
            const nonVegCount = items.filter(i => i.veg === false).length;
            const noVegField = items.filter(i => i.veg === undefined).length;

            console.log(`Veg: ${vegCount}, Non-Veg: ${nonVegCount}, No 'veg' field: ${noVegField}`);
        } else {
            console.log('Top items are empty?');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectMenu();
