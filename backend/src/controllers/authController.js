const Staff = require('../models/Staff');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

// @desc    Auth staff/admin & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth staff/admin & get token
// @route   POST /api/auth/login
// @access  Public
const authStaff = async (req, res) => {
    const { email, employeeId, password } = req.body;

    try {
        // Allow login with either email or employeeId (frontend might send either key or just 'email' as a generic field)
        const loginIdentity = email || employeeId;

        if (!loginIdentity) {
            return res.status(400).json({ message: 'Email or Employee ID is required' });
        }

        const staff = await Staff.findOne({
            $or: [
                { email: loginIdentity },
                { employeeId: loginIdentity }
            ]
        });

        if (staff && (await staff.matchPassword(password))) {
            const accessToken = generateAccessToken(staff._id);
            const refreshToken = generateRefreshToken(staff._id);

            await Staff.updateOne(
                { _id: staff._id },
                { $push: { refreshTokens: refreshToken } }
            );

            res.json({
                _id: staff._id,
                name: staff.name,
                email: staff.email,
                employeeId: staff.employeeId,
                role: staff.role,
                accessToken,
                refreshToken,
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new staff (Admin only)
// @route   POST /api/auth/register-staff
// @access  Private/Admin
const registerStaff = async (req, res) => {
    const { name, email, employeeId, password, role } = req.body;

    try {
        const staffExists = await Staff.findOne({ employeeId });

        if (staffExists) {
            res.status(400).json({ message: 'Staff with this Employee ID already exists' });
            return;
        }

        const staff = await Staff.create({
            name,
            email,
            employeeId,
            password,
            role
        });

        if (staff) {
            const accessToken = generateAccessToken(staff._id);
            const refreshToken = generateRefreshToken(staff._id);
            await Staff.updateOne(
                { _id: staff._id },
                { $push: { refreshTokens: refreshToken } }
            );

            res.status(201).json({
                _id: staff._id,
                name: staff.name,
                email: staff.email,
                employeeId: staff.employeeId,
                role: staff.role,
                accessToken,
                refreshToken,
            });
        } else {
            res.status(400).json({ message: 'Invalid staff data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Staff Details
// @route   PUT /api/auth/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (staff) {
            staff.name = req.body.name || staff.name;
            staff.email = req.body.email || staff.email;
            staff.employeeId = req.body.employeeId || staff.employeeId;
            staff.role = req.body.role || staff.role;
            if (req.body.status) {
                staff.isActive = req.body.status === 'Active';
            }

            if (req.body.password) {
                staff.password = req.body.password;
            }

            const updatedStaff = await staff.save();

            res.json({
                _id: updatedStaff._id,
                name: updatedStaff.name,
                email: updatedStaff.email,
                employeeId: updatedStaff.employeeId,
                role: updatedStaff.role,
                isActive: updatedStaff.isActive
            });
        } else {
            res.status(404).json({ message: 'Staff not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Staff
// @route   DELETE /api/auth/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (staff) {
            await Staff.deleteOne({ _id: staff._id });
            res.json({ message: 'Staff removed' });
        } else {
            res.status(404).json({ message: 'Staff not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const registerCustomer = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ phone }, { email }] });

        if (userExists) {
            res.status(400).json({ message: 'User already exists with this phone or email' });
            return;
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            tableRoom: req.body.tableNumber, // Map tableNumber from frontend to tableRoom in DB
            location: req.body.location
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                tableRoom: user.tableRoom,
                location: user.location,
                token: generateAccessToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Guest Login (Phone only)
// @route   POST /api/auth/guest-login
// @access  Public
// @desc    Guest Login (Phone only)
// @route   POST /api/auth/guest-login
// @access  Public
const guestLogin = async (req, res) => {
    const { phone, name, tableRoom, location } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        let user = await User.findOne({ phone });

        if (user) {
            // User exists, update location if provided
            if (tableRoom) user.tableRoom = tableRoom;
            if (location) user.location = location;
            if (name && user.name === "Guest") user.name = name; // Update name only if it was default

            await user.save();

            console.log(`[GUEST LOGIN] User found & updated: ${user.phone}`);
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                tableRoom: user.tableRoom,
                location: user.location,
                token: generateAccessToken(user._id),
            });
        }

        // Create new user with dummy password
        console.log(`[GUEST LOGIN] Creating new user for: ${phone}`);
        const dummyPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        user = await User.create({
            name: name || "Guest",
            phone,
            password: dummyPassword,
            // Generate unique dummy email to bypass unique constraint if sparse index is missing
            email: `guest_${phone}_${Date.now()}@placeholder.com`,
            tableRoom: tableRoom || null,
            location: location || null
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                tableRoom: user.tableRoom,
                location: user.location,
                token: generateAccessToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(`[GUEST LOGIN ERROR] ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth customer & get token
// @route   POST /api/auth/login
// @access  Public
const authCustomer = async (req, res) => {
    const { email, phone, password } = req.body;

    // Allow login with either email or phone
    const loginIdentity = email || phone;

    try {
        console.log(`[AUTH DEBUG] Login attempt for: ${loginIdentity}`);
        const user = await User.findOne({
            $or: [
                { email: loginIdentity },
                { phone: loginIdentity }
            ]
        });

        if (!user) {
            console.log(`[AUTH DEBUG] User not found for: ${loginIdentity}`);
            return res.status(401).json({ message: 'Invalid credentials (User not found)' });
        }

        const isMatch = await user.matchPassword(password);
        console.log(`[AUTH DEBUG] User found: ${user._id}. Password Match: ${isMatch}`);

        if (isMatch) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                tableRoom: user.tableRoom,
                location: user.location,
                token: generateAccessToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials (Password mismatch)' });
        }
    } catch (error) {
        console.error(`[AUTH DEBUG] Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if user exists (email or phone)
// @route   POST /api/auth/check-exists
// @access  Public
const checkUserExists = async (req, res) => {
    const { email, phone } = req.body;
    try {
        const query = [];
        if (email) query.push({ email });
        if (phone) query.push({ phone });

        if (query.length === 0) {
            return res.status(400).json({ message: "Email or Phone required" });
        }

        const user = await User.findOne({ $or: query });

        if (user) {
            // Determine which one matched
            let msg = "User already exists";
            if (email && user.email === email) msg = "Email already registered";
            if (phone && user.phone === phone) msg = "Phone number already registered";

            return res.status(200).json({ exists: true, message: msg });
        }

        return res.status(200).json({ exists: false });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // req.user is already fetched by protect middleware (either Staff or User)
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            employeeId: req.user.employeeId, // Only for staff
            role: req.user.role || 'customer',
            tableRoom: req.user.tableRoom,
            location: req.user.location,
            isActive: req.user.isActive,
            isAdmin: req.user.isAdmin,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.tableRoom = req.body.tableRoom || user.tableRoom;
        user.location = req.body.location || user.location;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            tableRoom: updatedUser.tableRoom,
            location: updatedUser.location,
            token: generateAccessToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token)
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_jwt_secret');
        const staff = await Staff.findById(decoded.id);
        if (!staff) return res.status(401).json({ message: 'Invalid refresh token' });

        // Check token exists in DB (not revoked)
        if (!staff.refreshTokens || !staff.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({ message: 'Refresh token revoked' });
        }

        // rotate refresh token: remove old, add new
        const newAccessToken = generateAccessToken(staff._id);
        const newRefreshToken = generateRefreshToken(staff._id);

        await Staff.updateOne(
            { _id: staff._id },
            {
                $pull: { refreshTokens: refreshToken },
                $push: { refreshTokens: newRefreshToken }
            }
        );

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};

// @desc    Logout (revoke refresh token)
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    try {
        const decoded = jwt.decode(refreshToken);
        if (!decoded || !decoded.id) return res.status(400).json({ message: 'Invalid token' });

        const staff = await Staff.findById(decoded.id);
        if (!staff) return res.status(200).json({ message: 'Logged out' });

        await Staff.updateOne(
            { _id: staff._id },
            { $pull: { refreshTokens: refreshToken } }
        );

        res.status(200).json({ message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ message: 'Logout failed' });
    }
};

// @desc    Get all staff (Admin only)
// @route   GET /api/auth/staff
// @access  Private/Admin
const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find({}).select('-password -refreshTokens');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authStaff, registerStaff, refreshToken, logout, registerCustomer, authCustomer, guestLogin, getUserProfile, updateUserProfile, getAllStaff, updateStaff, deleteStaff, checkUserExists };
