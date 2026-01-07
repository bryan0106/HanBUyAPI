# Cursor AI Prompt: Implement HanBuy Frontend API Integration

Use this prompt in Cursor to automatically implement all API integrations for your frontend.

---

## 📋 INSTRUCTION FOR CURSOR AI

**Copy and paste this entire prompt into Cursor:**

```
I need to implement complete frontend API integration for HanBuy e-commerce platform. 
The backend API is already deployed and documented. I need you to:

1. Create a complete API client setup with axios
2. Implement all API service files for all endpoints
3. Create authentication flow with token management
4. Add error handling utilities
5. Create React hooks for common operations
6. Integrate TypeScript types (if using TypeScript)

## Backend API Information:

Base URL: 
- Development: http://localhost:3001/api
- Production: https://hanbuyapi.onrender.com/api

All endpoints require JWT token in Authorization header: "Bearer <token>"

## Complete API Endpoints List:

### Authentication (4 routes)
- POST /api/auth/login - Login user
- POST /api/auth/register - Register new user  
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user

### Users (3 routes)
- GET /api/users - Get users (with filters: role, approval_status, page, limit)
- GET /api/users/:id - Get specific user
- PUT /api/users/:id - Update user

### Products (5 routes)
- GET /api/products - Get all products (filters: category, status, product_type, page, limit, search)
- GET /api/products/:id - Get single product
- GET /api/products/onhand - Get onhand items only
- GET /api/products/preorder - Get preorder items only
- GET /api/products/kr-comparison - Get price comparison (query: product_id)

### Cart (4 routes)
- GET /api/cart?user_id=uuid - Get cart items
- POST /api/cart - Add item to cart (body: user_id, product_id, quantity, box_type_preference)
- PUT /api/cart/:id - Update cart item (body: quantity)
- DELETE /api/cart/:id - Remove item from cart

### Orders (4 routes)
- GET /api/orders - Get orders (filters: user_id, status, payment_status, page, limit)
- GET /api/orders/:id - Get single order
- POST /api/orders - Create new order
- PATCH /api/orders/:id/status - Update order status (Admin only, body: { status })

### Payments (3 routes)
- POST /api/payments/qr-code - Generate QR code (body: order_id, amount, payment_method)
- POST /api/payments/confirm - Confirm payment (multipart/form-data: order_id, amount, payment_method, payment_proof file)
- GET /api/payments/:id - Get payment status

### Invoices (5 routes)
- GET /api/invoices - Get user invoices (filters: status, box_id, page, limit)
- GET /api/invoices/:id - Get single invoice
- GET /api/invoices/:id/pdf - Download invoice PDF
- POST /api/invoices - Create invoice (Admin only)
- PATCH /api/invoices/:id/status - Update invoice status (body: { status })

### Boxes (5 routes)
- GET /api/boxes - Get user boxes (filters: status, page, limit)
- GET /api/boxes/:id - Get single box
- POST /api/boxes - Create new box (body: box_type, items[])
- PATCH /api/boxes/:id/status - Update box status (Admin, body: { status })
- GET /api/boxes/:id/penalty - Get box penalty information

### Tracking (3 routes)
- GET /api/tracking/:trackingNumber - Get tracking info
- POST /api/tracking/incoming - Add incoming package (body: tracking_number, courier, description, estimated_arrival)
- GET /api/tracking/outgoing - Get outgoing packages (filters: status, page, limit)

### Shipping (2 routes)
- POST /api/shipping/quote - Calculate shipping quote (body: weight, cbm, origin, destination, box_type)
- POST /api/shipping/cbm-calculate - Calculate CBM (body: length, width, height, unit)

### Documents (4 routes)
- POST /api/documents/upload - Upload document (multipart/form-data: file, type, description)
- GET /api/documents - Get user documents (filters: type, page, limit)
- GET /api/documents/:id - Get single document
- DELETE /api/documents/:id - Delete document

### Notifications (4 routes)
- GET /api/notifications - Get user notifications (filters: read, type, page, limit)
- PATCH /api/notifications/:id/read - Mark notification as read
- GET /api/notifications/preferences - Get notification preferences
- PATCH /api/notifications/preferences - Update preferences (body: email_notifications, sms_notifications, etc.)

### Liked Items / Wishlist (3 routes)
- GET /api/liked - Get user's liked items (filters: page, limit)
- POST /api/liked - Add item to liked list (body: { product_id })
- DELETE /api/liked/:productId - Remove item from liked list

### Utility Routes (3 routes)
- GET /api/bank-type - Get all bank types
- GET /api/box-type - Get all box types
- GET /health - Health check

## Response Format:

All API responses follow this format:
```json
{
  "success": true|false,
  "data": {},
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

Paginated responses include:
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

## Implementation Requirements:

1. **Create API Client** (`lib/apiClient.js` or `utils/apiClient.ts`):
   - Use axios
   - Set base URL from environment variable (NEXT_PUBLIC_API_URL)
   - Add request interceptor to include JWT token from localStorage
   - Add response interceptor to handle 401 errors (redirect to login)
   - Handle errors consistently

2. **Create Service Files** (in `services/` directory):
   - authService.js - Authentication endpoints
   - userService.js - User management
   - productService.js - Product endpoints
   - cartService.js - Cart operations
   - orderService.js - Order management
   - paymentService.js - Payment operations
   - invoiceService.js - Invoice management
   - boxService.js - Box operations
   - trackingService.js - Tracking operations
   - shippingService.js - Shipping calculations
   - documentService.js - Document uploads
   - notificationService.js - Notifications
   - likedService.js - Wishlist operations
   - utilityService.js - Utility endpoints

3. **Each Service File Should:**
   - Import apiClient
   - Export object with methods for each endpoint
   - Handle request/response properly
   - Return data in consistent format
   - Handle file uploads (multipart/form-data) where needed

4. **Create Error Handler** (`utils/errorHandler.js`):
   - Function to parse API errors
   - Return user-friendly error messages
   - Handle different error types (network, validation, auth, etc.)

5. **Create React Hooks** (if using React, in `hooks/`):
   - useAuth.js - Authentication hook
   - useProducts.js - Products hook with loading/error states
   - useCart.js - Cart management hook
   - useOrders.js - Orders hook

6. **TypeScript Types** (if using TypeScript):
   - Import types from docs/API_TYPES.ts
   - Type all service methods
   - Type all hooks
   - Type all components using services

## File Structure to Create:

```
lib/
  apiClient.js (or .ts)
  
services/
  authService.js
  userService.js
  productService.js
  cartService.js
  orderService.js
  paymentService.js
  invoiceService.js
  boxService.js
  trackingService.js
  shippingService.js
  documentService.js
  notificationService.js
  likedService.js
  utilityService.js

utils/
  errorHandler.js

hooks/ (if React)
  useAuth.js
  useProducts.js
  useCart.js
  useOrders.js

types/ (if TypeScript)
  api.ts (copy from docs/API_TYPES.ts)
```

## Special Requirements:

1. **Authentication:**
   - Store JWT token in localStorage after login
   - Include token in all authenticated requests
   - Clear token on logout or 401 error
   - Redirect to login on authentication failure

2. **File Uploads:**
   - Use FormData for multipart/form-data requests
   - Handle file uploads in paymentService.confirmPayment and documentService.uploadDocument

3. **Pagination:**
   - All list endpoints support page and limit parameters
   - Handle pagination in hooks/components

4. **Error Handling:**
   - Show user-friendly error messages
   - Handle network errors gracefully
   - Log errors for debugging

5. **Loading States:**
   - Implement loading states in hooks
   - Show loading indicators in components

## Example Service Method Pattern:

```javascript
// Example: productService.js
import apiClient from '@/lib/apiClient';

export const productService = {
  async getProducts(filters = {}) {
    try {
      const response = await apiClient.get('/products', { params: filters });
      return response.data; // Returns { success, data, pagination }
    } catch (error) {
      throw error; // Let error handler deal with it
    }
  },
  
  async getProductById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data; // Return just the data object
  }
};
```

## Start Implementation:

Please create all the files listed above with complete implementations for all endpoints. 
Make sure to:
- Handle all query parameters correctly
- Handle request bodies correctly
- Handle file uploads correctly
- Include proper error handling
- Use TypeScript types if TypeScript is being used
- Follow the response format patterns
- Include JWT token in all authenticated requests
- Handle pagination properly

Begin implementation now.
```

---

## 🎯 How to Use This Prompt

1. **Open Cursor AI** in your frontend project
2. **Copy the entire prompt above** (from "I need to implement..." to "Begin implementation now.")
3. **Paste it into Cursor's chat**
4. **Cursor will automatically:**
   - Create all service files
   - Set up API client
   - Implement all endpoints
   - Add error handling
   - Create hooks (if React)
   - Add TypeScript types (if using TS)

---

## 📝 Additional Instructions for Cursor

If you need to refine the implementation, use these follow-up prompts:

### For TypeScript:
```
Convert all service files to TypeScript and use the types from docs/API_TYPES.ts
```

### For React Hooks:
```
Create React hooks for products, cart, orders, and notifications with loading and error states
```

### For Error Handling:
```
Add comprehensive error handling with user-friendly messages and error logging
```

### For File Uploads:
```
Ensure file uploads work correctly with proper FormData handling and progress indicators
```

---

## ✅ Verification Checklist

After Cursor implements everything, verify:

- [ ] All service files created
- [ ] API client configured correctly
- [ ] Token management working
- [ ] All endpoints implemented
- [ ] Error handling in place
- [ ] File uploads working
- [ ] Types integrated (if TS)
- [ ] Hooks created (if React)

---

**Ready to implement? Copy the prompt above and paste it into Cursor!**


