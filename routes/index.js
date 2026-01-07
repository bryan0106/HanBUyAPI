const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const boxRoutes = require('./boxRoutes');
const trackingRoutes = require('./trackingRoutes');
const shippingRoutes = require('./shippingRoutes');
const documentRoutes = require('./documentRoutes');
const notificationRoutes = require('./notificationRoutes');
const likedRoutes = require('./likedRoutes');
const enumRoutes = require('./enumRoutes');

// Root route
router.get('/', (req, res) => {
  res.json({
    message: 'HanBuy API Server is running!',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      users: {
        list: 'GET /api/users',
        getById: 'GET /api/users/:id',
        update: 'PUT /api/users/:id'
      },
      products: {
        list: 'GET /api/products',
        getById: 'GET /api/products/:id',
        onhand: 'GET /api/products/onhand',
        preorder: 'GET /api/products/preorder',
        krComparison: 'GET /api/products/kr-comparison'
      },
      cart: {
        get: 'GET /api/cart',
        add: 'POST /api/cart',
        update: 'PUT /api/cart/:id',
        delete: 'DELETE /api/cart/:id'
      },
      orders: {
        list: 'GET /api/orders',
        getById: 'GET /api/orders/:id',
        create: 'POST /api/orders',
        updateStatus: 'PATCH /api/orders/:id/status'
      },
      payments: {
        qrCode: 'POST /api/payments/qr-code',
        confirm: 'POST /api/payments/confirm',
        get: 'GET /api/payments/:id'
      },
      invoices: {
        list: 'GET /api/invoices',
        getById: 'GET /api/invoices/:id',
        pdf: 'GET /api/invoices/:id/pdf',
        create: 'POST /api/invoices',
        updateStatus: 'PATCH /api/invoices/:id/status'
      },
      boxes: {
        list: 'GET /api/boxes',
        getById: 'GET /api/boxes/:id',
        create: 'POST /api/boxes',
        updateStatus: 'PATCH /api/boxes/:id/status',
        penalty: 'GET /api/boxes/:id/penalty'
      },
      tracking: {
        byNumber: 'GET /api/tracking/:trackingNumber',
        incoming: 'POST /api/tracking/incoming',
        outgoing: 'GET /api/tracking/outgoing'
      },
      shipping: {
        quote: 'POST /api/shipping/quote',
        cbm: 'POST /api/shipping/cbm-calculate'
      },
      documents: {
        upload: 'POST /api/documents/upload',
        list: 'GET /api/documents',
        getById: 'GET /api/documents/:id',
        delete: 'DELETE /api/documents/:id'
      },
      notifications: {
        list: 'GET /api/notifications',
        markRead: 'PATCH /api/notifications/:id/read',
        preferences: 'GET /api/notifications/preferences',
        updatePreferences: 'PATCH /api/notifications/preferences'
      },
      liked: {
        list: 'GET /api/liked',
        add: 'POST /api/liked',
        remove: 'DELETE /api/liked/:productId'
      },
      utility: {
        bankType: 'GET /api/bank-type',
        boxType: 'GET /api/box-type'
      }
    }
  });
});

// Mount routes
router.use('/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/products', productRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/invoices', invoiceRoutes);
router.use('/api/boxes', boxRoutes);
router.use('/api/tracking', trackingRoutes);
router.use('/api/shipping', shippingRoutes);
router.use('/api/documents', documentRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/liked', likedRoutes);
router.use('/api', enumRoutes);

module.exports = router;

