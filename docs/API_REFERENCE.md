# HanBuy API Reference

Complete API documentation for HanBuy frontend integration.

## Table of Contents

- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [Users](#users)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Payments](#payments)
- [Invoices](#invoices)
- [Boxes](#boxes)
- [Tracking](#tracking)
- [Shipping](#shipping)
- [Documents](#documents)
- [Notifications](#notifications)
- [Liked Items / Wishlist](#liked-items--wishlist)
- [Utility Routes](#utility-routes)
- [Admin Routes](#admin-routes)
- [KR Website Integration](#kr-website-integration)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

---

## Base Configuration

### Base URLs
```
Development: http://localhost:3001/api
Production: https://api.hanbuy.com/api
```

### Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Common Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Response Format
All responses follow this structure:
```json
{
  "success": true|false,
  "data": {},
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

---

## Authentication

### POST /api/auth/login
User login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "customer",
      "approval_status": "approved"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `403` - Account not approved

---

### POST /api/auth/logout
User logout

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me
Get current authenticated user

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+1234567890",
    "address": {},
    "role": "customer",
    "approval_status": "approved",
    "client_level": "standard",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/auth/register
Register new user

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Manila",
    "country": "Philippines"
  },
  "role": "customer"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "customer",
    "approval_status": "pending"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `409` - User already exists

---

## Users

### GET /api/users
Get users (Admin only, with filters)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role` (optional) - Filter by role: `admin`, `customer`, `solobox_client`
- `approval_status` (optional) - Filter by status: `pending`, `approved`, `rejected`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "phone": "+1234567890",
      "role": "customer",
      "approval_status": "approved",
      "client_level": "standard",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### GET /api/users/:id
Get specific user

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+1234567890",
    "address": {},
    "role": "customer",
    "approval_status": "approved",
    "client_level": "standard",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT /api/users/:id
Update user

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Manila"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Products

### GET /api/products
Get all products (with filters)

**Query Parameters:**
- `category` (optional) - Filter by category
- `status` (optional) - Filter by status: `active`, `inactive`, `sold_out`
- `product_type` (optional) - Filter by type: `onhand`, `preorder`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `search` (optional) - Search by name or description

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 1000,
      "currency": "PHP",
      "images": ["url1", "url2"],
      "category": "electronics",
      "product_type": "onhand",
      "status": "active",
      "stock": 10,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### GET /api/products/:id
Get single product

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "price": 1000,
    "currency": "PHP",
    "images": ["url1", "url2"],
    "category": "electronics",
    "product_type": "onhand",
    "status": "active",
    "stock": 10,
    "variations": [],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/products/onhand
Get onhand items only

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `category` (optional)

**Response (200):** Same format as GET /api/products

---

### GET /api/products/preorder
Get preorder items only

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `category` (optional)

**Response (200):** Same format as GET /api/products

---

### GET /api/products/kr-comparison
Get price comparison data

**Query Parameters:**
- `product_id` (required) - Product ID to compare

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product_id": "uuid",
    "hanbuy_price": 1000,
    "comparisons": [
      {
        "website": "Gmarket",
        "price": 1200,
        "currency": "KRW",
        "url": "https://..."
      }
    ]
  }
}
```

---

## Cart

### GET /api/cart?user_id=uuid
Get cart items

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `user_id` (required) - User UUID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "product_name": "Product Name",
      "quantity": 2,
      "unit_price": 1000,
      "total": 2000,
      "box_type_preference": "shared",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 5,
  "total": 10000
}
```

---

### POST /api/cart
Add item to cart

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "uuid",
  "product_id": "uuid",
  "quantity": 2,
  "box_type_preference": "shared"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": "uuid",
    "quantity": 2,
    "box_type_preference": "shared"
  }
}
```

---

### DELETE /api/cart/:id
Remove item from cart

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### PUT /api/cart/:id
Update cart item quantity

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "id": "uuid",
    "quantity": 5
  }
}
```

---

## Orders

### GET /api/orders
Get orders (with filters)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `user_id` (optional) - Filter by user (required for customers)
- `status` (optional) - Filter by status: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- `payment_status` (optional) - Filter by payment: `pending`, `partial`, `paid`, `refunded`
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-2024-001",
      "user_id": "uuid",
      "subtotal": 10000,
      "shipping_fee": 500,
      "total": 10500,
      "currency": "PHP",
      "status": "pending",
      "payment_status": "pending",
      "items": [],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 10
}
```

---

### GET /api/orders/:id
Get single order

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "ORD-2024-001",
    "user_id": "uuid",
    "subtotal": 10000,
    "shipping_fee": 500,
    "total": 10500,
    "currency": "PHP",
    "status": "pending",
    "payment_status": "pending",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Product Name",
        "quantity": 2,
        "unit_price": 5000,
        "total": 10000
      }
    ],
    "shipping_address": {},
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/orders
Create new order

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "uuid",
  "order_number": "ORD-2024-001",
  "subtotal": 10000,
  "isf": 200,
  "lsf": 300,
  "shipping_fee": 500,
  "total": 10500,
  "currency": "PHP",
  "payment_type": "full",
  "box_type_preference": "shared",
  "shipping_address": {
    "street": "123 Main St",
    "city": "Manila",
    "country": "Philippines"
  },
  "order_items": [
    {
      "product_id": "uuid",
      "product_name": "Product Name",
      "quantity": 2,
      "unit_price": 5000,
      "total": 10000
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "order_number": "ORD-2024-001",
    "total": 10500
  }
}
```

---

### PATCH /api/orders/:id/status
Update order status (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "processing"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "uuid",
    "status": "processing"
  }
}
```

---

## Payments

### POST /api/payments/qr-code
Generate QR code for payment

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "order_id": "uuid",
  "amount": 10500,
  "payment_method": {
    "bank_type": "bdo",
    "account_number": "1234567890"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,...",
    "payment_reference": "PAY-2024-001",
    "expires_at": "2024-01-01T01:00:00Z"
  }
}
```

---

### POST /api/payments/confirm
Confirm payment with proof

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
order_id: uuid
amount: 10500
payment_proof: <file>
payment_method: {"bank_type": "bdo"}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmation submitted",
  "data": {
    "payment_id": "uuid",
    "status": "pending_verification"
  }
}
```

---

### GET /api/payments/:id
Get payment status

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_id": "uuid",
    "amount": 10500,
    "status": "verified",
    "payment_method": {},
    "verified_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Invoices

### GET /api/invoices
Get user invoices (with filters)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `paid`, `overdue`
- `box_id` (optional) - Filter by box ID
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-2024-001",
      "box_id": "uuid",
      "total": 15000,
      "status": "pending",
      "due_date": "2024-01-15T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 5
}
```

---

### GET /api/invoices/:id
Get single invoice

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoice_number": "INV-2024-001",
    "box_id": "uuid",
    "items": [],
    "subtotal": 14000,
    "shipping": 1000,
    "total": 15000,
    "status": "pending",
    "due_date": "2024-01-15T00:00:00Z"
  }
}
```

---

### GET /api/invoices/:id/pdf
Download invoice PDF

**Headers:** `Authorization: Bearer <token>`

**Response:** PDF file download

---

### POST /api/invoices
Create invoice (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "box_id": "uuid",
  "items": [
    {
      "description": "Item description",
      "quantity": 1,
      "unit_price": 10000,
      "total": 10000
    }
  ],
  "due_date": "2024-01-15T00:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Invoice created",
  "data": {
    "id": "uuid",
    "invoice_number": "INV-2024-001"
  }
}
```

---

### PATCH /api/invoices/:id/status
Update invoice status

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "paid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invoice status updated",
  "data": {
    "id": "uuid",
    "status": "paid"
  }
}
```

---

## Boxes

### GET /api/boxes
Get user boxes

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional) - Filter by status: `open`, `closed`, `shipped`
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "box_number": "BOX-2024-001",
      "user_id": "uuid",
      "status": "open",
      "total_weight": 5.5,
      "total_cbm": 0.5,
      "items": [],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 3
}
```

---

### GET /api/boxes/:id
Get single box

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "box_number": "BOX-2024-001",
    "user_id": "uuid",
    "status": "open",
    "box_type": "shared",
    "total_weight": 5.5,
    "total_cbm": 0.5,
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "quantity": 2,
        "weight": 1.5
      }
    ],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/boxes
Create new box

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "uuid",
  "box_type": "shared",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Box created successfully",
  "data": {
    "id": "uuid",
    "box_number": "BOX-2024-001"
  }
}
```

---

### PATCH /api/boxes/:id/status
Update box status (Admin)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "closed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Box status updated",
  "data": {
    "id": "uuid",
    "status": "closed"
  }
}
```

---

### GET /api/boxes/:id/penalty
Get box penalty information

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "box_id": "uuid",
    "days_overdue": 15,
    "penalty_rate": 0.05,
    "penalty_amount": 500,
    "total_due": 10500
  }
}
```

---

## Tracking

### GET /api/tracking/:trackingNumber
Get tracking info by tracking number

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tracking_number": "TRACK123456",
    "courier": "DHL",
    "status": "in_transit",
    "events": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "location": "Seoul, South Korea",
        "status": "Picked up",
        "description": "Package picked up from sender"
      }
    ],
    "estimated_delivery": "2024-01-10T00:00:00Z"
  }
}
```

---

### POST /api/tracking/incoming
Add incoming package tracking

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "tracking_number": "TRACK123456",
  "courier": "DHL",
  "description": "Package description",
  "estimated_arrival": "2024-01-10T00:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tracking added",
  "data": {
    "id": "uuid",
    "tracking_number": "TRACK123456"
  }
}
```

---

### GET /api/tracking/outgoing
Get outgoing packages

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tracking_number": "TRACK123456",
      "courier": "DHL",
      "status": "in_transit",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 5
}
```

---

## Shipping

### POST /api/shipping/quote
Calculate shipping quote

**Request Body:**
```json
{
  "weight": 5.5,
  "cbm": 0.5,
  "origin": "KR",
  "destination": "PH",
  "box_type": "shared"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isf": 200,
    "lsf": 300,
    "total_shipping": 500,
    "currency": "PHP",
    "estimated_days": 7
  }
}
```

---

### POST /api/shipping/cbm-calculate
Calculate CBM

**Request Body:**
```json
{
  "length": 30,
  "width": 20,
  "height": 15,
  "unit": "cm"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cbm": 0.009,
    "length": 30,
    "width": 20,
    "height": 15
  }
}
```

---

## Documents

### POST /api/documents/upload
Upload document (multipart/form-data)

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
file: <file>
type: payment_proof|id|invoice|other
description: Optional description
```

**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded",
  "data": {
    "id": "uuid",
    "filename": "document.pdf",
    "url": "https://...",
    "type": "payment_proof",
    "size": 1024000
  }
}
```

---

### GET /api/documents
Get user documents (with filter)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional) - Filter by type
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "document.pdf",
      "url": "https://...",
      "type": "payment_proof",
      "size": 1024000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 5
}
```

---

### GET /api/documents/:id
Get single document

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "document.pdf",
    "url": "https://...",
    "type": "payment_proof",
    "size": 1024000,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### DELETE /api/documents/:id
Delete document

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

---

## Notifications

### GET /api/notifications
Get user notifications (with filters)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `read` (optional) - Filter by read status: `true`, `false`
- `type` (optional) - Filter by type: `order`, `payment`, `box`, `system`
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "order",
      "title": "Order Status Update",
      "message": "Your order has been shipped",
      "read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "unread_count": 5
}
```

---

### PATCH /api/notifications/:id/read
Mark notification as read

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "uuid",
    "read": true
  }
}
```

---

### GET /api/notifications/preferences
Get notification preferences

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "order_updates": true,
    "payment_updates": true,
    "box_updates": true
  }
}
```

---

### PATCH /api/notifications/preferences
Update notification preferences

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email_notifications": true,
  "sms_notifications": false,
  "push_notifications": true,
  "order_updates": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Preferences updated",
  "data": {
    "email_notifications": true,
    "sms_notifications": false
  }
}
```

---

## Liked Items / Wishlist

### GET /api/liked
Get user's liked items

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Product Name",
        "price": 1000,
        "images": ["url1"]
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 10
}
```

---

### POST /api/liked
Add item to liked list

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "product_id": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to liked list",
  "data": {
    "id": "uuid",
    "product_id": "uuid"
  }
}
```

---

### DELETE /api/liked/:productId
Remove item from liked list

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from liked list"
}
```

---

## Utility Routes

### GET /api/bank-type
Get all bank types

**Response (200):**
```json
{
  "success": true,
  "data": [
    "bdo",
    "bpi",
    "metrobank",
    "gcash",
    "paymaya"
  ]
}
```

---

### GET /api/box-type
Get all box types

**Response (200):**
```json
{
  "success": true,
  "data": [
    "solo",
    "shared"
  ]
}
```

---

### GET /api/health
Health check

**Response (200):**
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Admin Routes

All admin routes require `role: "admin"` in the JWT token.

### Dashboard

#### GET /api/admin/dashboard/stats
Get dashboard statistics

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": 1000,
    "total_orders": 500,
    "total_revenue": 1000000,
    "pending_approvals": 10,
    "pending_orders": 25,
    "recent_orders": []
  }
}
```

---

### Inventory Management

#### GET /api/admin/inventory
Get all inventory items

**Query Parameters:**
- `status` (optional)
- `category` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "stock": 10,
      "status": "active",
      "category": "electronics"
    }
  ]
}
```

---

#### POST /api/admin/inventory
Create inventory item

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Description",
  "price": 1000,
  "stock": 10,
  "category": "electronics"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inventory item created",
  "data": {
    "id": "uuid",
    "name": "Product Name"
  }
}
```

---

#### PATCH /api/admin/inventory/:id
Update inventory item

**Request Body:**
```json
{
  "stock": 20,
  "price": 1200
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory item updated",
  "data": {
    "id": "uuid",
    "stock": 20
  }
}
```

---

#### DELETE /api/admin/inventory/:id
Delete inventory item

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory item deleted"
}
```

---

#### GET /api/admin/inventory/alerts
Get stock alerts

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "uuid",
      "name": "Product Name",
      "current_stock": 2,
      "min_stock": 10,
      "status": "low_stock"
    }
  ]
}
```

---

### Order Management

#### GET /api/admin/orders
Get all orders

**Query Parameters:**
- `status` (optional)
- `payment_status` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):** Same format as GET /api/orders

---

#### GET /api/admin/orders/:id
Get single order

**Response (200):** Same format as GET /api/orders/:id

---

#### PATCH /api/admin/orders/:id/status
Update order status

**Request Body:**
```json
{
  "status": "processing"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "uuid",
    "status": "processing"
  }
}
```

---

### Invoice Management

#### GET /api/admin/invoices
Get all invoices

**Query Parameters:**
- `status` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):** Same format as GET /api/invoices

---

#### POST /api/admin/invoices/auto-generate
Auto-generate invoices

**Request Body:**
```json
{
  "box_ids": ["uuid1", "uuid2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invoices generated",
  "data": {
    "generated_count": 2,
    "invoice_ids": ["uuid1", "uuid2"]
  }
}
```

---

#### POST /api/admin/invoices/:id/send-reminder
Send payment reminder

**Response (200):**
```json
{
  "success": true,
  "message": "Payment reminder sent"
}
```

---

### Box Management

#### GET /api/admin/boxes
Get all boxes

**Query Parameters:**
- `status` (optional)
- `user_id` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):** Same format as GET /api/boxes

---

#### GET /api/admin/boxes/closed
Get closed boxes

**Response (200):** Same format as GET /api/admin/boxes

---

#### POST /api/admin/boxes/:id/close
Close box

**Response (200):**
```json
{
  "success": true,
  "message": "Box closed",
  "data": {
    "id": "uuid",
    "status": "closed"
  }
}
```

---

#### GET /api/admin/boxes/penalties
Get boxes with penalties

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "box_id": "uuid",
      "box_number": "BOX-2024-001",
      "days_overdue": 15,
      "penalty_amount": 500
    }
  ]
}
```

---

#### POST /api/admin/boxes/:id/calculate-penalty
Calculate box penalty

**Response (200):**
```json
{
  "success": true,
  "data": {
    "box_id": "uuid",
    "penalty_amount": 500,
    "days_overdue": 15
  }
}
```

---

### Client Management

#### GET /api/admin/clients
Get all clients

**Query Parameters:**
- `approval_status` (optional)
- `role` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "client@example.com",
      "name": "Client Name",
      "role": "customer",
      "approval_status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET /api/admin/clients/:id
Get single client

**Response (200):** Same format as GET /api/users/:id

---

#### POST /api/admin/clients/:id/approve
Approve client

**Response (200):**
```json
{
  "success": true,
  "message": "Client approved",
  "data": {
    "id": "uuid",
    "approval_status": "approved"
  }
}
```

---

#### POST /api/admin/clients/:id/reject
Reject client

**Request Body:**
```json
{
  "reason": "Optional rejection reason"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client rejected",
  "data": {
    "id": "uuid",
    "approval_status": "rejected"
  }
}
```

---

### Social Media

#### GET /api/admin/social/posts
Get social media posts

**Query Parameters:**
- `status` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "content": "Post content",
      "platform": "facebook",
      "status": "draft",
      "scheduled_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /api/admin/social/posts
Create social media post

**Request Body:**
```json
{
  "title": "Post Title",
  "content": "Post content",
  "platform": "facebook",
  "scheduled_at": "2024-01-01T00:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post created",
  "data": {
    "id": "uuid",
    "title": "Post Title"
  }
}
```

---

#### POST /api/admin/social/posts/:id/publish
Publish post

**Response (200):**
```json
{
  "success": true,
  "message": "Post published",
  "data": {
    "id": "uuid",
    "status": "published"
  }
}
```

---

### Notifications

#### GET /api/admin/notifications
Get notifications

**Query Parameters:**
- `type` (optional)
- `page` (optional)
- `limit` (optional)

**Response (200):** Same format as GET /api/notifications

---

#### POST /api/admin/notifications/send
Send notification

**Request Body:**
```json
{
  "user_id": "uuid",
  "type": "system",
  "title": "Notification Title",
  "message": "Notification message"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification sent",
  "data": {
    "id": "uuid"
  }
}
```

---

## KR Website Integration

### GET /api/kr-websites/compare/:itemId
Get price comparison

**Response (200):**
```json
{
  "success": true,
  "data": {
    "item_id": "uuid",
    "hanbuy_price": 1000,
    "comparisons": [
      {
        "website": "Gmarket",
        "price": 1200,
        "currency": "KRW",
        "url": "https://..."
      }
    ]
  }
}
```

---

### POST /api/kr-websites/crawl
Crawl KR website data (Admin only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "url": "https://gmarket.co.kr/product/123",
  "website": "gmarket"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Data crawled successfully",
  "data": {
    "product_name": "Product Name",
    "price": 1200,
    "currency": "KRW"
  }
}
```

---

### GET /api/kr-websites/sale-alerts
Get sale alerts

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_name": "Product Name",
      "original_price": 1500,
      "sale_price": 1000,
      "discount_percent": 33,
      "website": "Gmarket",
      "url": "https://..."
    }
  ]
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Resource already exists
- `DATABASE_ERROR` - Database operation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed description",
  "code": "ERROR_CODE"
}
```

---

## Rate Limiting

All endpoints are rate-limited:
- **Authenticated users**: 100 requests per minute
- **Unauthenticated users**: 20 requests per minute
- **Admin users**: 200 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Notes

1. **UUID Format**: All IDs are UUIDs (v4)
2. **Date Format**: ISO 8601 (UTC) - `2024-01-01T00:00:00Z`
3. **Currency**: Support PHP and KRW
4. **Pagination**: Default page size is 20, max is 100
5. **File Uploads**: Max file size is 10MB
6. **Authentication**: JWT tokens expire after 24 hours
7. **CORS**: Configured for frontend domains
8. **Approval Status**: Non-admin users must be approved to access protected features

---

## Support

For API support, contact: api-support@hanbuy.com

---

**Last Updated**: 2024-01-01
**API Version**: 1.0.0


