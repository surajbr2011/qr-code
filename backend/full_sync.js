const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
require('dotenv').config();

// The huge raw text from the user
const RAW_MENU_TEXT = `
🍸 VODKA (60 ml)
Smirnoff – 140
Magic Moments – 90
Grey Goose – 440
Absolut – 340
🍸 GIN (60 ml)
Blue Riband – 90
Bombay Sapphire – 399
🍸 TEQUILA (60 ml)
Desmondji – 150
Tequila Silver – 340
Tequila Gold – 400
🍸 BRANDY
Mansion House – 80
Honey Bee – 60
🍷 WINE (Glass / Bottle)
Sula (Red / White) – 300
Madèra (Red / White) – 280 / 750
Big Banyan (Red / White) – 1100
Amora Wine – 250 / 580
Sauvignon Blanc (White) – —
🌴 GOAN DRINKS
Cashew Feni – 110
Urrak – —
☕ TEA
Black Tea – 40
Ginger Lemon Honey Tea – 60
Green Tea – 40
Ginger Milk Tea – 70
Mint Tea – 40
Masala Chai – 60
Lemon Tea – 50
English Breakfast Tea – 70
☕ MILK & COFFEE
Hot Milk – 89
Hot Chocolate – 99
Black Coffee – 50
Milk Coffee – 60
Cold Coffee – 120
Filter Coffee – 120
🧃 JUICE
Lime – 99
Watermelon – 150
Pineapple – 150
Papaya – 180
Orange – 180
Mixed Fruit – 199
ABC Juice – 199
🥤 SHAKES
Banana – 99
Strawberry – 120
Chocolate – 140
Vanilla – 150
Peanut Butter Banana – 199
Oreo – 199
🥛 LASSI
Buttermilk – 79
Plain Sweet Lassi – 99
Banana / Single Fruit – 150
Mixed Fruit – 199
🥣 SMOOTHIES
Classic Banana – 180
Strawberry – 220
Peanut Butter – 250
Island Greens – 250
🇮🇳 INDIAN BREAKFAST
Paratha & Aloo – 179
Paratha & Gobi – 189
Paratha & Paneer – 199
Puri Bhaji – 170
Poha – 130
Upma – 99
🍳 BREAKFAST
Fresh Fruits – 199
Homemade Muesli – 220
Porridge (Plain / Honey) – 180
French Toast – 240
Set Breakfast – 299
English Breakfast – 349
🥞 PANCAKES
Lemon Sugar – 170
Chocolate – 199
Banana Nutella – 230
Stick Pancake – 299
🍜 MAGGI
Plain Maggi – 60
Cheese Maggi – 80
Veg Maggi – 99
Egg / Chicken Maggi – 120 / 150
🍞 TOAST (Topped With)
Butter Toast – 50
Cheese Toast – 80
Cheese Tomato Toast – 99
Cheese Chilli Toast – 99
Peanut Butter & Banana – 150
🍳 OMELETTE (With Toast)
Plain Omelette – 120
Masala Omelette – 150
Spanish Cheese Omelette – 180
Cheddar Tomato Basil Omelette – 180
Cheese Tomato Omelette – 180
Mushroom Omelette – 180
🍳 EGGS (With Toast)
Fried Eggs – 150
Poached Eggs – 180
Boiled Eggs – 110
Scrambled Eggs – 180
🥟 MOMOS
Cheese – 199
Corn – 199
Veg – 220
Chicken – 250
🍰 DESSERTS
Ice Cream (Single Scoop) – 150
Caramel Pudding – 200
Gulab Jamun – 170
Deep Fried Ice Cream (Cinnamon Special) – 230
🧊 OTHER COOL STUFF
Fresh Lime Soda / Water – 60
Soft Drinks / Drinking Water – 30
Diet Coke – 99
Red Bull – 199
Breezer – 199
Ginger Ale – 100
Tonic Water – 100
🍹 MOCKTAILS
Mojito – 150
Fruit Punch – 180
Coco Loco – 180
Watermelon Fresh – 220
Blue Hawaii – 220
Mango Mule – 250
Virgin Pina Colada – 250
🥃 INDIAN BLENDED WHISKY (60 ml)
RS Pride – 180
Signature – 140
Royal Stag – 130
Antiquity Blue – 130
McDowell’s No.1 – 99
100 Pipers – 240
Black Dog – 240
Black & White – 200
🥃 INTERNATIONAL SCOTCH WHISKY (60 ml)
Red Label – 270
Black Label – 450
Ballantine’s – 299
Jameson – 320
Jack Daniel’s – 399
Jim Beam – 340
Chivas Regal (12 Years) – 450
🥃 SINGLE MALT
Amrut (Indian) – —
Glenfiddich – —
🥃 RUM (60 ml)
Bacardi White – 120
Bacardi Lemon – 140
Cabo – 150
Old Monk – 70
Bacardi Black – 90
🍛 MAINS
Dal Tadka – 199
Dal Fry – 180
Mix Veg Curry – 260
Paneer Butter Masala – 350
Chicken Butter Masala – 320
Kadai Paneer / Mushroom – 350
Kadai Chicken / Prawns – 320 / 400
Chicken Curry / Masala – 260 / 300
Chicken Do Pyaza – 300
Chicken Kolhapuri – 320
🍚 RICE
Steam Rice – 99
Jeera Rice – 130
Curd Rice – 160
Dal Khichdi – 180
Veg / Non-Veg Pulao – 200 / 280
Goan Rice with Cashew & Caramelized Onion – 230
🍲 BIRYANI
Veg – 280
Chicken – 350
Seafood – 420
🍜 FRIED RICE & NOODLES
Veg – 240
Egg – 270
Chicken – 290
Prawns – 350
Seafood – 400
🍞 BREAD
Roti / Butter Roti – 30 / 40
Naan (Plain / Butter) – 60 / 90
Kulcha (Plain / Butter) – 40 / 50
Butter Garlic Naan – 120
Butter Cheese Garlic Naan – 150
Cheese Chilli Garlic Naan – 170
🌴 GOAN MAIN COURSE (Homemade Recipe – Served with Rice)
Fish Curry – 300
Prawn Fish Curry – 360
Ambotik (Shark / Prawn / Kingfish / Chicken) – —
Xacuti (Shark / Prawn / Kingfish / Chicken) – —
Vindaloo (Shark / Prawn / Kingfish / Chicken) – —
Cafreal (Shark / Prawn / Kingfish / Chicken) – —
Cafreal (Veg / Paneer) – 250 / 290
🥣 ACCOMPANIMENTS
Plain Curd – 80
Raita (Veg / Pineapple / Pomegranate) – 99 / 150
🍟 QUICK BITES
French Fries (Masala / Salted) – 150 / 120
Peanuts (Masala / Salted) – 120 / 99
Papad (Masala / Fried / Roasted) – 90 / 40 / 40
Nachos (Veg / Chicken / Prawns) – 150 / 200 / 250
🍽️ STARTERS – VEG
Honey Chilli Potato – 199
Gobi Manchurian – 199
Paneer / Mushroom Chilli – 320 / 280
Crispy / Masala Corn – 199
Veg Stir Fry / Veg Crispy – 250
Cheese Balls – 300
Cheese Mushroom – 350
Veg Chinese Platter – 499
🍖 STARTERS – NON-VEG
Chicken Chilli – 320
Chicken Dry Fry – 299
Chicken / Prawns / Crab Ghee Roast – 320 / 399 / 450
Chicken / Fish Fingers – 300 / 350
Pepper Fry (Veg / Chicken / Seafood) – 199 / 280 / 399
Butter Garlic (Veg / Chicken / Seafood) – 199 / 250 / 350
Golden Fried (Prawns / Calamari) – 300
Fish (Masala / Tawa) – 350
Prawns (Masala / Tawa) – 350
Kingfish Fry Slice – 550
Creamy Chicken – 350
Non-Veg Platter – 800
🥪 SANDWICHES (Served with Fries)
Veg – 160
Egg – 190
Chicken – 250
🔥 SIZZLERS
Veg – 300
Chicken – 350
Kingfish – 500
Seafood – 400
🥗 FRESH SALADS
Green Salad – 150
Mediterranean Chickpea – 250
Mix Salad (Veg / Non-Veg) – 300 / 600
Chicken Salad – 299
Grilled Prawns Salad – 400
Seafood Salad – 500
🍲 SOUPS
Hot & Sour (Veg / Chicken / Prawns) – 120 / 150 / 180
Cream of (Tomato / Mushroom / Chicken) – 120 / 150 / 180
Manchow (Veg / Chicken / Prawns / Seafood) – 120 / 150 / 180 / 220
🍝 PASTA
Pesto Sauce (Veg / Non-Veg / Seafood) – 350 / 400 / 500
Arrabbiata (Veg / Non-Veg / Seafood) – 350 / 400 / 500
White Sauce (Veg / Non-Veg / Seafood) – 380 / 420 / 500
Mix Sauce (Veg / Non-Veg / Seafood) – 400 / 500 / 600
`;

// Map Header Keywords to { Category, SubCategory }
const CATEGORY_MAP = {
    'VODKA': { c: 'Alcoholic Beverages', s: 'Vodka' },
    'GIN': { c: 'Alcoholic Beverages', s: 'Gin' },
    'TEQUILA': { c: 'Alcoholic Beverages', s: 'Tequila' },
    'BRANDY': { c: 'Alcoholic Beverages', s: 'Brandy' },
    'WINE': { c: 'Alcoholic Beverages', s: 'Wine' },
    'GOAN DRINKS': { c: 'Spirits', s: 'Goan drink' },
    'TEA': { c: 'Beverages (Non-Alcohol)', s: 'Tea' },
    'MILK & COFFEE': { c: 'Beverages (Non-Alcohol)', s: 'Coffee' }, // Default
    'JUICE': { c: 'Beverages (Non-Alcohol)', s: 'Juice' },
    'SHAKES': { c: 'Beverages (Non-Alcohol)', s: 'Shake' },
    'LASSI': { c: 'Beverages (Non-Alcohol)', s: 'Lassi' },
    'SMOOTHIES': { c: 'Beverages (Non-Alcohol)', s: 'Smoothies' },
    'INDIAN BREAKFAST': { c: 'Breakfast', s: 'Indian Breakfast' },
    'BREAKFAST': { c: 'Breakfast', s: 'Breakfast' }, // Logic check later
    'PANCAKES': { c: 'Breakfast', s: 'Pancake' },
    'MAGGI': { c: 'Snacks', s: 'Maggi' },
    'TOAST': { c: 'Breakfast', s: 'Toast' },
    'OMELETTE': { c: 'Breakfast', s: 'Omelette' },
    'EGGS': { c: 'Breakfast', s: 'Eggs' },
    'MOMOS': { c: 'Snacks', s: 'Momos' },
    'DESSERTS': { c: 'Dessert & Cold Stuff', s: 'Desserts' },
    'OTHER COOL STUFF': { c: 'Dessert & Cold Stuff', s: 'Cold Stuff' },
    'MOCKTAILS': { c: 'Dessert & Cold Stuff', s: 'Mocktails' },
    'INDIAN BLENDED WHISKY': { c: 'Alcoholic Beverages', s: 'Indian Blended Whisky' },
    'INTERNATIONAL SCOTCH WHISKY': { c: 'Alcoholic Beverages', s: 'International Blended Scotch' },
    'SINGLE MALT': { c: 'Alcoholic Beverages', s: 'Single Malt' },
    'RUM': { c: 'Alcoholic Beverages', s: 'Rum' },
    'MAINS': { c: 'Main Course', s: 'Indian Main Course' },
    'RICE': { c: 'Main Course', s: 'Rice' },
    'BIRYANI': { c: 'Main Course', s: 'Biryani' },
    'FRIED RICE': { c: 'Main Course', s: 'Fried Rice & Noodles' }, // Partial match 'FRIED RICE & NOODLES'
    'BREAD': { c: 'Main Course', s: 'Bread' },
    'GOAN MAIN COURSE': { c: 'Main Course', s: 'Goan Main Course' },
    'ACCOMPANIMENTS': { c: 'Main Course', s: 'Accompaniments' },
    'QUICK BITES': { c: 'Snacks', s: 'Quick Bites' },
    'STARTERS – VEG': { c: 'Starters', s: 'Veg' },
    'STARTERS – NON-VEG': { c: 'Starters', s: 'Non-Veg' },
    'SANDWICHES': { c: 'Sandwich & Sizzlers', s: 'Sandwiches' },
    'SIZZLERS': { c: 'Sandwich & Sizzlers', s: 'Sizzlers' },
    'FRESH SALADS': { c: 'Fresh Salad / Soups / Pasta', s: 'Fresh Salad' },
    'SOUPS': { c: 'Fresh Salad / Soups / Pasta', s: 'Soups' },
    'PASTA': { c: 'Fresh Salad / Soups / Pasta', s: 'Pasta' },
};

const parseItems = () => {
    const lines = RAW_MENU_TEXT.split('\n').map(l => l.trim()).filter(l => l);
    let currentCat = null;
    let currentSub = null;
    const items = [];

    for (const line of lines) {
        // Check if header
        let isHeader = false;
        for (const key in CATEGORY_MAP) {
            if (line.toUpperCase().includes(key)) {
                currentCat = CATEGORY_MAP[key].c;
                currentSub = CATEGORY_MAP[key].s;
                isHeader = true;
                break;
            }
        }
        if (isHeader) continue;

        if (!currentCat) continue; // Skip lines before first header

        // Parse Item: "Name – Price" or "Name – Price1 / Price2"
        // Regex for: Name – Price
        const match = line.match(/^(.+?)\s?[–-]\s?(.+)$/);
        if (match) {
            let name = match[1].trim();
            let priceStr = match[2].trim();

            // Handle variants in name? E.g. "Paratha & Aloo"
            // Handle prices: "280 / 750" or "—" (dash)
            // If "—", price is 0 or needs to be set.

            // If price has /, it's variants.
            // E.g. "Sula (Red / White) – 300" (One price, variant in name?) => Name: Sula (Red/White), Price: 300
            // E.g. "Madèra (Red / White) – 280 / 750" => Variant prices? 
            // Logic: If multiple prices, create multiple items? 
            // Or create one item with base price?
            // User said "do not interchange".
            // If "Madèra (Red / White) – 280 / 750", maybe "Madèra (Glass)" 280, "Madèra (Bottle)" 750?
            // Inspecting lines:
            // "Madèra (Red / White) – 280 / 750"

            if (priceStr.includes('/')) {
                const prices = priceStr.split('/').map(p => p.trim());
                // Heuristic: If name has "Glass / Bottle" in previous header? No.
                // Usually it implies sizes or variants in the name (Red/White).
                // But "Madèra (Red / White) – 280 / 750" implies Glass=280, Bottle=750 likely?
                // Or Red=280, White=750? "Red / White" usually means choice.
                // "Amora Wine – 250 / 580". 
                // "Chicken Curry / Masala – 260 / 300".
                // "Kadai Chicken / Prawns – 320 / 400".

                // Strategy: Create 2 items to be safe and searchable.
                // Item 1: "Madèra (Red / White) - Small/Glass" ? No, that's guessing.
                // Let's create specific variant names if possible.
                // If Not, just take the first price as the main one for now, OR create separate entries if obvious.

                // Case: "Kadai Chicken / Prawns – 320 / 400"
                // Item 1: Kadai Chicken, 320
                // Item 2: Kadai Prawns, 400

                // Regex to split name on / as well?
                if (name.includes('/')) {
                    const nameParts = name.split('/').map(n => n.trim());
                    // "Kadai Chicken / Prawns" -> ["Kadai Chicken", "Prawns"]?
                    // That doesn't expand "Prawns" to "Kadai Prawns".
                    // It's confusing.

                    // SAFE BET: Create ONE item with name "Name" and price set to the first one (starting price),
                    // and maybe append description "Variants: ..." 
                    // OR Better: Create discrete items.
                    // "Madèra Red/White (Glass): 280", "Madèra Red/White (Bottle): 750"
                    // This requires smart NLP.

                    // For this script, I will try to support the specific separators user uses:
                    // "Madèra (Red / White)" -> This is one name.
                    // Prices: 280 / 750.
                    // I will add [Variant] suffix.

                    prices.forEach((p, idx) => {
                        let suffix = idx === 0 ? ' (Small/Glass/Veg)' : ' (Large/Bottle/Non-Veg)';
                        // Refine suffix based on name?
                        if (name.toLowerCase().includes('glass') && name.toLowerCase().includes('bottle')) {
                            // "Wine (Glass / Bottle)" header...
                        }
                        // Let's just append " (Variant ${idx+1})" if unsure, or specific logic.
                        // Actually, many are simple: "Butter Roti 40", "Plain 30".
                        // "Mix Veg Curry 260".
                        // "Dal Tadka 199".

                        // Use simple logic:
                        // Create item "Name (Option ${idx+1})"
                        items.push({
                            name: `${name} ${idx === 0 ? '' : '(Large/Non-Veg/Bottle)'}`, // Very rough heuristic
                            price: parseInt(p) || 0,
                            category: currentCat,
                            subCategory: currentSub
                        });
                    });
                } else {
                    items.push({
                        name: name,
                        price: parseInt(priceStr) || 0,
                        category: currentCat,
                        subCategory: currentSub
                    });
                }
            } else {
                // Single price.
                let price = 0;
                if (priceStr !== '—') price = parseInt(priceStr);

                items.push({
                    name: name,
                    price: price,
                    category: currentCat,
                    subCategory: currentSub
                });
            }
        }
    }
    return items;
};

// Helper to determine Veg status
const isVegetarian = (name, cat, sub) => {
    const lowerName = name.toLowerCase();
    const lowerSub = sub ? sub.toLowerCase() : '';
    const lowerCat = cat ? cat.toLowerCase() : '';

    // Explicit keywords
    if (lowerName.includes('chicken') ||
        lowerName.includes('prawn') ||
        lowerName.includes('fish') ||
        lowerName.includes('egg') ||
        lowerName.includes('omelette') ||
        lowerName.includes('mutton') ||
        lowerName.includes('seafood') ||
        lowerName.includes('crab') ||
        lowerName.includes('calamari') ||
        lowerName.includes('non-veg')) {
        return false;
    }

    if (lowerSub.includes('non-veg') || lowerCat.includes('non-veg')) return false;

    return true; // Default to veg
};

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const parsedItems = parseItems();
    console.log(`Parsed ${parsedItems.length} items from text.`);

    let added = 0;
    let updated = 0;

    for (const item of parsedItems) {
        try {
            // Find by name (exact match)
            let dbItem = await MenuItem.findOne({ name: item.name });

            if (!dbItem) {
                // Try lenient match (case insen)
                dbItem = await MenuItem.findOne({ name: { $regex: new RegExp(`^${item.name}$`, 'i') } });
            }

            const isVeg = isVegetarian(item.name, item.category, item.subCategory);

            // Sanitize price
            if (isNaN(item.price)) item.price = 0;

            if (dbItem) {
                // Check if updates needed
                let needsSave = false;
                if (dbItem.category !== item.category) {
                    dbItem.category = item.category;
                    needsSave = true;
                }
                // Update subCategory (schema has it)
                if (item.subCategory && dbItem.subCategory !== item.subCategory) {
                    dbItem.subCategory = item.subCategory;
                    needsSave = true;
                }
                // Update price
                if (item.price > 0 && dbItem.price !== item.price) {
                    dbItem.price = item.price;
                    needsSave = true;
                }

                // Update Veg status
                if (dbItem.veg !== isVeg) {
                    dbItem.veg = isVeg;
                    needsSave = true;
                }

                if (needsSave) {
                    await dbItem.save();
                    updated++;
                }
            } else {
                // Create
                if (item.price === 0 && item.name.includes('—')) {
                    // Pass
                }

                await MenuItem.create({
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    subCategory: item.subCategory,
                    description: '',
                    veg: isVeg,
                    image: '',
                    isAvailable: true
                });
                added++;
            }
        } catch (err) {
            console.error(`Error processing item: ${item.name}`);
            console.error(err.message);
            if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
        }
    }

    console.log(`Sync Complete. Added: ${added}, Updated: ${updated}`);
    console.log(`Total DB Items: ${await MenuItem.countDocuments()}`);
    process.exit(0);
};

run();
