
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Sandwiches
const filteredFoods = foods.filter(item => !(item.category === 'Sandwich & Sizzlers' && item.subCategory === 'Sandwich'));

// New Items
const newItems = [
    {
        id: 8001,
        name: "Veg Sandwich",
        price: 220,
        category: "Sandwich & Sizzlers",
        subCategory: "Sandwich",
        veg: true,
        description: "Served with Fries. Available Grilled or Non-Grilled.",
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 8002,
        name: "Veg Sandwich (Plain)",
        price: 160,
        category: "Sandwich & Sizzlers",
        subCategory: "Sandwich",
        veg: true,
        description: "Classic plain vegetable sandwich.",
        image: "https://images.unsplash.com/photo-1550505393-25a66a8d05dd?auto=format&fit=crop&q=80&w=500" // Different simple sandwich
    },
    {
        id: 8003,
        name: "Egg Sandwich",
        price: 190,
        category: "Sandwich & Sizzlers",
        subCategory: "Sandwich",
        veg: false,
        description: "Served with Fries.",
        image: "https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 8004,
        name: "Chicken Sandwich",
        price: 250,
        category: "Sandwich & Sizzlers",
        subCategory: "Sandwich",
        veg: false,
        description: "Served with Fries.",
        image: "https://images.unsplash.com/photo-1557022199-562a0572da9a?auto=format&fit=crop&q=80&w=500"
    }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Sandwiches updated successfully.");
