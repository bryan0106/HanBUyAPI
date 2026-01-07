# Frontend Integration Guide

Complete guide for connecting your frontend to the HanBuy API backend.

## 📋 Table of Contents

1. [Setup](#setup)
2. [API Client Configuration](#api-client-configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Service Implementation](#api-service-implementation)
5. [Error Handling](#error-handling)
6. [TypeScript Integration](#typescript-integration)
7. [React/Next.js Examples](#reactnextjs-examples)

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install axios
# or
yarn add axios

# If using TypeScript
npm install @types/node
```

### 2. Environment Variables

Create `.env.local` (or `.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# or for production:
NEXT_PUBLIC_API_URL=https://hanbuyapi.onrender.com/api
```

---

## 🔧 API Client Configuration

### Create API Client (`lib/apiClient.js` or `utils/apiClient.ts`)

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or use your state management
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 Authentication Flow

### 1. Login Service (`services/authService.js`)

```javascript
import apiClient from '@/lib/apiClient';

export const authService = {
  // Login
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    const { data } = response.data;
    
    // Store token and user
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Register
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  async logout() {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
```

### 2. React Hook for Auth (`hooks/useAuth.js`)

```javascript
import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
};
```

---

## 📦 API Service Implementation

### Products Service (`services/productService.js`)

```javascript
import apiClient from '@/lib/apiClient';

export const productService = {
  // Get all products
  async getProducts(filters = {}) {
    const response = await apiClient.get('/products', { params: filters });
    return response.data;
  },

  // Get product by ID
  async getProductById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  },

  // Get onhand products
  async getOnhandProducts(filters = {}) {
    const response = await apiClient.get('/products/onhand', { params: filters });
    return response.data;
  },

  // Get preorder products
  async getPreorderProducts(filters = {}) {
    const response = await apiClient.get('/products/preorder', { params: filters });
    return response.data;
  },

  // Get KR comparison
  async getKRComparison(productId) {
    const response = await apiClient.get('/products/kr-comparison', {
      params: { product_id: productId }
    });
    return response.data.data;
  }
};
```

### Cart Service (`services/cartService.js`)

```javascript
import apiClient from '@/lib/apiClient';

export const cartService = {
  // Get cart items
  async getCart(userId) {
    const response = await apiClient.get('/cart', {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Add to cart
  async addToCart(cartItem) {
    const response = await apiClient.post('/cart', cartItem);
    return response.data;
  },

  // Update cart item
  async updateCartItem(id, updates) {
    const response = await apiClient.put(`/cart/${id}`, updates);
    return response.data;
  },

  // Remove from cart
  async removeFromCart(id) {
    const response = await apiClient.delete(`/cart/${id}`);
    return response.data;
  }
};
```

### Orders Service (`services/orderService.js`)

```javascript
import apiClient from '@/lib/apiClient';

export const orderService = {
  // Get orders
  async getOrders(filters = {}) {
    const response = await apiClient.get('/orders', { params: filters });
    return response.data;
  },

  // Get order by ID
  async getOrderById(id) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.data;
  },

  // Create order
  async createOrder(orderData) {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Update order status (Admin)
  async updateOrderStatus(id, status) {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};
```

### Payments Service (`services/paymentService.js`)

```javascript
import apiClient from '@/lib/apiClient';

export const paymentService = {
  // Generate QR code
  async generateQRCode(orderId, amount, paymentMethod) {
    const response = await apiClient.post('/payments/qr-code', {
      order_id: orderId,
      amount,
      payment_method: paymentMethod
    });
    return response.data.data;
  },

  // Confirm payment
  async confirmPayment(orderId, amount, paymentMethod, proofFile) {
    const formData = new FormData();
    formData.append('order_id', orderId);
    formData.append('amount', amount);
    formData.append('payment_method', JSON.stringify(paymentMethod));
    if (proofFile) {
      formData.append('payment_proof', proofFile);
    }

    const response = await apiClient.post('/payments/confirm', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get payment status
  async getPayment(id) {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data.data;
  }
};
```

---

## ⚠️ Error Handling

### Error Handler Utility (`utils/errorHandler.js`)

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { message: data.error || 'Invalid request', type: 'validation' };
      case 401:
        return { message: 'Unauthorized. Please login again.', type: 'auth' };
      case 403:
        return { message: data.error || 'Access forbidden', type: 'permission' };
      case 404:
        return { message: 'Resource not found', type: 'notFound' };
      case 500:
        return { message: 'Server error. Please try again later.', type: 'server' };
      default:
        return { message: data.error || 'An error occurred', type: 'unknown' };
    }
  } else if (error.request) {
    // Request made but no response
    return { message: 'Network error. Please check your connection.', type: 'network' };
  } else {
    // Something else happened
    return { message: error.message || 'An unexpected error occurred', type: 'unknown' };
  }
};
```

### Usage in Components

```javascript
import { handleApiError } from '@/utils/errorHandler';

try {
  const data = await productService.getProducts();
  // Handle success
} catch (error) {
  const errorInfo = handleApiError(error);
  // Show error to user
  console.error(errorInfo.message);
}
```

---

## 📝 TypeScript Integration

### Use the Provided Types (`types/api.ts`)

```typescript
// Copy API_TYPES.ts from docs/API_TYPES.ts
import type {
  ApiResponse,
  User,
  Product,
  CartItem,
  Order,
  // ... other types
} from '@/types/api';

// Typed API Client
import apiClient from '@/lib/apiClient';

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
      params: filters
    });
    return response.data;
  }
};
```

---

## ⚛️ React/Next.js Examples

### Example: Login Component

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { handleApiError } from '@/utils/errorHandler';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      router.push('/dashboard');
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example: Products List Component

```javascript
'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { handleApiError } from '@/utils/errorHandler';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({
        page: 1,
        limit: 20
      });
      setProducts(response.data);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price} {product.currency}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Complete Service File Template

See `CURSOR_PROMPT.md` for complete implementation guide.

---

## ✅ Testing Checklist

- [ ] API client configured
- [ ] Authentication flow working
- [ ] Token stored and sent with requests
- [ ] Error handling implemented
- [ ] All services created
- [ ] Components using services
- [ ] TypeScript types integrated (if using TS)
- [ ] CORS working
- [ ] File uploads working (if needed)

---

## 🚀 Next Steps

1. Copy the API client setup
2. Create all service files
3. Implement authentication
4. Build components using services
5. Test all endpoints
6. Deploy frontend

---

**Need Help?** Check `CURSOR_PROMPT.md` for AI-assisted implementation.


