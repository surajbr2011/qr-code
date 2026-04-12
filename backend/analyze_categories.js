const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./src/models/MenuItem');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const items = await MenuItem.find({});
        console.log(`Total Items: ${items.length}`);

        const categories = {};
        items.forEach(item => {
            const cat = item.category || "Uncategorized";
            if (!categories[cat]) categories[cat] = 0;
            categories[cat]++;
        });

        console.log("\n--- Category Counts ---");
        Object.keys(categories).forEach(cat => {
            console.log(`"${cat}": ${categories[cat]} items`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
