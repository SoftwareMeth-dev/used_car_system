// routes/buyerRoutes.js
const express = require('express');
const router = express.Router();
const BuyerController = require('../controllers/BuyerController');

router.get('/view_listings', BuyerController.getAllListings);
router.get('/search_listings', BuyerController.searchListings);
router.post('/save_to_shortlist', BuyerController.saveToShortlist);
router.get('/get_shortlist', BuyerController.getShortlist);

module.exports = router;
