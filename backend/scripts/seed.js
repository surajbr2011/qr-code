const mongoose = require('mongoose');
const MenuItem = require('../src/models/MenuItem');
require('dotenv').config();

const sampleMenuItems = [
    {
        name: "Masala Dosa",
        description: "Crispy rice crepe filled with spiced potatoes, served with sambar and chutney",
        price: 120,
        category: "Main Course",
        veg: true,
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Paneer Butter Masala",
        description: "Cottage cheese cubes in rich, creamy tomato gravy with aromatic spices",
        price: 220,
        category: "Main Course",
        veg: true,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Chicken Biryani",
        description: "Aromatic basmati rice layered with tender chicken and fragrant spices",
        price: 280,
        category: "Main Course",
        veg: false,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Veg Manchurian",
        description: "Deep-fried vegetable balls in tangy Indo-Chinese sauce",
        price: 150,
        category: "Snacks",
        veg: true,
        image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Chicken 65",
        description: "Spicy, deep-fried chicken bites with curry leaves and green chilies",
        price: 200,
        category: "Snacks",
        veg: false,
        image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Mango Lassi",
        description: "Creamy yogurt drink blended with fresh mango pulp",
        price: 80,
        category: "Drinks",
        veg: true,
        image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Masala Chai",
        description: "Traditional Indian spiced tea with ginger and cardamom",
        price: 30,
        category: "Drinks",
        veg: true,
        image: "https://images.unsplash.com/photo-1561336526-2914f13ceb36?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Cold Coffee",
        description: "Chilled coffee blended with ice cream and chocolate",
        price: 90,
        category: "Drinks",
        veg: true,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Gulab Jamun",
        description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
        price: 60,
        category: "Snacks",
        veg: true,
        image: "https://images.unsplash.com/photo-1666190094762-2b25d5d2b543?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    },
    {
        name: "Fish Curry",
        description: "Fresh fish cooked in spicy coconut-based curry",
        price: 260,
        category: "Main Course",
        veg: false,
        image: "https://images.unsplash.com/photo-1626777553635-be342a766548?auto=format&fit=crop&q=80&w=500",
        isAvailable: true
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db');
        console.log('Connected to MongoDB');

        // Clear existing menu items
        await MenuItem.deleteMany({});
        console.log('Cleared existing menu items');

        // Insert sample data
        await MenuItem.insertMany(sampleMenuItems);
        console.log('Sample menu items added successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();