
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Desserts
const filteredFoods = foods.filter(item => !(item.category === 'Dessert & Cold Stuff' && item.subCategory === 'Desserts'));

// New Items
const newItems = [
    {
        id: 9001,
        name: "Ice Cream – Chocolate",
        price: 150,
        category: "Dessert & Cold Stuff",
        subCategory: "Desserts",
        veg: true,
        image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9002,
        name: "Ice Cream – Vanilla",
        price: 150,
        category: "Dessert & Cold Stuff",
        subCategory: "Desserts",
        veg: true,
        image: "https://images.unsplash.com/photo-1570476922354-81227cdbb76c?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9003,
        name: "Ice Cream – Chikoo",
        price: 150,
        category: "Dessert & Cold Stuff",
        subCategory: "Desserts",
        veg: true,
        image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=500" // Generic ice cream
    },
    {
        id: 9004,
        name: "Ice Cream – Strawberry",
        price: 150,
        category: "Dessert & Cold Stuff",
        subCategory: "Desserts",
        veg: true,
        image: "https://images.unsplash.com/photo-1579954115563-e72bf1381629?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9005,
        name: "Caramel Pudding",
        price: 200,
        category: "Dessert & Cold Stuff",
        subCategory: "Desserts",
        veg: true,
        image: "https://images.unsplash.com/photo-1533038590840-1cde6b4181d6?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9006,
        name: "Gulab Jamun",
        price: 170,
        category: "Dessert & Cold Stuff",
        subCategory: "Desserts",
        veg: true,
        image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 9007,
        name: "Deep Fried Ice Cream (Cinnamon Special)",
        price: 230,
        category: "Dessert & Cold Stuff",
        subCategory: "Desserts",
        veg: true,
        image: "https://images.unsplash.com/photo-1624795071168-cafa593fa88c?auto=format&fit=crop&q=80&w=500"
    }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Desserts updated successfully.");
