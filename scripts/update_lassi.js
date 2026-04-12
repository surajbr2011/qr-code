
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Lassi
const filteredFoods = foods.filter(item => !(item.category === 'Juice/Shake/Lassi' && item.subCategory === 'Lassi'));

// New Items
const newItems = [
    {
        id: 2301,
        name: "Butter Milk",
        price: 79,
        category: "Juice/Shake/Lassi",
        subCategory: "Lassi",
        veg: true,
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=500" // Buttermilk style 
    },
    {
        id: 2302,
        name: "Plain Sweet Lassi",
        price: 99,
        category: "Juice/Shake/Lassi",
        subCategory: "Lassi",
        veg: true,
        image: "https://images.unsplash.com/photo-1567332694471-3f569d2cbf0b?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 2303,
        name: "Banana Lassi",
        price: 150,
        category: "Juice/Shake/Lassi",
        subCategory: "Lassi",
        veg: true,
        image: "https://images.unsplash.com/photo-1596711904269-a1fc1630c72e?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 2304,
        name: "Single Fruit Lassi",
        price: 150,
        category: "Juice/Shake/Lassi",
        subCategory: "Lassi",
        veg: true,
        image: "https://images.unsplash.com/photo-1543573852-1a71a6ce19bc?auto=format&fit=crop&q=80&w=500" // Strawberry/Fruit style
    },
    {
        id: 2305,
        name: "Mix Fruit Lassi",
        price: 199,
        category: "Juice/Shake/Lassi",
        subCategory: "Lassi",
        veg: true,
        image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=500"
    }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Lassi updated successfully.");
