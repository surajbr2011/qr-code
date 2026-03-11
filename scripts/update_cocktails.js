
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Cocktails
const filteredFoods = foods.filter(item => !(item.category === 'Whisky, Rum, Cocktails, Beer' && item.subCategory === 'Cocktails'));

// New Items
const newItems = [
    { id: 10501, name: "Mojito", price: 250, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10502, name: "Pina Colada", price: 320, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=500" },
    { id: 10503, name: "Margarita (Frozen)", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=500" },
    { id: 10504, name: "Long Island Iced Tea", price: 450, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10505, name: "Cosmopolitan", price: 299, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10506, name: "Pink Gin", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1599307767316-77f72da77f28?auto=format&fit=crop&q=80&w=500" },
    { id: 10507, name: "Bee’s Knees", price: 299, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10508, name: "Daiquiri (Mango)", price: 299, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10509, name: "Daiquiri (Banana)", price: 299, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10510, name: "Daiquiri (Strawberry)", price: 299, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10511, name: "Old Fashioned", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10512, name: "Sky Vodka Cocktail", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10513, name: "White Russian", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10514, name: "Black Russian", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10515, name: "Whisky Sour", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Cocktails updated successfully.");
