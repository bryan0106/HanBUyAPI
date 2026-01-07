# HanBuy API Quick Reference

Quick lookup guide for all API endpoints.

## Base URLs
```
Development: http://localhost:3001/api
Production: https://api.hanbuy.com/api
```

---

## 🔐 Authentication (4 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | User login |
| POST | `/api/auth/logout` | ✅ | User logout |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/register` | ❌ | Register new user |

---

## 👥 Users (3 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | ✅ Admin | Get users (with filters) |
| GET | `/api/users/:id` | ✅ | Get specific user |
| PUT | `/api/users/:id` | ✅ | Update user |

**Query Params:** `role`, `approval_status`, `page`, `limit`

---

## 📦 Products (5 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | Get all products |
| GET | `/api/products/:id` | ❌ | Get single product |
| GET | `/api/products/onhand` | ❌ | Get onhand items only |
| GET | `/api/products/preorder` | ❌ | Get preorder items only |
| GET | `/api/products/kr-comparison` | ❌ | Get price comparison |

**Query Params:** `category`, `status`, `product_type`, `page`, `limit`, `search`

---

## 🛒 Cart (4 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart?user_id=uuid` | ✅ | Get cart items |
| POST | `/api/cart` | ✅ | Add item to cart |
| DELETE | `/api/cart/:id` | ✅ | Remove item from cart |
| PUT | `/api/cart/:id` | ✅ | Update cart item quantity |

---

## 📋 Orders (4 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | ✅ | Get orders |
| GET | `/api/orders/:id` | ✅ | Get single order |
| POST | `/api/orders` | ✅ | Create new order |
| PATCH | `/api/orders/:id/status` | ✅ Admin | Update order status |

**Query Params:** `user_id`, `status`, `payment_status`, `page`, `limit`

---

## 💳 Payments (3 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/qr-code` | ✅ | Generate QR code |
| POST | `/api/payments/confirm` | ✅ | Confirm payment with proof |
| GET | `/api/payments/:id` | ✅ | Get payment status |

---

## 🧾 Invoices (5 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/invoices` | ✅ | Get user invoices |
| GET | `/api/invoices/:id` | ✅ | Get single invoice |
| GET | `/api/invoices/:id/pdf` | ✅ | Download invoice PDF |
| POST | `/api/invoices` | ✅ Admin | Create invoice |
| PATCH | `/api/invoices/:id/status` | ✅ | Update invoice status |

**Query Params:** `status`, `box_id`, `page`, `limit`

---

## 📦 Boxes (5 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/boxes` | ✅ | Get user boxes |
| GET | `/api/boxes/:id` | ✅ | Get single box |
| POST | `/api/boxes` | ✅ | Create new box |
| PATCH | `/api/boxes/:id/status` | ✅ Admin | Update box status |
| GET | `/api/boxes/:id/penalty` | ✅ | Get box penalty info |

**Query Params:** `status`, `page`, `limit`

---

## 🚚 Tracking (3 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tracking/:trackingNumber` | ❌ | Get tracking info |
| POST | `/api/tracking/incoming` | ✅ | Add incoming package |
| GET | `/api/tracking/outgoing` | ✅ | Get outgoing packages |

---

## 📮 Shipping (2 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/shipping/quote` | ❌ | Calculate shipping quote |
| POST | `/api/shipping/cbm-calculate` | ❌ | Calculate CBM |

---

## 📄 Documents (4 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/documents/upload` | ✅ | Upload document |
| GET | `/api/documents` | ✅ | Get user documents |
| GET | `/api/documents/:id` | ✅ | Get single document |
| DELETE | `/api/documents/:id` | ✅ | Delete document |

**Query Params:** `type`, `page`, `limit`

---

## 🔔 Notifications (4 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | Get user notifications |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark as read |
| GET | `/api/notifications/preferences` | ✅ | Get preferences |
| PATCH | `/api/notifications/preferences` | ✅ | Update preferences |

**Query Params:** `read`, `type`, `page`, `limit`

---

## ❤️ Liked Items (3 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/liked` | ✅ | Get user's liked items |
| POST | `/api/liked` | ✅ | Add item to liked list |
| DELETE | `/api/liked/:productId` | ✅ | Remove from liked list |

---

## 🔧 Utility Routes (3 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bank-type` | ❌ | Get all bank types |
| GET | `/api/box-type` | ❌ | Get all box types |
| GET | `/api/health` | ❌ | Health check |

---

## 👨‍💼 Admin Routes

### Dashboard
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### Inventory (5 routes)
- `GET /api/admin/inventory` - Get all inventory
- `POST /api/admin/inventory` - Create inventory item
- `PATCH /api/admin/inventory/:id` - Update inventory
- `DELETE /api/admin/inventory/:id` - Delete inventory
- `GET /api/admin/inventory/alerts` - Stock alerts

### Orders (3 routes)
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get single order
- `PATCH /api/admin/orders/:id/status` - Update order status

### Invoices (3 routes)
- `GET /api/admin/invoices` - Get all invoices
- `POST /api/admin/invoices/auto-generate` - Auto-generate invoices
- `POST /api/admin/invoices/:id/send-reminder` - Send reminder

### Boxes (5 routes)
- `GET /api/admin/boxes` - Get all boxes
- `GET /api/admin/boxes/closed` - Get closed boxes
- `POST /api/admin/boxes/:id/close` - Close box
- `GET /api/admin/boxes/penalties` - Get boxes with penalties
- `POST /api/admin/boxes/:id/calculate-penalty` - Calculate penalty

### Clients (4 routes)
- `GET /api/admin/clients` - Get all clients
- `GET /api/admin/clients/:id` - Get single client
- `POST /api/admin/clients/:id/approve` - Approve client
- `POST /api/admin/clients/:id/reject` - Reject client

### Social Media (3 routes)
- `GET /api/admin/social/posts` - Get posts
- `POST /api/admin/social/posts` - Create post
- `POST /api/admin/social/posts/:id/publish` - Publish post

### Notifications (2 routes)
- `GET /api/admin/notifications` - Get notifications
- `POST /api/admin/notifications/send` - Send notification

---

## 🌐 KR Website Integration (3 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/kr-websites/compare/:itemId` | ❌ | Get price comparison |
| POST | `/api/kr-websites/crawl` | ✅ Admin | Crawl KR website |
| GET | `/api/kr-websites/sale-alerts` | ❌ | Get sale alerts |

---

## 📊 Route Summary

- **Public Routes**: 15 routes
- **Authenticated Routes**: 40+ routes
- **Admin Routes**: 25+ routes
- **Total**: **80+ API routes**

---

## 🔑 Common Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by status
- `type` - Filter by type
- `search` - Search query
- `sort` - Sort field
- `order` - Sort order (`asc` or `desc`)

---

## 📝 Common Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

---

## ✅ Response Format

**Success:**
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🚨 HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Server Error

---

## 📚 Full Documentation

See `API_REFERENCE.md` for complete documentation with request/response examples.


