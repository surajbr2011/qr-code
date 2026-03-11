
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Alcohol category entirely to rebuild with new detailed list
const filteredFoods = foods.filter(item => item.category !== 'Whisky, Rum, Cocktails, Beer');

// New Detailed Items
const newItems = [
    // 1. INDIAN BLENDED WHISKY
    { id: 10101, name: "Officer’s Pride (60ml)", price: 180, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10102, name: "Signature (60ml)", price: 140, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10103, name: "Royal Stag (60ml)", price: 130, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10104, name: "Antiquity Blue (60ml)", price: 110, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10105, name: "Mc Dowells No.1 (60ml)", price: 130, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10106, name: "100 Pipers (60ml)", price: 99, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10107, name: "Black Dog (60ml)", price: 240, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10108, name: "Black & White (60ml)", price: 200, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },

    // 2. INTERNATIONAL BLENDED SCOTCH
    { id: 10201, name: "Red Label (60ml)", price: 270, category: "Whisky, Rum, Cocktails, Beer", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10202, name: "Black Label (60ml)", price: 450, category: "Whisky, Rum, Cocktails, Beer", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10203, name: "Ballantine (60ml)", price: 299, category: "Whisky, Rum, Cocktails, Beer", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10204, name: "Jameson (60ml)", price: 320, category: "Whisky, Rum, Cocktails, Beer", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10205, name: "Jack Daniel’s (JD) (60ml)", price: 399, category: "Whisky, Rum, Cocktails, Beer", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10206, name: "Jim Beam (60ml)", price: 340, category: "Whisky, Rum, Cocktails, Beer", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10207, name: "Chivas Regal 12 Years (60ml)", price: 450, category: "Whisky, Rum, Cocktails, Beer", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },

    // 3. SINGLE MALT
    { id: 10301, name: "Amrut (Indian)", price: 0, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Single Malt", veg: true, description: "Price not listed", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { id: 10302, name: "Glenfiddich", price: 0, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Single Malt", veg: true, description: "Price not listed", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },

    // 4. RUM
    { id: 10401, name: "Bacardi White Rum (60ml)", price: 120, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Rum", veg: true, image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80&w=500" },
    { id: 10402, name: "Bacardi Lemon (60ml)", price: 140, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Rum", veg: true, image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80&w=500" },
    { id: 10403, name: "Cabo (60ml)", price: 150, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Rum", veg: true, image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80&w=500" },
    { id: 10404, name: "Old Monk (60ml)", price: 70, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Rum", veg: true, image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80&w=500" },
    { id: 10405, name: "Bacardi Black Rum (60ml)", price: 90, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Rum", veg: true, image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80&w=500" },

    // 5. COCKTAILS
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
    { id: 10512, name: "Sky Vodka (Cocktail)", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10513, name: "White Russian", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10514, name: "Black Russian", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { id: 10515, name: "Whisky Sour", price: 350, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Cocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },

    // 6. BEER
    { id: 10601, name: "Kingfisher Premium (Pint)", price: 99, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10602, name: "Kingfisher Premium (Large)", price: 160, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10603, name: "Budweiser Premium (Pint)", price: 120, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10604, name: "Budweiser Magnum (Pint)", price: 140, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10605, name: "Kingfisher Ultra", price: 120, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10606, name: "Kingfisher Strong (Pint)", price: 99, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10607, name: "Kingfisher Strong (Large)", price: 180, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10608, name: "Corona", price: 210, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10609, name: "Bro Code", price: 210, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10610, name: "Kings", price: 160, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10611, name: "Peoples", price: 160, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10612, name: "Eight Finger Eddie", price: 220, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10613, name: "Bira Blond", price: 120, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { id: 10614, name: "Bira White", price: 170, category: "Whisky, Rum, Cocktails, Beer", subCategory: "Beers", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Alcohol details updated successfully.");
