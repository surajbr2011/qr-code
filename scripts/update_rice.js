
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Rice
const filteredFoods = foods.filter(item => !(item.category === 'Main Course' && item.subCategory === 'Rice'));

// New Items
const newItems = [
    { id: 6101, name: "Steam Rice", price: 99, category: "Main Course", subCategory: "Rice", veg: true, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=500" },
    { id: 6102, name: "Jeera Rice", price: 130, category: "Main Course", subCategory: "Rice", veg: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" }, // Generic rice/food image
    { id: 6103, name: "Curd Rice", price: 160, category: "Main Course", subCategory: "Rice", veg: true, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=500" }, // South indian style
    { id: 6104, name: "Dal Khichdi", price: 180, category: "Main Course", subCategory: "Rice", veg: true, image: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&q=80&w=500" },
    { id: 6105, name: "Veg Pulao", price: 200, category: "Main Course", subCategory: "Rice", veg: true, image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=500" },
    { id: 6106, name: "Non-Veg Pulao", price: 280, category: "Main Course", subCategory: "Rice", veg: false, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=500" },
    { id: 6107, name: "Goan Rice with Cashews & Caramelized Onion", price: 230, category: "Main Course", subCategory: "Rice", veg: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" } // Rich rice dish
];

// Note: Reusing some Unsplash IDs but they are valid.

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Rice updated successfully.");
