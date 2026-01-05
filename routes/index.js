const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const enumRoutes = require('./enumRoutes');

// Root route
router.get('/', (req, res) => {
  res.json({
    message: 'Express.js server with Neon Postgres is running!',
    endpoints: {
      health: '/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      getUsers: 'GET /api/users?role=string&approval_status=string',
      getUserById: 'GET /api/users/:id',
      updateUser: 'PUT /api/users/:id',
      getBankType: 'GET /api/bank-type',
      getBoxType: 'GET /api/box-type',
      getCart: 'GET /api/cart?user_id=UUID',
      addToCart: 'POST /api/cart',
      createOrder: 'POST /api/orders',
      getOrders: 'GET /api/orders?user_id=UUID&status=string&payment_status=string',
      getOrderById: 'GET /api/orders/:id'
    }
  });
});

// Mount routes
router.use('/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api', enumRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/orders', orderRoutes);

module.exports = router;

