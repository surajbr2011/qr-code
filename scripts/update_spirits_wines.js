
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Spirits & Wines to rebuild clean
const filteredFoods = foods.filter(item => item.category !== 'Spirits & Wines');

// New Items
const newItems = [
    // VODKA
    { id: 11101, name: "Smirnoff (60ml)", price: 140, category: "Spirits & Wines", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },
    { id: 11102, name: "Magic Moments (60ml)", price: 90, category: "Spirits & Wines", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },
    { id: 11103, name: "Grey Goose (60ml)", price: 440, category: "Spirits & Wines", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },
    { id: 11104, name: "Absolut (60ml)", price: 340, category: "Spirits & Wines", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },

    // GIN
    { id: 11201, name: "Blue Riband (60ml)", price: 90, category: "Spirits & Wines", subCategory: "Gin", veg: true, image: "https://images.unsplash.com/photo-1599307767316-77f72da77f28?auto=format&fit=crop&q=80&w=500" },
    { id: 11202, name: "Bombay Sapphire (60ml)", price: 399, category: "Spirits & Wines", subCategory: "Gin", veg: true, image: "https://images.unsplash.com/photo-1599307767316-77f72da77f28?auto=format&fit=crop&q=80&w=500" },

    // TEQUILA
    { id: 11301, name: "Desmondji (60ml)", price: 150, category: "Spirits & Wines", subCategory: "Tequila", veg: true, image: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&q=80&w=500" },
    { id: 11302, name: "Tequila Silver (60ml)", price: 340, category: "Spirits & Wines", subCategory: "Tequila", veg: true, image: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&q=80&w=500" },
    { id: 11303, name: "Tequila Gold (60ml)", price: 400, category: "Spirits & Wines", subCategory: "Tequila", veg: true, image: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&q=80&w=500" },

    // BRANDY
    { id: 11401, name: "Mansion House", price: 80, category: "Spirits & Wines", subCategory: "Brandy", veg: true, image: "https://images.unsplash.com/photo-1616259074092-23c214088a2a?auto=format&fit=crop&q=80&w=500" },
    { id: 11402, name: "Honey Bee", price: 60, category: "Spirits & Wines", subCategory: "Brandy", veg: true, image: "https://images.unsplash.com/photo-1616259074092-23c214088a2a?auto=format&fit=crop&q=80&w=500" },

    // WINE
    { id: 11501, name: "Sula Red Wine (Glass)", price: 300, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11502, name: "Sula White Wine (Glass)", price: 300, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11503, name: "Madeira Red Wine (Glass)", price: 280, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11504, name: "Madeira Red Wine (Bottle)", price: 750, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11505, name: "Madeira White Wine (Glass)", price: 280, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11506, name: "Madeira White Wine (Bottle)", price: 750, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11507, name: "Big Banyan Red Wine (Bottle)", price: 1100, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11508, name: "Big Banyan White Wine (Bottle)", price: 1100, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11509, name: "Amora Wine (Glass)", price: 250, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11510, name: "Amora Wine (Bottle)", price: 580, category: "Spirits & Wines", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { id: 11511, name: "Sauvignon Blanc (White Wine)", price: 0, category: "Spirits & Wines", subCategory: "Wine", veg: true, description: "Price not listed", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },

    // GOAN DRINKS
    { id: 11601, name: "Cashew Feni (60ml)", price: 110, category: "Spirits & Wines", subCategory: "Goan drink", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 11602, name: "Urrak", price: 170, category: "Spirits & Wines", subCategory: "Goan drink", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Spirits & Wines updated successfully.");
