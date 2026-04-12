const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
const fs = require('fs');
require('dotenv').config();

const dumpMenu = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const items = await MenuItem.find({});
        console.log(`Found ${items.length} items`);

        fs.writeFileSync('menu_dump.json', JSON.stringify(items, null, 2));
        console.log('Dumped to menu_dump.json');

        // Validation Logic
        const vegItems = items.filter(i => i.veg === true);
        const nonVegItems = items.filter(i => i.veg === false);
        console.log(`Validation: Veg=${vegItems.length}, NonVeg=${nonVegItems.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

dumpMenu();
