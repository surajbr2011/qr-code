
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Fresh Salad
const filteredFoods = foods.filter(item => !(item.category === 'Fresh Salad / Soups / Pasta' && item.subCategory === 'Fresh Salad'));

// New Items
const newItems = [
    {
        id: 7001,
        name: "Green Salad",
        price: 150,
        category: "Fresh Salad / Soups / Pasta",
        subCategory: "Fresh Salad",
        veg: true,
        description: "Green, Tomato, Carrot, Cucumber",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 7002,
        name: "Mediterranean Chickpea Salad",
        price: 250,
        category: "Fresh Salad / Soups / Pasta",
        subCategory: "Fresh Salad",
        veg: true,
        description: "Chickpea, Lettuce, Olives, Cheese & Green Dressing",
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 7003,
        name: "Mix Salad (Veg)",
        price: 300,
        category: "Fresh Salad / Soups / Pasta",
        subCategory: "Fresh Salad",
        veg: true,
        description: "Assorted fresh vegetables",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 7004,
        name: "Mix Salad (Non-Veg)",
        price: 600,
        category: "Fresh Salad / Soups / Pasta",
        subCategory: "Fresh Salad",
        veg: false,
        description: "Mixed greens with grilled meats",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 7005,
        name: "Chicken Salad",
        price: 299,
        category: "Fresh Salad / Soups / Pasta",
        subCategory: "Fresh Salad",
        veg: false,
        description: "Grilled Chicken, Green Veggies, Cheese, Mayo, Iceberg Lettuce",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 7006,
        name: "Grilled Prawns Salad",
        price: 400,
        category: "Fresh Salad / Soups / Pasta",
        subCategory: "Fresh Salad",
        veg: false,
        description: "Grilled Prawns, Green Veggies, Cheese, Mayo, Iceberg Lettuce",
        image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 7007,
        name: "Seafood Salad",
        price: 500,
        category: "Fresh Salad / Soups / Pasta",
        subCategory: "Fresh Salad",
        veg: false,
        description: "Grilled Seafood, Green Veggies, Cheese, Mayo, Iceberg Lettuce",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=500"
    }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Fresh Salad updated successfully.");
