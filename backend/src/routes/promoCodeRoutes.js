const express = require('express');
const router = express.Router();
const {
    createPromoCode,
    getAllPromoCodes,
    validatePromoCode,
    deletePromoCode
} = require('../controllers/promoCodeController');

// Public route to validate code
router.post('/validate', validatePromoCode);

// Admin routes (should be protected in real app, but open for MVP/Demo based on existing pattern)
router.post('/', createPromoCode);
router.get('/', getAllPromoCodes);
router.delete('/:id', deletePromoCode);

module.exports = router;
