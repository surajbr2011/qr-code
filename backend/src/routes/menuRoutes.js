const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, uploadMenuImage } = require('../controllers/menuController');

// Multer setup
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../uploads'));
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
	}
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Only image files are allowed!'), false);
	}
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.route('/').get(getMenuItems).post(addMenuItem);
router.post('/upload', upload.single('image'), uploadMenuImage);
router.route('/:id').put(updateMenuItem).delete(deleteMenuItem);

/**
 * @openapi
 * /api/menu:
 *   get:
 *     summary: Get all menu items
 *     tags:
 *       - Menu
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of menu items
 */

module.exports = router;
