
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Mains
const filteredFoods = foods.filter(item => !(item.category === 'Main Course' && item.subCategory === 'Mains'));

// New Items
const newItems = [
    // Veg
    { id: 6001, name: "Dal Tadka", price: 199, category: "Main Course", subCategory: "Mains", veg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=500" },
    { id: 6002, name: "Dal Fry", price: 180, category: "Main Course", subCategory: "Mains", veg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&q=80&w=500" },
    { id: 6003, name: "Mix Veg Curry", price: 260, category: "Main Course", subCategory: "Mains", veg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=500" },
    { id: 6004, name: "Paneer Butter Masala", price: 350, category: "Main Course", subCategory: "Mains", veg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=500" }, // Reusing correct pbm image if available or generic curry
    { id: 6005, name: "Kadai Paneer", price: 350, category: "Main Course", subCategory: "Mains", veg: true, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=500" },
    { id: 6006, name: "Kadai Mushroom", price: 350, category: "Main Course", subCategory: "Mains", veg: true, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=500" },

    // Non-Veg
    { id: 6007, name: "Chicken Butter Masala", price: 320, category: "Main Course", subCategory: "Mains", veg: false, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=500" },
    { id: 6008, name: "Kadai Chicken", price: 320, category: "Main Course", subCategory: "Mains", veg: false, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=500" }, // Need varied images ideally
    { id: 6009, name: "Kadai Prawns", price: 400, category: "Main Course", subCategory: "Mains", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },
    { id: 6010, name: "Chicken Curry", price: 260, category: "Main Course", subCategory: "Mains", veg: false, image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=500" },
    { id: 6011, name: "Chicken Masala", price: 300, category: "Main Course", subCategory: "Mains", veg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 6012, name: "Chicken Do Pyaza", price: 300, category: "Main Course", subCategory: "Mains", veg: false, image: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&q=80&w=500" },
    { id: 6013, name: "Chicken Kolhapuri", price: 320, category: "Main Course", subCategory: "Mains", veg: false, image: "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Mains updated successfully.");
