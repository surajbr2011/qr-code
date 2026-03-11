const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./src/models/MenuItem');
const fullData = require('./full_data');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        console.log(`Found ${fullData.length} items to seed.`);

        // Clear existing items
        await MenuItem.deleteMany({});
        console.log("Cleared existing items.");

        // Insert new items
        // Map 'id' to something else or let Mongo generate _id?
        // The current schema uses _id. If we want to preserve 'id' as a field we can.
        // But usually we just let Mongo handle IDs.
        // Let's check the model structure again if needed, but usually insertMany works fine.
        // We'll map the data to ensure it matches the schema types

        const itemsToInsert = fullData.map(item => ({
            name: item.name,
            price: item.price,
            category: item.category,
            subCategory: item.subCategory,
            veg: item.veg,
            image: item.image,
            description: item.description || "",
            // We can store the frontend ID if we want, but it's not strictly necessary unless relations depend on it.
            // For now, let's just insert.
        }));

        await MenuItem.insertMany(itemsToInsert);
        console.log(`Successfully seeded ${itemsToInsert.length} items.`);

        process.exit(0);
    } catch (err) {
        console.error("Error seeding DB:", err);
        process.exit(1);
    }
};

seedDB();
