
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
// Eval carefully (in a real app, use JSON.parse if strictly JSON, but this is a JS file)
const foods = eval(arrayContent);

// Remove old Veg Starters
const filteredFoods = foods.filter(item => !(item.category === 'Starters' && item.subCategory === 'Veg'));

// New Veg Starters
const newVegStarters = [
    { id: 5001, name: "Honey Chilli Potato", price: 199, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1544510805-4c6328354c52?auto=format&fit=crop&q=80&w=500" },
    { id: 5002, name: "Gobi Manchurian", price: 199, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=500" },
    { id: 5003, name: "Paneer Chilli", price: 320, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc2d6?auto=format&fit=crop&q=80&w=500" },
    { id: 5004, name: "Mushroom Chilli", price: 280, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&q=80&w=500" },
    { id: 5005, name: "Crispy Corn", price: 199, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1599453986847-f58c7336717a?auto=format&fit=crop&q=80&w=500" },
    { id: 5006, name: "Masala Corn", price: 199, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1551326844-f4aa71e54c7d?auto=format&fit=crop&q=80&w=500" },
    { id: 5007, name: "Veg Stir Fry", price: 250, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500" },
    { id: 5008, name: "Veg Crispy", price: 250, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { id: 5009, name: "Cheese Balls", price: 300, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1535568047604-54d15a9a6973?auto=format&fit=crop&q=80&w=500" },
    { id: 5010, name: "Cheese Mushroom", price: 350, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80&w=500" },
    { id: 5011, name: "Veg Chinese Platter", price: 499, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=500" }
];

// Insert new items (e.g., after the last item or where appropriate - usually order doesn't matter too much but let's append)
const finalFoods = [...filteredFoods, ...newVegStarters];

// Sort by ID to keep it tidy? Or just write.
// Actually, let's keep it simple.

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Starters updated successfully.");
