const express = require('express');
const router = express.Router();
const { calculateShippingQuote, calculateCBM } = require('../controllers/shippingController');

router.post('/quote', calculateShippingQuote);
router.post('/cbm-calculate', calculateCBM);

module.exports = router;


