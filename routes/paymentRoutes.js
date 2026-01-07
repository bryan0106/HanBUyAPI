const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateQRCode, confirmPayment, getPayment } = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/qr-code', requireAuth, generateQRCode);
router.post('/confirm', requireAuth, upload.single('payment_proof'), confirmPayment);
router.get('/:id', requireAuth, getPayment);

module.exports = router;


