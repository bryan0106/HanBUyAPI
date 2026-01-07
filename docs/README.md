# HanBuy API Documentation

Complete API documentation for HanBuy frontend integration.

## 📚 Documentation Files

### [API_REFERENCE.md](./API_REFERENCE.md)
**Complete API Reference** - Full documentation with detailed request/response examples for all 80+ endpoints.

- Includes all endpoints with full request/response examples
- Detailed error handling documentation
- Authentication and authorization details
- Best practices and implementation notes

**Use this for:** Complete implementation details and examples

---

### [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
**Quick Reference Guide** - Fast lookup table for all API endpoints.

- Quick endpoint lookup table
- Route summary with authentication requirements
- Common query parameters
- HTTP status codes

**Use this for:** Quick endpoint lookup during development

---

### [API_TYPES.ts](./API_TYPES.ts)
**TypeScript Type Definitions** - Complete TypeScript types for all API requests and responses.

- Type-safe interfaces for all API entities
- Request/Response types
- Enum types for statuses and roles
- Query parameter types

**Use this for:** Type safety in TypeScript/React projects

---

## 🚀 Quick Start

### For Frontend Developers

1. **Start with** `API_QUICK_REFERENCE.md` to get an overview
2. **Reference** `API_REFERENCE.md` for detailed implementation
3. **Import** `API_TYPES.ts` for TypeScript projects

### Base URL Configuration

```typescript
// Development
const API_BASE_URL = 'http://localhost:3001/api';

// Production
const API_BASE_URL = 'https://api.hanbuy.com/api';
```

### Authentication Example

```typescript
// Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
const token = data.token;

// Use token in subsequent requests
fetch(`${API_BASE_URL}/users`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📋 API Endpoint Summary

### Public Endpoints (15)
- Authentication (4)
- Products (5)
- Utility (3)
- KR Website Integration (3)

### Authenticated Endpoints (40+)
- Users (3)
- Cart (4)
- Orders (4)
- Payments (3)
- Invoices (5)
- Boxes (5)
- Tracking (3)
- Shipping (2)
- Documents (4)
- Notifications (4)
- Liked Items (3)

### Admin Endpoints (25+)
- Dashboard (1)
- Inventory (5)
- Orders (3)
- Invoices (3)
- Boxes (5)
- Clients (4)
- Social Media (3)
- Notifications (2)

**Total: 80+ API routes**

---

## 🔑 Key Features

- ✅ JWT Authentication
- ✅ Role-based Authorization (Admin, Customer, SoloBox Client)
- ✅ Approval Status System
- ✅ Pagination Support
- ✅ Filtering and Search
- ✅ File Upload Support
- ✅ Rate Limiting
- ✅ CORS Configured
- ✅ Comprehensive Error Handling

---

## 📝 Common Patterns

### Pagination
```typescript
interface PaginatedRequest {
  page?: number;    // Default: 1
  limit?: number;    // Default: 20, Max: 100
}
```

### Filtering
```typescript
// Products
GET /api/products?category=electronics&status=active&page=1&limit=20

// Orders
GET /api/orders?user_id=uuid&status=pending&payment_status=paid
```

### Error Handling
```typescript
interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: ErrorCode;
}

// Handle errors
if (!response.success) {
  console.error(response.error);
  // Handle specific error codes
  if (response.code === 'UNAUTHORIZED') {
    // Redirect to login
  }
}
```

---

## 🔐 Authentication Flow

1. **Register/Login** → Get JWT token
2. **Store token** in localStorage/sessionStorage
3. **Include token** in Authorization header for protected routes
4. **Handle 401 errors** → Redirect to login

---

## 📦 Required npm Packages (Frontend)

```bash
# HTTP Client
npm install axios

# Type Safety (if using TypeScript)
npm install typescript @types/node

# Form Handling
npm install react-hook-form yup

# State Management (optional)
npm install @tanstack/react-query
```

---

## 🧪 Testing Endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Products (with token)
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import the API collection (if available)
2. Set base URL variable
3. Create environment with token
4. Test all endpoints

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend CORS is configured for your frontend domain
- Check `ALLOWED_ORIGINS` environment variable

### 401 Unauthorized
- Token expired (24 hour expiry)
- Invalid token format
- Missing Authorization header

### 403 Forbidden
- Insufficient permissions
- Account not approved (for non-admin users)

### 404 Not Found
- Check endpoint URL
- Verify route exists in API_REFERENCE.md

---

## 📞 Support

For API support or questions:
- Email: api-support@hanbuy.com
- Check `API_REFERENCE.md` for detailed examples
- Review error codes in documentation

---

## 📅 Version Information

- **API Version**: 1.0.0
- **Last Updated**: 2024-01-01
- **Documentation Version**: 1.0.0

---

## 🔄 Changelog

### v1.0.0 (2024-01-01)
- Initial API documentation
- 80+ endpoints documented
- TypeScript types provided
- Quick reference guide created

---

**Happy Coding! 🚀**


