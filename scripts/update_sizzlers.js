
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Sizzlers
const filteredFoods = foods.filter(item => !(item.category === 'Sandwich & Sizzlers' && item.subCategory === 'Sizzlers'));

// New Items
const newItems = [
    {
        id: 8101,
        name: "Veg Sizzler",
        price: 300,
        category: "Sandwich & Sizzlers",
        subCategory: "Sizzlers",
        veg: true,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=500" // Generic nice sizzler-like food
    },
    {
        id: 8102,
        name: "Chicken Sizzler",
        price: 350,
        category: "Sandwich & Sizzlers",
        subCategory: "Sizzlers",
        veg: false,
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 8103,
        name: "Kingfish Sizzler",
        price: 500,
        category: "Sandwich & Sizzlers",
        subCategory: "Sizzlers",
        veg: false,
        image: "https://images.unsplash.com/photo-1599488615731-7e512819a636?auto=format&fit=crop&q=80&w=500" // Fish
    },
    {
        id: 8104,
        name: "Seafood Sizzler",
        price: 400,
        category: "Sandwich & Sizzlers",
        subCategory: "Sizzlers",
        veg: false,
        image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" // Seafood
    }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Sizzlers updated successfully.");
