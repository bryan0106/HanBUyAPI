const express = require('express');
const router = express.Router();
const { getBankType, getBoxType } = require('../controllers/userController');

router.get('/bank-type', getBankType);
router.get('/box-type', getBoxType);

module.exports = router;

