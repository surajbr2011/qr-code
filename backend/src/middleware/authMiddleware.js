const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try finding Staff first
            let user = await Staff.findById(decoded.id).select('-password');

            // If not staff, try User
            if (!user) {
                const User = require('../models/User');
                user = await User.findById(decoded.id).select('-password');
            }

            req.user = user;

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            return next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }
        next();
    };
};


const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Check Staff first, then User? Or we need separate middlewares?
            // Since we have separate models, let's try to find either.
            let user = await Staff.findById(decoded.id).select('-password');
            if (!user) {
                // Try User
                const User = require('../models/User'); // Lazy import to avoid circular dependency if any
                user = await User.findById(decoded.id).select('-password');
            }
            req.user = user;
        } catch (error) {
            // Invalid token, just proceed as guest
            console.log("Optional Auth Token Failed:", error.message);
        }
    }
    next();
};

module.exports = { protect, authorizeRoles, optionalAuth };
