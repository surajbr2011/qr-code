
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Breakfast items (but keep Indian Breakfast)
const filteredFoods = foods.filter(item => !(item.category === 'Breakfast' && item.subCategory === 'Breakfast'));

// New Items
const newItems = [
    {
        id: 3001,
        name: "Fresh Fruits",
        price: 199,
        category: "Breakfast",
        subCategory: "Breakfast",
        veg: true,
        image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 3002,
        name: "Homemade Muesli",
        price: 220,
        category: "Breakfast",
        subCategory: "Breakfast",
        veg: true,
        description: "Plain or fruit with yogurt and honey",
        image: "https://images.unsplash.com/photo-1517673400267-3601815147df?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 3003,
        name: "Porridge",
        price: 180,
        category: "Breakfast",
        subCategory: "Breakfast",
        veg: true,
        image: "https://images.unsplash.com/photo-1517424684949-0db8fd571bd1?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 3004,
        name: "French Toast",
        price: 240,
        category: "Breakfast",
        subCategory: "Breakfast",
        veg: false, // Usually contains egg
        image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: 3005,
        name: "Set Breakfast",
        price: 299,
        category: "Breakfast",
        subCategory: "Breakfast",
        veg: true,
        description: "Tomato, Paratha, Salad, Curd, Juice",
        image: "https://images.unsplash.com/photo-1550505393-25a66a8d05dd?auto=format&fit=crop&q=80&w=500" // Generic thali/set meal style
    },
    {
        id: 3006,
        name: "English Breakfast",
        price: 349,
        category: "Breakfast",
        subCategory: "Breakfast",
        veg: false,
        description: "Grilled Tomato, Mushroom, Cake, Sausage, Fried Egg, Baked Beans, Juice",
        image: "https://images.unsplash.com/photo-1544025162-d7669d265f29?auto=format&fit=crop&q=80&w=500"
    }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Breakfast updated successfully.");
