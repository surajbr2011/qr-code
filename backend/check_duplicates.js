const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./src/models/MenuItem');

const checkDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Aggregation to find duplicates by name (case-insensitive)
        const duplicates = await MenuItem.aggregate([
            {
                $group: {
                    _id: { $toLower: "$name" }, // Group by lowercase name
                    uniqueIds: { $addToSet: "$_id" },
                    count: { $sum: 1 },
                    names: { $addToSet: "$name" } // Keep original names to see variations
                }
            },
            {
                $match: {
                    count: { $gt: 1 } // Filter for > 1
                }
            }
        ]);

        if (duplicates.length === 0) {
            console.log('No duplicates found.');
        } else {
            console.log(`Found ${duplicates.length} duplicate sets:`);
            duplicates.forEach(d => {
                console.log(`- Name: "${d._id}" (Count: ${d.count})`);
                console.log(`  Variations: ${d.names.join(', ')}`);
                console.log(`  IDs: ${d.uniqueIds.join(', ')}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDuplicates();
