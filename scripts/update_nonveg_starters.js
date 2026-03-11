
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old Non-Veg Starters
// NOTE: I am ONLY removing 'Non-Veg' subcategory items. 
// The user included some "(Veg)" items in their list. I will add them as 'Veg' subcategory items.
const filteredFoods = foods.filter(item => !(item.category === 'Starters' && item.subCategory === 'Non-Veg'));

// New Items
const newItems = [
    // Non-Veg Items
    { id: 5101, name: "Chicken Chilly", price: 320, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500" },
    { id: 5102, name: "Chicken Dry Fry", price: 299, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500" },
    { id: 5103, name: "Chicken Ghee Roast", price: 320, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500" },
    { id: 5104, name: "Prawns Ghee Roast", price: 399, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },
    { id: 5105, name: "Crab Ghee Roast", price: 450, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },
    { id: 5106, name: "Chicken Finger", price: 300, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { id: 5107, name: "Fish Finger", price: 350, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1599488615731-7e512819a636?auto=format&fit=crop&q=80&w=500" },

    // Pepper Fry Variations
    { id: 5108, name: "Pepper Fry/dry (Veg)", price: 199, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc2d6?auto=format&fit=crop&q=80&w=500" },
    { id: 5109, name: "Pepper Fry/dry (Chicken)", price: 280, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500" },
    { id: 5110, name: "Pepper Fry/dry (Seafood)", price: 399, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },

    // Butter Garlic Variations
    { id: 5111, name: "Butter Garlic (Veg)", price: 199, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc2d6?auto=format&fit=crop&q=80&w=500" },
    { id: 5112, name: "Butter Garlic (Chicken)", price: 250, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500" },
    { id: 5113, name: "Butter Garlic (Seafood)", price: 350, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },

    // Golden Fried
    { id: 5114, name: "Golden Fried Prawns", price: 300, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },
    { id: 5115, name: "Golden Fried Calamari", price: 300, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1599488615731-7e512819a636?auto=format&fit=crop&q=80&w=500" },

    // Fish/Prawns Masala/Tawa
    { id: 5116, name: "Fish Masala", price: 350, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=500" },
    { id: 5117, name: "Fish Tawa", price: 350, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=500" },
    { id: 5118, name: "Prawns Masala", price: 350, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },
    { id: 5119, name: "Prawns Tawa", price: 350, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=500" },

    // King Fish
    { id: 5120, name: "King Fish Fry Slice (Masala)", price: 550, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=500" },
    { id: 5121, name: "King Fish Fry Slice (Tawa)", price: 550, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=500" },

    // Others
    { id: 5122, name: "Creamy Chicken", price: 350, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500" },
    { id: 5123, name: "Non-Veg Platter", price: 800, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1544025162-d7669d265f29?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Non-Veg Starters updated successfully.");
