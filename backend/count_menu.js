const mongoose = require('mongoose');
require('dotenv').config();

const Menu = require('./src/models/MenuItem');

const countItems = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const count = await Menu.countDocuments({});
        console.log("**************************************************");
        console.log(`FINAL COUNT: ${count}`);
        console.log("**************************************************");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

countItems();
