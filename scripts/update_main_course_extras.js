
const fs = require('fs');

// Read file
const rawData = fs.readFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', 'utf8');
const arrayContent = rawData.replace(/export const foods =/, '').replace(/;$/, '').replace(/;s*export default menuData;s*$/, '');
const foods = eval(arrayContent);

// Remove old items if re-running (safe to filter by subcats if they existed, but these are new)
// We won't delete "Mains" or "Rice" (existing steamed rice). We just append or replace if these specifically exist.
// Let's filter out these specific subcategories to avoid dupes:
const subCatsToRemove = ["Fried Rice", "Noodles", "Goan Main Course", "Accompaniments"];
const filteredFoods = foods.filter(item => !(item.category === 'Main Course' && subCatsToRemove.includes(item.subCategory)));

const newItems = [
    // FRIED RICE
    { id: 14001, name: "Veg Fried Rice", price: 240, category: "Main Course", subCategory: "Fried Rice", veg: true, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=500" },
    { id: 14002, name: "Egg Fried Rice", price: 270, category: "Main Course", subCategory: "Fried Rice", veg: false, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=500" },
    { id: 14003, name: "Chicken Fried Rice", price: 290, category: "Main Course", subCategory: "Fried Rice", veg: false, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=500" },
    { id: 14004, name: "Prawns Fried Rice", price: 350, category: "Main Course", subCategory: "Fried Rice", veg: false, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=500" },
    { id: 14005, name: "Seafood Fried Rice", price: 400, category: "Main Course", subCategory: "Fried Rice", veg: false, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=500" },

    // NOODLES
    { id: 14101, name: "Veg Noodles", price: 240, category: "Main Course", subCategory: "Noodles", veg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=500" },
    { id: 14102, name: "Egg Noodles", price: 270, category: "Main Course", subCategory: "Noodles", veg: false, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=500" },
    { id: 14103, name: "Chicken Noodles", price: 290, category: "Main Course", subCategory: "Noodles", veg: false, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=500" },
    { id: 14104, name: "Prawns Noodles", price: 350, category: "Main Course", subCategory: "Noodles", veg: false, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=500" },
    { id: 14105, name: "Seafood Noodles", price: 400, category: "Main Course", subCategory: "Noodles", veg: false, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=500" },

    // ACCOMPANIMENTS
    { id: 14201, name: "Plain Curd", price: 80, category: "Main Course", subCategory: "Accompaniments", veg: true, image: "https://images.unsplash.com/photo-1563914466-2f5d72f883da?auto=format&fit=crop&q=80&w=500" },
    { id: 14202, name: "Veg Raita", price: 99, category: "Main Course", subCategory: "Accompaniments", veg: true, image: "https://images.unsplash.com/photo-1563914466-2f5d72f883da?auto=format&fit=crop&q=80&w=500" },
    { id: 14203, name: "Pineapple Raita", price: 150, category: "Main Course", subCategory: "Accompaniments", veg: true, image: "https://images.unsplash.com/photo-1563914466-2f5d72f883da?auto=format&fit=crop&q=80&w=500" },
    { id: 14204, name: "Pomegranate Raita", price: 150, category: "Main Course", subCategory: "Accompaniments", veg: true, image: "https://images.unsplash.com/photo-1563914466-2f5d72f883da?auto=format&fit=crop&q=80&w=500" },

    // GOAN MAIN COURSE (Homemade Recipe)
    // Fish & Seafood
    { id: 14301, name: "Fish Curry (with Rice)", price: 300, category: "Main Course", subCategory: "Goan Main Course", veg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14302, name: "Prawn Fish Curry (with Rice)", price: 360, category: "Main Course", subCategory: "Goan Main Course", veg: false, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },

    // Ambotik
    { id: 14303, name: "Ambotik (Shark)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14304, name: "Ambotik (Prawn)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14305, name: "Ambotik (Kingfish)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14306, name: "Ambotik (Chicken)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },

    // Xacuti
    { id: 14307, name: "Xacuti (Shark)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14308, name: "Xacuti (Prawn)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14309, name: "Xacuti (Kingfish)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14310, name: "Xacuti (Chicken)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },

    // Vindaloo
    { id: 14311, name: "Vindaloo (Shark)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14312, name: "Vindaloo (Prawn)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14313, name: "Vindaloo (Kingfish)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14314, name: "Vindaloo (Chicken)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },

    // Cafreal
    { id: 14315, name: "Cafreal (Shark)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14316, name: "Cafreal (Prawn)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14317, name: "Cafreal (Kingfish)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14318, name: "Cafreal (Chicken)", price: 0, category: "Main Course", subCategory: "Goan Main Course", veg: false, description: "Price as per catch", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14319, name: "Cafreal (Veg)", price: 250, category: "Main Course", subCategory: "Goan Main Course", veg: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" },
    { id: 14320, name: "Cafreal (Paneer)", price: 290, category: "Main Course", subCategory: "Goan Main Course", veg: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500" }
];

const finalFoods = [...filteredFoods, ...newItems];

const foodsContent = `export const foods = ${JSON.stringify(finalFoods, null, 4)};`;
const menuDataContent = `const menuData = ${JSON.stringify(finalFoods, null, 4)};\n\nexport default menuData;`;

fs.writeFileSync('e:/Restaurant-QR-Code/userfrontend/src/data/foods.js', foodsContent);
fs.writeFileSync('e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js', menuDataContent);

console.log("Main Course Extras updated successfully.");
