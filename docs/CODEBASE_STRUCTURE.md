# HanBuy Backend Codebase Structure

## 📍 Current File Locations

### ✅ IMPLEMENTED FILES

#### Controllers (`/controllers/`)
```
controllers/
├── authController.js      ✅ Contains: register, login
├── cartController.js      ✅ Contains: getCart, addToCart
├── healthController.js    ✅ Contains: health check
├── orderController.js     ✅ Contains: createOrder, getOrders, getOrderById
└── userController.js      ✅ Contains: getUsers, createUser, getBankType, getBoxType
```

#### Routes (`/routes/`)
```
routes/
├── authRoutes.js          ✅ POST /api/auth/register, POST /api/auth/login
├── cartRoutes.js          ✅ GET /api/cart, POST /api/cart
├── enumRoutes.js          ✅ GET /api/bank-type, GET /api/box-type
├── healthRoutes.js        ✅ GET /health
├── orderRoutes.js         ✅ GET /api/orders, GET /api/orders/:id, POST /api/orders
├── index.js               ✅ Route aggregator (mounts all routes)
└── userRoutes.js          ✅ GET /api/users, POST /api/users
```

#### Database (`/database/`)
```
database/
├── schema.sql             ✅ Tables: users, products, cart_items, orders, order_items
├── setup.sql              ✅ Database setup
├── seed_test_users.sql    ✅ Test data
└── add_user_auth_columns.sql ✅ User auth columns
```

#### Middleware (`/middleware/`)
```
middleware/
├── cors.js                ✅ CORS configuration
└── errorHandler.js         ✅ Error handling middleware
```

#### Config (`/config/`)
```
config/
└── database.js            ✅ Database configuration
```

#### Main Entry Point
```
index.js                   ✅ Express app setup, mounts routes
```

---

## ❌ MISSING FILES (Need to be Created)

### Controllers (Missing)
```
controllers/
├── productController.js      ❌ MISSING - Products API
├── paymentController.js      ❌ MISSING - Payments API
├── invoiceController.js       ❌ MISSING - Invoices API
├── boxController.js          ❌ MISSING - Boxes API
├── trackingController.js      ❌ MISSING - Tracking API
├── shippingController.js     ❌ MISSING - Shipping API
├── documentController.js     ❌ MISSING - Documents API
├── notificationController.js ❌ MISSING - Notifications API
├── likedController.js        ❌ MISSING - Liked Items API
└── adminController.js        ❌ MISSING - Admin API
```

### Routes (Missing)
```
routes/
├── productRoutes.js          ❌ MISSING - Products routes
├── paymentRoutes.js          ❌ MISSING - Payments routes
├── invoiceRoutes.js          ❌ MISSING - Invoices routes
├── boxRoutes.js              ❌ MISSING - Boxes routes
├── trackingRoutes.js         ❌ MISSING - Tracking routes
├── shippingRoutes.js         ❌ MISSING - Shipping routes
├── documentRoutes.js         ❌ MISSING - Documents routes
├── notificationRoutes.js     ❌ MISSING - Notifications routes
├── likedRoutes.js            ❌ MISSING - Liked Items routes
└── adminRoutes.js            ❌ MISSING - Admin routes
```

### Middleware (Missing)
```
middleware/
├── auth.js                   ❌ MISSING - JWT authentication
├── authorize.js              ❌ MISSING - Role-based authorization
├── validate.js               ❌ MISSING - Request validation
└── upload.js                 ❌ MISSING - File upload (multer)
```

### Database Schema (Missing Tables)
```
database/schema.sql needs:
├── boxes                     ❌ MISSING TABLE
├── box_items                 ❌ MISSING TABLE
├── invoices                  ❌ MISSING TABLE
├── invoice_items             ❌ MISSING TABLE
├── tracking_events           ❌ MISSING TABLE
├── couriers                  ❌ MISSING TABLE
├── notifications             ❌ MISSING TABLE
├── payment_history           ❌ MISSING TABLE
├── liked_items               ❌ MISSING TABLE
├── documents                 ❌ MISSING TABLE
└── notification_preferences  ❌ MISSING TABLE
```

---

## 🔗 Current Route Mapping

### Base URL Structure
```
Development: http://localhost:3001
Production: https://api.hanbuy.com
```

### Implemented Routes (Current)
```
GET  /                           ✅ Root endpoint (lists available routes)
GET  /health                     ✅ Health check

POST /api/auth/register           ✅ User registration
POST /api/auth/login              ✅ User login

GET  /api/users                   ✅ Get users (with filters)
POST /api/users                   ✅ Create user

GET  /api/bank-type               ✅ Get bank types enum
GET  /api/box-type                ✅ Get box types enum

GET  /api/cart?user_id=uuid       ✅ Get cart items
POST /api/cart                    ✅ Add to cart

GET  /api/orders                  ✅ Get orders (with filters)
GET  /api/orders/:id              ✅ Get single order
POST /api/orders                  ✅ Create order
```

### Missing Routes (Not Implemented)
```
# Authentication
POST /api/auth/logout             ❌
GET  /api/auth/me                 ❌

# Users
GET  /api/users/:id                ❌
PUT  /api/users/:id                ❌

# Products (ALL MISSING)
GET  /api/products                ❌
GET  /api/products/:id             ❌
GET  /api/products/onhand          ❌
GET  /api/products/preorder        ❌
GET  /api/products/kr-comparison   ❌

# Cart
DELETE /api/cart/:id              ❌
PUT  /api/cart/:id                ❌

# Orders
PATCH /api/orders/:id/status      ❌

# Payments (ALL MISSING)
POST /api/payments/qr-code        ❌
POST /api/payments/confirm        ❌
GET  /api/payments/:id            ❌

# Invoices (ALL MISSING)
GET  /api/invoices                ❌
GET  /api/invoices/:id            ❌
GET  /api/invoices/:id/pdf        ❌
POST /api/invoices                ❌
PATCH /api/invoices/:id/status   ❌

# Boxes (ALL MISSING)
GET  /api/boxes                   ❌
GET  /api/boxes/:id               ❌
POST /api/boxes                   ❌
PATCH /api/boxes/:id/status       ❌
GET  /api/boxes/:id/penalty       ❌

# Tracking (ALL MISSING)
GET  /api/tracking/:trackingNumber ❌
POST /api/tracking/incoming       ❌
GET  /api/tracking/outgoing        ❌

# Shipping (ALL MISSING)
POST /api/shipping/quote           ❌
POST /api/shipping/cbm-calculate  ❌

# Documents (ALL MISSING)
POST /api/documents/upload         ❌
GET  /api/documents                ❌
GET  /api/documents/:id            ❌
DELETE /api/documents/:id          ❌

# Notifications (ALL MISSING)
GET  /api/notifications            ❌
PATCH /api/notifications/:id/read  ❌
GET  /api/notifications/preferences ❌
PATCH /api/notifications/preferences ❌

# Liked Items (ALL MISSING)
GET  /api/liked                    ❌
POST /api/liked                    ❌
DELETE /api/liked/:productId      ❌

# Admin Routes (ALL MISSING - 25+ routes)
GET  /api/admin/dashboard/stats    ❌
GET  /api/admin/inventory          ❌
... (and 24+ more admin routes)

# KR Website Integration (ALL MISSING)
GET  /api/kr-websites/compare/:itemId ❌
POST /api/kr-websites/crawl       ❌
GET  /api/kr-websites/sale-alerts  ❌
```

---

## 📊 Implementation Summary

### Current Status
- **Total Routes Documented:** 80+
- **Routes Implemented:** ~15
- **Routes Missing:** ~65+
- **Completion:** ~19%

### By Category
| Category | Status | Count |
|----------|--------|-------|
| ✅ Implemented | Partial | ~15 routes |
| ❌ Missing | Not Started | ~65+ routes |

---

## 🚀 How Routes Are Mounted

### Current Setup (`routes/index.js`)
```javascript
router.use('/health', healthRoutes);        // GET /health
router.use('/api/auth', authRoutes);        // POST /api/auth/register, /login
router.use('/api/users', userRoutes);       // GET, POST /api/users
router.use('/api', enumRoutes);             // GET /api/bank-type, /box-type
router.use('/api/cart', cartRoutes);        // GET, POST /api/cart
router.use('/api/orders', orderRoutes);     // GET, POST /api/orders
```

### What Needs to Be Added
```javascript
// Missing route mounts:
router.use('/api/products', productRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/invoices', invoiceRoutes);
router.use('/api/boxes', boxRoutes);
router.use('/api/tracking', trackingRoutes);
router.use('/api/shipping', shippingRoutes);
router.use('/api/documents', documentRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/liked', likedRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/kr-websites', krWebsiteRoutes);
```

---

## 🔐 Authentication & Authorization

### Current Status
- ❌ **JWT Authentication** - NOT IMPLEMENTED
- ❌ **Token Generation** - NOT IMPLEMENTED
- ❌ **Token Verification** - NOT IMPLEMENTED
- ❌ **Role-based Authorization** - NOT IMPLEMENTED
- ❌ **Protected Route Middleware** - NOT IMPLEMENTED

### What's Needed
```javascript
// middleware/auth.js - NEEDS TO BE CREATED
- verifyToken() - Verify JWT token
- requireAuth() - Require authentication
- requireRole() - Require specific role (admin, customer, etc.)
```

---

## 📝 Next Steps to Complete Implementation

1. **Create Missing Database Tables**
   - Add to `database/schema.sql`
   - Run migrations

2. **Create Missing Controllers**
   - Create all controller files in `/controllers/`
   - Implement all CRUD operations

3. **Create Missing Routes**
   - Create all route files in `/routes/`
   - Connect to controllers

4. **Add Authentication Middleware**
   - Create `middleware/auth.js`
   - Implement JWT verification
   - Add to protected routes

5. **Update Route Aggregator**
   - Add all new routes to `routes/index.js`

6. **Add File Upload Support**
   - Install multer
   - Create upload middleware
   - Add to document routes

7. **Add Request Validation**
   - Install express-validator
   - Create validation middleware
   - Add to all routes

8. **Test All Endpoints**
   - Test each route
   - Verify error handling
   - Check authentication/authorization

---

## 📚 Documentation Files

All documentation is in `/docs/` folder:
- `API_REFERENCE.md` - Complete API documentation
- `API_QUICK_REFERENCE.md` - Quick lookup table
- `API_TYPES.ts` - TypeScript types
- `IMPLEMENTATION_STATUS.md` - Detailed status
- `CODEBASE_STRUCTURE.md` - This file

---

**Last Updated:** 2024-01-01


