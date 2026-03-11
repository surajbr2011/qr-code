const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MenuItem = require('./src/models/MenuItem');

const SOURCE_FILES = [
    'e:/Restaurant-QR-Code/userfrontend/src/data/foods.js',
    'e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js'
];

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        let allFoods = [];

        for (const file of SOURCE_FILES) {
            console.log(`Reading ${file}...`);
            let content = fs.readFileSync(file, 'utf8');

            // Regex to match objects that look like { ... id: ... }
            // We'll search for { [^}]*id: [^}]* } roughly, but nested braces are rare in this data.
            // Let's assume one level of braces for items.
            // Items are like: { id: 101, name: "...", ... },

            const itemRegex = /{\s*id:[\s\S]*?}/g; // Minimal match
            // Wait, standard regex might span too much if not careful.
            // Better: { ... } containing "id:".
            // Since structure is consistent: { \n id: ... \n }, we can try to find all occurrences of "id:" and grab surrounding braces?
            // Actually, let's just use a greedy match for properties inside { }.

            // safer approach for this specific file format:
            // Match { ... } blocks.
            // Logic: Split by "id:" then find boundaries? No.

            // Let's try matching specifically known fields to ensure we are in an object.
            // const blockRegex = /{\s*id:\s*(\d+),[\s\S]*?}/g;

            // Actually, let's just traverse the string? No, regex is easier if consistent.
            // The file format seems to be:
            // {
            //    id: 101,
            //    name: "Foo",
            //    ...
            // },

            const matches = content.match(/{\s*id:[\s\S]*?}/g) || [];
            console.log(`Regex found ${matches.length} matches in ${file}`);

            for (const itemStr of matches) {
                try {
                    // Extract fields
                    const nameMatch = itemStr.match(/name:\s*"([^"]+)"/);
                    const priceMatch = itemStr.match(/price:\s*(\d+)/);
                    const catMatch = itemStr.match(/category:\s*"([^"]+)"/);
                    const subCatMatch = itemStr.match(/subCategory:\s*"([^"]+)"/);
                    const vegMatch = itemStr.match(/veg:\s*(true|false)/);
                    const imgMatch = itemStr.match(/image:\s*"([^"]+)"/);

                    if (nameMatch) {
                        allFoods.push({
                            name: nameMatch[1],
                            price: priceMatch ? parseInt(priceMatch[1]) : 0,
                            category: catMatch ? catMatch[1] : 'Main Course',
                            subCategory: subCatMatch ? subCatMatch[1] : '',
                            veg: vegMatch ? vegMatch[1] === 'true' : true,
                            image: imgMatch ? imgMatch[1] : ''
                        });
                    }
                } catch (err) {
                    // ignore
                }
            }
        }

        console.log(`Total combined matches: ${allFoods.length}`);

        // Dedup by name
        const uniqueFoods = [];
        const seen = new Set();
        for (const f of allFoods) {
            if (!seen.has(f.name)) {
                seen.add(f.name);
                uniqueFoods.push(f);
            }
        }

        console.log(`Unique items in source files: ${uniqueFoods.length}`);

        let added = 0;
        let skipped = 0;

        for (const item of uniqueFoods) {
            const exists = await MenuItem.findOne({ name: item.name });
            if (exists) {
                skipped++;
            } else {
                await MenuItem.create({
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    description: item.subCategory || '',
                    veg: item.veg,
                    image: item.image,
                    isAvailable: true
                });
                added++;
            }
        }

        console.log(`\nMigration Summary:`);
        console.log(`Added: ${added}`);
        console.log(`Skipped (Already in DB): ${skipped}`);
        console.log(`Final DB Total: ${await MenuItem.countDocuments()}`);

        process.exit(0);

    } catch (err) {
        console.error("Migration Error:", err);
        process.exit(1);
    }
};

migrate();
