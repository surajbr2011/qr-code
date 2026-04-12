
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const MenuItem = require('../src/models/MenuItem');

// Database Connection
const MONGO_URI = 'mongodb://127.0.0.1:27017/restaurant_db';

// Read foods.js
const foodsPath = path.join(__dirname, '../../userfrontend/src/data/foods.js');
const rawData = fs.readFileSync(foodsPath, 'utf8');

// Parse foods array (Handling the export syntax manually)
// The file looks like: export const foods = [ ... ];
const arrayContent = rawData
    .replace(/export const foods =/, '')
    .replace(/;$/, '')
    .replace(/;s*export default menuData;s*$/, '');

const foods = eval(arrayContent);

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        console.log("Clearing existing Menu Items...");
        await MenuItem.deleteMany({});
        console.log("Cleared.");

        console.log(`Seeding ${foods.length} items...`);
        // Map foods to match Schema exactly if needed (though structure seems compatible)
        // Schema keys: name, price, category, subCategory, description, image, isAvailable, veg
        // foods objects have: start with same keys. `veg` matches. `image` matches.

        const itemsToInsert = foods.map(f => ({
            name: f.name,
            price: f.price,
            category: f.category,
            subCategory: f.subCategory,
            description: f.description || "",
            image: f.image,
            veg: f.veg,
            isAvailable: true
        }));

        await MenuItem.insertMany(itemsToInsert);
        console.log("Database Seeded Successfully! 🚀");

        process.exit(0);
    } catch (error) {
        console.error("Seeding Failed:", error);
        process.exit(1);
    }
};

seedDatabase();
