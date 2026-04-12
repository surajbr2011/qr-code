
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Filter to check if category already exists (to avoid duplicates if re-run) or just append
// Ideally, we remove old items of this specific category to be safe
const filteredFoods = foods.filter(item => item.category !== 'Egg, Omelette, Toast');

const newItems = [
    // TOAST (TOPPED WITH)
    { id: 12001, name: "Butter Toast", price: 50, category: "Egg, Omelette, Toast", subCategory: "Toast", veg: true, image: "https://images.unsplash.com/photo-1584776296944-ab6fb4f25e6e?auto=format&fit=crop&q=80&w=500" },
    { id: 12002, name: "Cheese Toast", price: 80, category: "Egg, Omelette, Toast", subCategory: "Toast", veg: true, image: "https://images.unsplash.com/photo-1584776296944-ab6fb4f25e6e?auto=format&fit=crop&q=80&w=500" },
    { id: 12003, name: "Cheese Tomato Toast", price: 99, category: "Egg, Omelette, Toast", subCategory: "Toast", veg: true, image: "https://images.unsplash.com/photo-1584776296944-ab6fb4f25e6e?auto=format&fit=crop&q=80&w=500" },
    { id: 12004, name: "Cheese Chilly Toast", price: 99, category: "Egg, Omelette, Toast", subCategory: "Toast", veg: true, image: "https://images.unsplash.com/photo-1584776296944-ab6fb4f25e6e?auto=format&fit=crop&q=80&w=500" },
    { id: 12005, name: "Peanut Butter Toast", price: 150, category: "Egg, Omelette, Toast", subCategory: "Toast", veg: true, image: "https://images.unsplash.com/photo-1517414902096-339234b6e511?auto=format&fit=crop&q=80&w=500" },
    { id: 12006, name: "Banana Toast", price: 150, category: "Egg, Omelette, Toast", subCategory: "Toast", veg: true, image: "https://images.unsplash.com/photo-1517414902096-339234b6e511?auto=format&fit=crop&q=80&w=500" },

    // OMELETTE (WITH TOAST) - All Non-Veg (Eggs)
    { id: 12101, name: "Plain Omelette", price: 120, category: "Egg, Omelette, Toast", subCategory: "Omelette", veg: false, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=500" },
    { id: 12102, name: "Masala Omelette", price: 150, category: "Egg, Omelette, Toast", subCategory: "Omelette", veg: false, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=500" },
    { id: 12103, name: "Spanish Cheese Omelette", price: 180, category: "Egg, Omelette, Toast", subCategory: "Omelette", veg: false, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=500" },
    { id: 12104, name: "Omelette Cheddar Tomato Basil", price: 180, category: "Egg, Omelette, Toast", subCategory: "Omelette", veg: false, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=500" },
    { id: 12105, name: "Cheese Tomato Omelette", price: 180, category: "Egg, Omelette, Toast", subCategory: "Omelette", veg: false, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=500" },
    { id: 12106, name: "Mushroom Omelette", price: 180, category: "Egg, Omelette, Toast", subCategory: "Omelette", veg: false, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=500" },

    // EGGS (WITH TOAST)
    { id: 12201, name: "Fried Eggs", price: 150, category: "Egg, Omelette, Toast", subCategory: "Eggs with Toast", veg: false, image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?auto=format&fit=crop&q=80&w=500" },
    { id: 12202, name: "Poached Eggs", price: 180, category: "Egg, Omelette, Toast", subCategory: "Eggs with Toast", veg: false, image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?auto=format&fit=crop&q=80&w=500" },
    { id: 12203, name: "Boiled Eggs", price: 110, category: "Egg, Omelette, Toast", subCategory: "Eggs with Toast", veg: false, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=500" },
    { id: 12204, name: "Scrambled Eggs", price: 180, category: "Egg, Omelette, Toast", subCategory: "Eggs with Toast", veg: false, image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Egg/Toast category updated successfully.");
