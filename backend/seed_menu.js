const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
require('dotenv').config();

const foods = [
    // --- ALCOHOLIC BEVERAGES ---
    { name: "Smirnoff (60ml)", price: 140, category: "Alcoholic Beverages", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },
    { name: "Magic Moments (60ml)", price: 90, category: "Alcoholic Beverages", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },
    { name: "Grey Goose (60ml)", price: 440, category: "Alcoholic Beverages", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },
    { name: "Absolut (60ml)", price: 340, category: "Alcoholic Beverages", subCategory: "Vodka", veg: true, image: "https://images.unsplash.com/photo-1613247065306-cd3c13b281f6?auto=format&fit=crop&q=80&w=500" },
    { name: "Blue Riband (60ml)", price: 90, category: "Alcoholic Beverages", subCategory: "Gin", veg: true, image: "https://images.unsplash.com/photo-1599307767316-77f72da77f28?auto=format&fit=crop&q=80&w=500" },
    { name: "Bombay Sapphire (60ml)", price: 399, category: "Alcoholic Beverages", subCategory: "Gin", veg: true, image: "https://images.unsplash.com/photo-1599307767316-77f72da77f28?auto=format&fit=crop&q=80&w=500" },
    { name: "Desmondji (60ml)", price: 150, category: "Alcoholic Beverages", subCategory: "Tequila", veg: true, image: "https://images.unsplash.com/photo-1599307767316-77f72da77f28?auto=format&fit=crop&q=80&w=500" },
    { name: "Tequila Silver (60ml)", price: 340, category: "Alcoholic Beverages", subCategory: "Tequila", veg: true, image: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&q=80&w=500" },
    { name: "Tequila Gold (60ml)", price: 400, category: "Alcoholic Beverages", subCategory: "Tequila", veg: true, image: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&q=80&w=500" },
    { name: "Mansion House", price: 80, category: "Alcoholic Beverages", subCategory: "Brandy", veg: true, image: "https://images.unsplash.com/photo-1616259074092-23c214088a2a?auto=format&fit=crop&q=80&w=500" },
    { name: "Honey Bee", price: 60, category: "Alcoholic Beverages", subCategory: "Brandy", veg: true, image: "https://images.unsplash.com/photo-1616259074092-23c214088a2a?auto=format&fit=crop&q=80&w=500" },
    { name: "Sula (Red/White) Glass", price: 300, category: "Alcoholic Beverages", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { name: "Madèra (Red/White) Glass", price: 280, category: "Alcoholic Beverages", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { name: "Madèra (Red/White) Bottle", price: 750, category: "Alcoholic Beverages", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { name: "Big Banyan (Red/White)", price: 1100, category: "Alcoholic Beverages", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=500" },
    { name: "Amora Wine Glass", price: 250, category: "Alcoholic Beverages", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { name: "Amora Wine Bottle", price: 580, category: "Alcoholic Beverages", subCategory: "Wine", veg: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500" },
    { name: "Cashew Feni", price: 110, category: "Spirits", subCategory: "Goan drink", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { name: "RS Pride", price: 180, category: "Alcoholic Beverages", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { name: "Signature", price: 140, category: "Alcoholic Beverages", subCategory: "Indian Blended Whisky", veg: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=500" },
    { name: "Red Label", price: 270, category: "Alcoholic Beverages", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { name: "Black Label", price: 450, category: "Alcoholic Beverages", subCategory: "International Blended Scotch", veg: true, image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=500" },
    { name: "Bacardi White", price: 120, category: "Alcoholic Beverages", subCategory: "Rum", veg: true, image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80&w=500" },
    { name: "Old Monk", price: 70, category: "Alcoholic Beverages", subCategory: "Rum", veg: true, image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80&w=500" },
    // BEVERAGES
    { name: "Black Tea", price: 40, category: "Beverages (Non-Alcohol)", subCategory: "Tea", veg: true, image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=500" },
    { name: "Ginger Lemon Honey Tea", price: 60, category: "Beverages (Non-Alcohol)", subCategory: "Tea", veg: true, image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=500" },
    { name: "Green Tea", price: 40, category: "Beverages (Non-Alcohol)", subCategory: "Tea", veg: true, image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&q=80&w=500" },
    // BREAKFAST
    { name: "Paratha & Aloo", price: 179, category: "Breakfast", subCategory: "Indian Breakfast", veg: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500" },
    { name: "French Toast", price: 240, category: "Breakfast", subCategory: "Egg / Omelette / Toast", veg: false, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=500" },
    { name: "Veg Maggi", price: 99, category: "Snacks", subCategory: "Maggie", veg: true, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },
    { name: "Egg Maggi", price: 120, category: "Snacks", subCategory: "Maggie", veg: false, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=500" },
    // STARTERS
    { name: "Gobi Manchurian", price: 199, category: "Starters", subCategory: "Veg", veg: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc2d6?auto=format&fit=crop&q=80&w=500" },
    { name: "Chicken Chilli", price: 320, category: "Starters", subCategory: "Non-Veg", veg: false, image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500" },
    { name: "French Fries (Masala)", price: 150, category: "Starters", subCategory: "Quick Bites", veg: true, image: "https://images.unsplash.com/photo-1630384060421-a4323ceca0ad?auto=format&fit=crop&q=80&w=500" },
    // MAIN COURSE
    { name: "Dal Tadka", price: 199, category: "Main Course", subCategory: "Curries", veg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=500" },
    { name: "Chicken Butter Masala", price: 320, category: "Main Course", subCategory: "Curries", veg: false, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=500" },
    { name: "Jeera Rice", price: 130, category: "Main Course", subCategory: "Rice", veg: true, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=500" },
    { name: "Veg Biryani", price: 280, category: "Main Course", subCategory: "Biryani", veg: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=500" },
    { name: "Chicken Biryani", price: 350, category: "Main Course", subCategory: "Biryani", veg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=500" },
    // DESSERT
    { name: "Ice Cream (Single Scoop)", price: 150, category: "Dessert & Cold Stuff", subCategory: "Desserts", veg: true, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=500" },
    { name: "Mojito", price: 150, category: "Dessert & Cold Stuff", subCategory: "Mocktails", veg: true, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500" },
    { name: "Fresh Lime Soda", price: 60, category: "Dessert & Cold Stuff", subCategory: "Cold Stuff", veg: true, image: "https://images.unsplash.com/photo-1513456852971-30cfa382c914?auto=format&fit=crop&q=80&w=500" }
];

const seedMenu = async () => {
    try {
        console.log('Connecting to DB...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Clearing old items...');
        await MenuItem.deleteMany({});

        console.log(`Seeding ${foods.length} items...`);
        const itemPromises = foods.map(food => {
            return MenuItem.create({
                ...food,
                isAvailable: true,
                description: food.subCategory || food.category
            });
        });

        await Promise.all(itemPromises);
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedMenu();
