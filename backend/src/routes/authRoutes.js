const express = require('express');
const router = express.Router();
const { authStaff, registerStaff, refreshToken, logout, registerCustomer, authCustomer, guestLogin, getUserProfile, updateUserProfile, getAllStaff, updateStaff, deleteStaff, checkUserExists } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// ============ STAFF ROUTES ============

// @route   POST /api/auth/staff-login
// @desc    Login for Staff/Admin
router.post('/staff-login', [
	// one of email or employeeId req. We check in controller.
	body('password').notEmpty().withMessage('Password is required'),
], validateRequest, authStaff);

// @route   POST /api/auth/register-staff
// @desc    Register new staff (Admin only)
router.post('/register-staff', protect, authorizeRoles('admin'), [
	body('name').notEmpty().withMessage('Name is required'),
	body('employeeId').notEmpty().withMessage('Employee ID is required'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	body('role').isIn(['admin', 'manager', 'waiter', 'kitchen']).withMessage('Invalid role')
], validateRequest, registerStaff);

// @route   GET /api/auth/staff
// @desc    Get all staff (Admin only)
router.get('/staff', protect, authorizeRoles('admin'), getAllStaff);

// @route   PUT /api/auth/staff/:id
// @desc    Update staff details (Admin only)
router.put('/staff/:id', protect, authorizeRoles('admin'), updateStaff);

// @route   DELETE /api/auth/staff/:id
// @desc    Delete staff (Admin only)
router.delete('/staff/:id', protect, authorizeRoles('admin'), deleteStaff);

// ============ CUSTOMER ROUTES ============

// @route   POST /api/auth/register
// @desc    Register new Customer
router.post('/register', [
	body('name').notEmpty().withMessage('Name is required'),
	// Phone OR Email required. Express-validator doesn't have "one of" easily in chain without custom validator
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, registerCustomer);

// @route   POST /api/auth/check-exists
// @desc    Check if user exists
router.post('/check-exists', checkUserExists);

// @route   POST /api/auth/login
// @desc    Login Customer
router.post('/login', [
	// Either email or phone required
	body('password').notEmpty().withMessage('Password is required')
], validateRequest, authCustomer);

// @route   POST /api/auth/guest-login
// @desc    Guest Login (Phone only)
router.post('/guest-login', [
	body('phone').notEmpty().withMessage('Phone number is required')
], validateRequest, guestLogin);

// @route   GET/PUT /api/auth/profile
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// ============ TOKEN ROUTES ============

// @route   POST /api/auth/refresh
// @desc    Refresh Access Token
router.post('/refresh', [
	body('refreshToken').notEmpty().withMessage('Refresh token is required')
], validateRequest, refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout (Revoke Refresh Token)
router.post('/logout', [
	body('refreshToken').notEmpty().withMessage('Refresh token is required')
], validateRequest, logout);

router.get('/ping-auth', (req, res) => res.json({ message: "Auth route is working" }));

module.exports = router;
