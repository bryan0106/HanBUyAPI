const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getOnhandProducts,
  getPreorderProducts,
  getKRComparison
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/onhand', getOnhandProducts);
router.get('/preorder', getPreorderProducts);
router.get('/kr-comparison', getKRComparison);
router.get('/:id', getProductById);

module.exports = router;


