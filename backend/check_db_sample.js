const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    // Find some items added recently? OR just search for known new items.
    // "Blue Hawaii", "Paratha & Aloo", "Cheese Maggi"

    const names = ["Blue Hawaii", "Paratha & Aloo", "Cheese Maggi", "Tequila Gold (60ml)"];

    for (const n of names) {
        const item = await MenuItem.findOne({ name: { $regex: new RegExp(n, 'i') } });
        if (item) {
            console.log(`FOUND: ${item.name}`);
            console.log(`  Price: ${item.price}`);
            console.log(`  Cat: ${item.category}, Sub: ${item.subCategory}`);
            console.log(`  Veg: ${item.veg}`);
            console.log('---');
        } else {
            console.log(`MISSING: ${n}`);
        }
    }

    const count = await MenuItem.countDocuments();
    console.log(`Total Count: ${count}`);
    process.exit(0);
};

run();
