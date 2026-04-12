const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    retryStrategy: (times) => {
        // If we fail more than 3 times, stop retrying
        if (times > 3) {
            console.warn('Redis connection failed too many times. Caching disabled.');
            return null;
        }
        // Exponential backoff
        return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 0 // Fail immediately if no connection
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    // Only log if it's not the "stop retrying" error to avoid spam
    if (err.message !== 'Connection is closed.' && !err.message.includes('ECONNREFUSED')) {
        // console.error('Redis error', err.message); // Optional: hush it further
    }
});

module.exports = redis;
