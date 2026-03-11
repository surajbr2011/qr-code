const express = require('express');
const router = express.Router();
const { getActiveOffers, getOfferById, createOffer, deleteOffer, updateOffer } = require('../controllers/offerController');

router.get('/', getActiveOffers);
router.get('/:id', getOfferById);
router.post('/', createOffer);
router.delete('/:id', deleteOffer);
router.put('/:id', updateOffer);

module.exports = router;
