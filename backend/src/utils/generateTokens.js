const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_jwt_secret', {
        expiresIn: '30d',
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_jwt_secret', {
        expiresIn: '7d',
    });
};

module.exports = { generateAccessToken, generateRefreshToken };
