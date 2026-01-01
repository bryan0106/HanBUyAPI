# API Endpoints Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+63 912 345 6789",
  "address": {
    "street": "123 Main St",
    "city": "Manila",
    "province": "Metro Manila",
    "zipCode": "1000",
    "country": "Philippines"
  },
  "role": "customer"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+63 912 345 6789",
    "address": {...},
    "role": "customer",
    "approval_status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Validation:**
- Password must be at least 6 characters
- Email must be unique
- Default role is 'customer'
- Default approval_status is 'pending' (admin is auto-approved)

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+63 912 345 6789",
    "address": {...},
    "role": "customer",
    "approval_status": "approved",
    "client_level": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `401` - Invalid email or password
- `403` - Account pending approval

## User Endpoints

### GET /api/users
Get all users with optional filters.

**Query Parameters:**
- `role` (optional) - Filter by role ('admin', 'customer')
- `approval_status` (optional) - Filter by approval status ('pending', 'approved', 'rejected')

**Example Requests:**
```
GET /api/users
GET /api/users?role=customer
GET /api/users?approval_status=pending
GET /api/users?role=customer&approval_status=approved
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "approval_status": "approved",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Note:** Password hashes are never returned in responses.

### GET /api/users/:id
Get a specific user by ID.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+63 912 345 6789",
    "address": {...},
    "role": "customer",
    "approval_status": "approved",
    "client_level": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/users/:id
Update user information.

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "phone": "+63 999 999 9999",
  "address": {...},
  "role": "customer",
  "approval_status": "approved",
  "client_level": "vip"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Updated Name",
    "role": "customer",
    "approval_status": "approved",
    "updated_at": "2024-01-01T01:00:00Z"
  }
}
```

## Cart Endpoints

### GET /api/cart
Get all cart items for a user.

**Query Parameters:**
- `user_id` (required) - UUID of the user

**Example Request:**
```
GET /api/cart?user_id=123e4567-e89b-12d3-a456-426614174000
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "box_type_preference": "solo",
      "product_name": "Product Name",
      "price": 100.00,
      "currency": "KRW",
      "images": ["url1", "url2"],
      "product_type": "onhand",
      "product_status": "active"
    }
  ],
  "count": 1
}
```

### POST /api/cart
Add item to cart or update quantity if item already exists.

**Request Body:**
```json
{
  "user_id": "uuid",
  "product_id": "uuid",
  "quantity": 2,
  "box_type_preference": "solo"  // optional: "solo" or "shared"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": "uuid",
    "quantity": 2,
    "box_type_preference": "solo",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## Order Endpoints

### POST /api/orders
Create a new order.

**Request Body:**
```json
{
  "user_id": "uuid",
  "order_number": "ORD-2024-001",
  "subtotal": 1000.00,
  "isf": 100.00,
  "lsf": 50.00,
  "shipping_fee": 150.00,
  "solo_shipping_fee": 150.00,
  "shared_shipping_fee": 100.00,
  "total": 1150.00,
  "currency": "PHP",
  "status": "pending",
  "payment_status": "pending",
  "payment_type": "full",
  "payment_method": {
    "type": "qr_code",
    "bank": "GCASH"
  },
  "downpayment_amount": null,
  "balance": null,
  "qr_code": "data:image/png;base64,...",
  "box_type_preference": "solo",
  "shipping_address": {
    "street": "123 Main St",
    "city": "Manila",
    "province": "Metro Manila",
    "zipCode": "1000",
    "country": "Philippines"
  },
  "order_items": [
    {
      "product_id": "uuid",
      "product_name": "Product Name",
      "product_type": "onhand",
      "quantity": 2,
      "unit_price": 500.00,
      "total": 1000.00,
      "image_url": "https://example.com/image.jpg",
      "preorder_release_date": null
    }
  ]
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "order_number": "ORD-2024-001",
    "subtotal": 1000.00,
    "total": 1150.00,
    "status": "pending",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Product Name",
        "quantity": 2,
        "unit_price": 500.00,
        "total": 1000.00
      }
    ],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/orders
Get orders with optional filters.

**Query Parameters:**
- `user_id` (optional) - Filter by user ID
- `status` (optional) - Filter by order status
- `payment_status` (optional) - Filter by payment status

**Example Requests:**
```
GET /api/orders
GET /api/orders?user_id=123e4567-e89b-12d3-a456-426614174000
GET /api/orders?user_id=123e4567-e89b-12d3-a456-426614174000&status=pending
GET /api/orders?user_id=123e4567-e89b-12d3-a456-426614174000&payment_status=paid
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "order_number": "ORD-2024-001",
      "subtotal": 1000.00,
      "total": 1150.00,
      "status": "pending",
      "payment_status": "pending",
      "box_type_preference": "solo",
      "items": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### GET /api/orders/:id
Get a specific order by ID.

**Path Parameters:**
- `id` - Order UUID

**Example Request:**
```
GET /api/orders/123e4567-e89b-12d3-a456-426614174000
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "order_number": "ORD-2024-001",
    "subtotal": 1000.00,
    "total": 1150.00,
    "status": "pending",
    "items": [...],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- All UUID fields should be valid UUIDs
- `box_type_preference` must be either `"solo"` or `"shared"`
- `order_items` must be a non-empty array
- All monetary values should be numbers (not strings)
- `shipping_address` and `payment_method` are JSON objects
- Timestamps are returned in ISO 8601 format

