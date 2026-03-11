
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Filter out existing "Whisky, Rum, Cocktails, Beer" to rebuild it clean
// OR just strictly modify existing ones and append new ones.
// Let's filter out to be safe and rebuild the set to ensure we don't have duplicates or old mis-categorized items.
// Actually, let's keep the *existing* valid items (like RS Pride, Red Label) and just re-map them if needed, 
// and ADD the missing subcategory items.

const otherFoods = foods.filter(item => item.category !== 'Whisky, Rum, Cocktails, Beer');
const existingAlcohol = foods.filter(item => item.category === 'Whisky, Rum, Cocktails, Beer');

// Map existing items to match exact requested subcategory strings if needed
// Requested: "International Blended Scotch", "Indian Blended Whisky", "Rum", "Single Malt", "Cocktails", "Beers"
const fixedExisting = existingAlcohol.map(item => {
    let sub = item.subCategory;
    if (sub.toLowerCase().includes('scot')) sub = "International Blended Scotch";
    else if (sub.toLowerCase().includes('indian')) sub = "Indian Blended Whisky";
    else if (sub.toLowerCase().includes('rum')) sub = "Rum";
    return { ...item, subCategory: sub };
});

// Create new items for missing subcategories to ensure they appear
// 1. Single Malt
const singleMalts = [
    { id: 10001, name: "Glenfiddich 12 Years", price: 550, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Single Malt", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10002, name: "Talisker 10 Years", price: 600, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Single Malt", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" }
];

// 2. Cocktails
const cocktails = [
    { id: 10003, name: "Mojito", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10004, name: "Cosmopolitan", price: 400, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10005, name: "LIIT", price: 550, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" }
];

// 3. Beers
const beers = [
    { id: 10006, name: "Kingfisher Premium", price: 180, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10007, name: "Heineken", price: 250, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10008, name: "Corona", price: 300, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" }
];

const newAlcohol = [...fixedExisting, ...singleMalts, ...cocktails, ...beers];
const finalFoods = [...otherFoods, ...newAlcohol];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Whisky/Beer structure updated successfully.");
