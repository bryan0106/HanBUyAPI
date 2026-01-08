# Quick Cursor Prompt for Next.js Frontend Setup

## 🚀 Copy This Prompt Into Cursor

```
I need to set up complete API integration for my Next.js frontend to connect to the HanBuy API backend.

## Backend API Details:
- Development URL: http://localhost:3001/api
- Production URL: https://hanbuyapi.onrender.com/api
- CORS is configured to allow localhost on all ports (works in all environments)
- All endpoints require JWT token: "Bearer <token>"

## What I Need:

1. **Create API Client** (`lib/apiClient.ts` or `lib/apiClient.js`):
   - Use axios
   - Base URL from `NEXT_PUBLIC_API_URL` env variable
   - Request interceptor: Add JWT token from localStorage to Authorization header
   - Response interceptor: Handle 401 errors (clear token, redirect to login)
   - Handle errors consistently

2. **Create Environment File** (`.env.local`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **Create All Service Files** in `services/` directory:
   - authService - login, register, logout, getMe
   - productService - getProducts, getProductById, getOnhandProducts, getPreorderProducts, getKRComparison
   - cartService - getCart, addToCart, updateCartItem, removeFromCart
   - orderService - getOrders, getOrderById, createOrder, updateOrderStatus
   - paymentService - generateQRCode, confirmPayment (with file upload), getPayment
   - invoiceService - getInvoices, getInvoiceById, getInvoicePDF, createInvoice, updateInvoiceStatus
   - boxService - getBoxes, getBoxById, createBox, updateBoxStatus, getBoxPenalty
   - trackingService - getTracking, addIncomingPackage, getOutgoingPackages
   - shippingService - getShippingQuote, calculateCBM
   - documentService - uploadDocument (file upload), getDocuments, getDocumentById, deleteDocument
   - notificationService - getNotifications, markAsRead, getPreferences, updatePreferences
   - likedService - getLikedItems, addToLiked, removeFromLiked
   - userService - getUsers, getUserById, updateUser
   - utilityService - getBankTypes, getBoxTypes

4. **Create Error Handler** (`utils/errorHandler.ts` or `.js`):
   - Parse API errors
   - Return user-friendly messages
   - Handle network, validation, auth errors

5. **Create React Hooks** (in `hooks/` if using React):
   - useAuth - authentication state and methods
   - useProducts - products with loading/error states
   - useCart - cart management
   - useOrders - orders management

6. **API Response Format:**
   ```json
   {
     "success": true|false,
     "data": {},
     "message": "Optional message",
     "error": "Error message if success is false",
     "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
   }
   ```

7. **Special Requirements:**
   - File uploads: Use FormData for multipart/form-data (payment proof, documents)
   - Pagination: Handle page and limit parameters
   - Authentication: Store token in localStorage, include in all requests
   - TypeScript: Use types from API if available

## Implementation Pattern:

Each service should follow this pattern:
```typescript
import apiClient from '@/lib/apiClient';

export const productService = {
  async getProducts(filters = {}) {
    const response = await apiClient.get('/products', { params: filters });
    return response.data; // Returns { success, data, pagination }
  },
  
  async getProductById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data; // Return just the data object
  }
};
```

## File Structure to Create:
```
lib/
  apiClient.ts (or .js)

services/
  authService.ts
  productService.ts
  cartService.ts
  orderService.ts
  paymentService.ts
  invoiceService.ts
  boxService.ts
  trackingService.ts
  shippingService.ts
  documentService.ts
  notificationService.ts
  likedService.ts
  userService.ts
  utilityService.ts

utils/
  errorHandler.ts

hooks/ (if React)
  useAuth.ts
  useProducts.ts
  useCart.ts
  useOrders.ts
```

Please create all these files with complete implementations. Make sure to:
- Handle all query parameters correctly
- Handle request bodies correctly  
- Handle file uploads with FormData
- Include proper error handling
- Use TypeScript types if TypeScript is detected
- Include JWT token in all authenticated requests
- Handle pagination properly

Start implementation now.
```

---

## 📝 How to Use

1. **Copy the prompt above** (from "I need to set up..." to "Start implementation now.")
2. **Open Cursor** in your Next.js frontend project
3. **Paste the prompt** into Cursor's chat
4. **Cursor will automatically create** all the files and implementations

---

## ✅ After Implementation

1. **Create `.env.local`** file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Install axios** (if not already installed):
   ```bash
   npm install axios
   ```

3. **Test the setup**:
   ```typescript
   import { authService } from '@/services/authService';
   
   // Test login
   await authService.login('test@example.com', 'password');
   ```

---

## 🔧 Additional Notes

- **CORS is fixed**: localhost now works in all environments (dev, staging, production mode)
- **Token management**: Automatically handled by apiClient interceptors
- **Error handling**: Built into all services
- **File uploads**: Use FormData for payment proof and document uploads

---

**Ready? Copy the prompt and paste it into Cursor!** 🚀
