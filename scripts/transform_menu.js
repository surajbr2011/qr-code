
const fs = require('fs');
// const { foods } = require('./userfrontend/src/data/foods.js'); // Cannot require directly due to export syntax
// I will just paste the array wrapper here for simplicity or read the file and eval parts of it.
// Actually, I'll just read the file, strip the export, and eval it.

const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
// Eval is dangerous but local and controlled here.
const foods = eval(arrayContent);

const newFoods = foods.map(item => {
    let newItem = { ...item };

    // 1. Alcoholic Beverages
    if (item.category === 'Alcoholic Beverages') {
        if (['Vodka', 'Gin', 'Tequila', 'Brandy', 'Wine'].includes(item.subCategory)) {
            newItem.category = 'Spirits & Wines';
            // Keep subCategory as is
        } else if (['Indian Blended Whisky', 'International Blended Scotch', 'Rum'].includes(item.subCategory)) {
            newItem.category = 'Whisky, Rum, Cocktails, Beer';
        }
    }

    // 2. Spirits -> Spirits & Wines
    if (item.category === 'Spirits') {
        newItem.category = 'Spirits & Wines';
    }

    // 3. Beverages -> Tea/Coffee/Milk OR Juice/Shake/Lassi
    if (item.category === 'Beverages (Non-Alcohol)') {
        if (['Tea', 'Coffee', 'Milk'].includes(item.subCategory)) {
            newItem.category = 'Tea/Coffee/Milk';
        } else if (['Juice', 'Shake', 'Smoothies', 'Lassi'].includes(item.subCategory)) {
            newItem.category = 'Juice/Shake/Lassi';
        }
    }

    // 4. Breakfast
    if (item.category === 'Breakfast') {
        if (item.subCategory === 'Egg / Omelette / Toast') {
            newItem.subCategory = 'Breakfast'; // Consolidate
        }
    }

    // 5. Snacks -> Move food to Starters > Quick Bites
    if (item.category === 'Snacks') {
        newItem.category = 'Starters';
        newItem.subCategory = 'Quick Bites';
    }

    // 6. Main Course
    if (item.category === 'Main Course') {
        if (item.subCategory === 'Curries') {
            newItem.subCategory = 'Mains';
        }
    }

    return newItem;
});

// Generate content
const foodsContent = `export const foods = ${JSON.stringify(newFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(newFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Files updated successfully.");
