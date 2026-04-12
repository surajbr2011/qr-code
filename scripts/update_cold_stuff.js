
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Cold Stuff
const filteredFoods = foods.filter(item => !(item.category === 'Dessert & Cold Stuff' && item.subCategory === 'Cold Stuff'));

// New Items
const newItems = [
    {
        id: 9101,
        name: "Fresh Lime Soda",
        price: 60,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9102,
        name: "Fresh Lime Water",
        price: 60,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9103,
        name: "Soft Drinks",
        price: 30,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9104,
        name: "Drinking Water",
        price: 30,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9105,
        name: "Diet Coke",
        price: 99,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9106,
        name: "Red Bull",
        price: 199,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1626159624534-3197607a9094?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9107,
        name: "Breezer",
        price: 199,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1634568894176-928e7e2213cc?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9108,
        name: "Ginger Ale",
        price: 100,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1549487928-863a3ca612a8?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9109,
        name: "Tonic Water",
        price: 100,
        category: "Dessert & Cold Stuff",
        subCategory: "Cold Stuff",
        veg: true,
        image: "https://images.unsplash.com/photo-1598614187854-26a60e982dc4?auto=format&fit=crop&q=80&w=500"
    }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Cold Stuff updated successfully.");
