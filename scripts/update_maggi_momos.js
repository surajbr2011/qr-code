
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Filter to check if category already exists 
const filteredFoods = foods.filter(item => item.category !== 'Maggie, Pan Cake, Momos');

const newItems = [
    // MAGGI
    { id: 13001, name: "Plain Maggi", price: 60, category: "Maggie, Pan Cake, Momos", subCategory: "Maggi", veg: true, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },
    { id: 13002, name: "Cheese Maggi", price: 80, category: "Maggie, Pan Cake, Momos", subCategory: "Maggi", veg: true, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },
    { id: 13003, name: "Veg Maggi", price: 99, category: "Maggie, Pan Cake, Momos", subCategory: "Maggi", veg: true, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },
    { id: 13004, name: "Egg Maggi", price: 120, category: "Maggie, Pan Cake, Momos", subCategory: "Maggi", veg: false, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },
    { id: 13005, name: "Chicken Maggi", price: 150, category: "Maggie, Pan Cake, Momos", subCategory: "Maggi", veg: false, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },

    // MOMOS
    { id: 13101, name: "Cheese Momos", price: 199, category: "Maggie, Pan Cake, Momos", subCategory: "Momos", veg: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { id: 13102, name: "Corn Momos", price: 199, category: "Maggie, Pan Cake, Momos", subCategory: "Momos", veg: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { id: 13103, name: "Veg Momos", price: 220, category: "Maggie, Pan Cake, Momos", subCategory: "Momos", veg: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { id: 13104, name: "Chicken Momos", price: 250, category: "Maggie, Pan Cake, Momos", subCategory: "Momos", veg: false, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=500" },

    // PANCAKE
    { id: 13201, name: "Lemon Sugar Pancake", price: 170, category: "Maggie, Pan Cake, Momos", subCategory: "Pancake", veg: true, image: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&q=80&w=500" },
    { id: 13202, name: "Chocolate Pancake", price: 199, category: "Maggie, Pan Cake, Momos", subCategory: "Pancake", veg: true, image: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&q=80&w=500" },
    { id: 13203, name: "Banana Nutella Pancake", price: 230, category: "Maggie, Pan Cake, Momos", subCategory: "Pancake", veg: true, image: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&q=80&w=500" },
    { id: 13204, name: "Stick Pancake", price: 299, category: "Maggie, Pan Cake, Momos", subCategory: "Pancake", veg: true, image: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Maggi/Momos/Pancake category updated successfully.");
