const redis = require('./src/utils/cache');
require('dotenv').config();

const clearCache = async () => {
    try {
        console.log('Connecting to Redis and clearing menu cache...');

        // Delete specific keys
        await redis.del('menu:all');
        const keys = await redis.keys('menu:category:*');
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`Cleared ${keys.length} category cache keys.`);
        }

        console.log('Menu cache cleared successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to clear cache:', err);
        process.exit(1);
    }
};

clearCache();
