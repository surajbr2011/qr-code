const MenuItem = require('../models/MenuItem');

const path = require('path');
const redis = require('../utils/cache');

// @desc    Fetch all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
    try {
        const category = req.query.category;
        const filter = category ? { category } : {};
        const cacheKey = category ? `menu:category:${category}` : 'menu:all';

        // Try cache
        // try {
        //     const cached = await redis.get(cacheKey);
        //     if (cached) {
        //         return res.json(JSON.parse(cached));
        //     }
        // } catch (e) {
        //     console.warn('Redis get failed', e.message);
        // }

        const items = await MenuItem.find(filter);

        // Set cache (short TTL)
        // try {
        //     await redis.set(cacheKey, JSON.stringify(items), 'EX', 300); // 5 minutes
        // } catch (e) {
        //     console.warn('Redis set failed', e.message);
        // }

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new menu item
// @route   POST /api/menu
// @access  Private/Admin
const addMenuItem = async (req, res) => {
    try {
        const { name, price, category, description, foodType, available, imageUrl } = req.body;

        const newItem = new MenuItem({
            name,
            price,
            category,
            description,
            description,
            // Map foodType to veg boolean
            veg: foodType === 'veg',
            image: imageUrl, // Mapping frontend 'imageUrl' to schema 'image'
            isAvailable: available,
        });

        // Wait, let's check the schema again.
        // Schema: category enum: ['veg', 'nonveg', 'drinks', 'dessert']
        // Frontend: category: "Starters", foodType: "veg"
        // This is a mismatch. I will override category to 'veg'/'nonveg' for now if they map, or update schema details later.
        // Actually, let's just save what we get and relax schema logic if needed or map it.
        // For now, I'll save 'category' as passed if it matches, else default to 'veg'.

        // BETTER: I'll update the schema to strictly generic String to allow "Starters".

        const createdItem = await newItem.save();

        // Invalidate menu caches
        try {
            await redis.del('menu:all');
            const keys = await redis.keys('menu:category:*');
            if (keys.length) await redis.del(...keys);
        } catch (e) {
            console.warn('Redis invalidate failed', e.message);
        }

        res.status(201).json(createdItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
    try {
        const { name, price, category, description, available, imageUrl } = req.body;
        const item = await MenuItem.findById(req.params.id);

        if (item) {
            item.name = name || item.name;
            item.price = price || item.price;
            item.category = category || item.category;
            item.description = description || item.description;
            // Handle foodType update if provided
            if (req.body.foodType) {
                item.veg = req.body.foodType === 'veg';
            }
            item.isAvailable = available !== undefined ? available : item.isAvailable;
            item.image = imageUrl || item.image;

            const updatedItem = await item.save();

            // Invalidate cache
            try {
                await redis.del('menu:all');
                const keys = await redis.keys('menu:category:*');
                if (keys.length) await redis.del(...keys);
            } catch (e) {
                console.warn('Redis invalidate failed', e.message);
            }

            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);

        if (item) {
            await item.deleteOne();
            // Invalidate cache
            try {
                await redis.del('menu:all');
                const keys = await redis.keys('menu:category:*');
                if (keys.length) await redis.del(...keys);
            } catch (e) {
                console.warn('Redis invalidate failed', e.message);
            }

            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
};

// @desc    Upload menu image
// @route   POST /api/menu/upload
// @access  Private/Admin
const uploadMenuImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Build absolute URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(201).json({ url: fileUrl, filename: req.file.filename });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// add to exports
module.exports.uploadMenuImage = uploadMenuImage;

