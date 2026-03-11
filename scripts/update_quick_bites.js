
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Quick Bites
const filteredFoods = foods.filter(item => !(item.category === 'Starters' && item.subCategory === 'Quick Bites'));

// New Items
const newItems = [
    // Fries
    { id: 4001, name: "French Fries (Masala)", price: 150, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&q=80&w=500" },
    { id: 4002, name: "French Fries (Salted)", price: 120, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1541592106381-b31e9671c0e6?auto=format&fit=crop&q=80&w=500" },

    // Peanuts
    { id: 4003, name: "Peanut (Masala)", price: 120, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1513456852971-30cfa382c914?auto=format&fit=crop&q=80&w=500" },
    { id: 4004, name: "Peanut (Salted)", price: 99, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=500" },

    // Papad
    { id: 4005, name: "Papad (Masala)", price: 90, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1585503913867-f3eb7e0f2246?auto=format&fit=crop&q=80&w=500" },
    { id: 4006, name: "Papad (Fry)", price: 40, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1587132137056-382c5adeb94f?auto=format&fit=crop&q=80&w=500" },
    { id: 4007, name: "Papad (Roasted)", price: 40, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1587132137056-382c5adeb94f?auto=format&fit=crop&q=80&w=500" }, // Reusing roast papad image if similar, or finding generic

    // Nachos
    { id: 4008, name: "Nachos (Veg)", price: 150, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1513456852971-30cfa382c914?auto=format&fit=crop&q=80&w=500" },
    { id: 4009, name: "Nachos (Chicken)", price: 200, category: "Starters", subCategory: "Quick Bites", veg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 4010, name: "Nachos (Prawns)", price: 250, category: "Starters", subCategory: "Quick Bites", veg: false, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Quick Bites updated successfully.");
