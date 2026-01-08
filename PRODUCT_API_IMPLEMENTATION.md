# Product API & Display Optimization - Implementation Guide

## Overview

This document describes the implementation of the unified Product API with advanced filtering, pagination, sorting, and store/warehouse support.

## Database Schema Updates

### New Tables

1. **stores** - Stores/warehouses information
   - `id` (UUID)
   - `name` (VARCHAR)
   - `location` (VARCHAR)
   - `country` (VARCHAR)
   - `is_active` (BOOLEAN)

2. **product_stores** - Junction table linking products to stores
   - `product_id` (UUID) - References products
   - `store_id` (UUID) - References stores
   - `stock` (INTEGER)
   - `reserved_stock` (INTEGER)
   - `min_threshold` (INTEGER)
   - `is_available` (BOOLEAN)

### Updated Products Table

New columns added:
- `reserved_stock` (INTEGER) - Reserved inventory
- `min_threshold` (INTEGER) - Minimum stock threshold
- `order_deadline` (TIMESTAMP) - Preorder deadline
- `release_date` (TIMESTAMP) - Preorder release date
- `expected_delivery` (TIMESTAMP) - Expected delivery date
- `php_price` (DECIMAL) - Pre-calculated PHP price
- `price_conversion_rate` (DECIMAL) - KRW to PHP conversion rate
- `tags` (TEXT[]) - Product tags array
- `full_description` (TEXT) - Full HTML description
- `specifications` (JSONB) - Product specifications

### Updated product_variations Table

New columns:
- `type` (VARCHAR) - Variation type (size, color, etc.)
- `sku` (VARCHAR) - Variation SKU
- `image_url` (TEXT) - Variation image

## API Endpoints

### 1. Unified Products Endpoint

**GET** `/api/products`

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `product_type` | string | `onhand`, `preorder`, `kr_website`, or `all` | `all` |
| `status` | string | `active`, `inactive`, `out_of_stock` | - |
| `category` | string | Filter by category | - |
| `brand` | string | Filter by brand | - |
| `search` | string | Search in name, description, SKU | - |
| `page` | number | Page number | `1` |
| `limit` | number | Items per page (max 100) | `20` |
| `sort` | string | Sort option (see below) | `created_desc` |
| `min_price` | number | Minimum price filter | - |
| `max_price` | number | Maximum price filter | - |
| `store_id` | string | Filter by store/warehouse | - |
| `include_out_of_stock` | boolean | Include out of stock items | `false` |

#### Sort Options

- `price_asc` - Price low to high
- `price_desc` - Price high to low
- `name_asc` - Name A-Z
- `name_desc` - Name Z-A
- `created_desc` - Newest first (default)
- `stock_desc` - Highest stock first

#### Response Format

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-123",
        "name": "Product Name",
        "description": "Product description",
        "sku": "SKU-123",
        "price": 25000,
        "currency": "KRW",
        "php_price": 1050,
        "price_conversion_rate": 0.042,
        "images": [
          {
            "url": "https://...",
            "alt": "Product Name",
            "is_primary": true,
            "order": 1
          }
        ],
        "category": {
          "id": "skincare",
          "name": "Skincare",
          "slug": "skincare"
        },
        "brand": {
          "id": "cosrx",
          "name": "COSRX",
          "slug": "cosrx"
        },
        "product_type": "onhand",
        "status": "active",
        "stock": {
          "available": 50,
          "reserved": 5,
          "total": 55,
          "min_threshold": 10,
          "location": "Manila, Philippines"
        },
        "stores": [
          {
            "store_id": "store-1",
            "store_name": "Manila Warehouse",
            "store_location": "Manila, Philippines",
            "stock": 30,
            "available": true
          }
        ],
        "preorder": {
          "order_deadline": "2024-12-31T23:59:59Z",
          "release_date": "2025-01-15T00:00:00Z",
          "expected_delivery": "2025-01-20T00:00:00Z",
          "days_until_release": 15,
          "is_deadline_passed": false
        },
        "weight": 0.1,
        "dimensions": {
          "length": 15,
          "width": 5,
          "height": 20,
          "unit": "cm"
        },
        "variations": [
          {
            "id": "var-1",
            "type": "size",
            "name": "Size",
            "value": "Large",
            "sku": "SKU-123-L",
            "price_modifier": 5000,
            "stock": 20,
            "image_url": "https://..."
          }
        ],
        "tags": ["korean", "beauty", "skincare"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-12-20T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    },
    "filters_applied": {
      "product_type": "onhand",
      "category": "skincare"
    },
    "aggregations": {
      "total_products": 150,
      "price_range": {
        "min": 1000,
        "max": 50000
      },
      "categories": [
        { "id": "skincare", "name": "Skincare", "count": 50 },
        { "id": "food", "name": "Food", "count": 100 }
      ],
      "brands": [
        { "id": "cosrx", "name": "COSRX", "count": 30 },
        { "id": "beauty-of-joseon", "name": "Beauty of Joseon", "count": 20 }
      ]
    }
  }
}
```

### 2. Single Product Detail

**GET** `/api/products/:id`

Returns the same product structure as above, plus:

```json
{
  "success": true,
  "data": {
    // ... all product fields ...
    "full_description": "<p>Full HTML description</p>",
    "specifications": {
      "ingredients": "...",
      "usage": "...",
      "warnings": "..."
    },
    "related_products": [...],
    "price_comparison": {
      "our_price": 25000,
      "competitor_prices": [
        {
          "website": "Gmarket",
          "url": "https://...",
          "price": 28000,
          "currency": "KRW",
          "last_checked": "2024-12-20T00:00:00Z"
        }
      ],
      "best_price": 25000,
      "savings": 3000,
      "savings_percentage": 10.7
    },
    "reviews": {
      "average_rating": 4.5,
      "total_reviews": 120,
      "rating_distribution": {
        "5": 80,
        "4": 25,
        "3": 10,
        "2": 3,
        "1": 2
      },
      "recent_reviews": []
    }
  }
}
```

### 3. Convenience Endpoints (Backward Compatible)

These endpoints now use the unified endpoint internally:

- **GET** `/api/products/onhand` - Same as `/api/products?product_type=onhand&status=active`
- **GET** `/api/products/preorder` - Same as `/api/products?product_type=preorder&status=active`

## Usage Examples

### Get all active onhand products with pagination

```bash
GET /api/products?product_type=onhand&status=active&page=1&limit=20
```

### Search products by name

```bash
GET /api/products?search=cosrx&product_type=onhand
```

### Filter by category and price range

```bash
GET /api/products?category=skincare&min_price=1000&max_price=5000&sort=price_asc
```

### Get products from specific store

```bash
GET /api/products?store_id=store-1&product_type=onhand
```

### Get preorder products sorted by release date

```bash
GET /api/products?product_type=preorder&sort=created_desc
```

## Implementation Details

### Backward Compatibility

- The API maintains backward compatibility with existing endpoints
- If store tables don't exist, the API continues to work without store data
- All existing query parameters still work

### Performance Optimizations

1. **Server-side filtering** - All filtering is done in the database
2. **Indexed queries** - Database indexes on frequently filtered columns
3. **Pagination** - Limits data transfer and improves response times
4. **Aggregations** - Pre-calculated category and brand counts

### Price Conversion

- PHP prices are calculated automatically if not set
- Default conversion rate: 0.042 (KRW to PHP)
- Can be overridden per product with `price_conversion_rate` field

### Store/Warehouse Support

- Products can be linked to multiple stores
- Each store has its own stock count
- Store information is included in product responses when available

## Database Migration

To apply the schema changes, run:

```sql
-- Run the migration script
\i database/add_product_optimization_tables.sql
```

Or execute the SQL file directly in your database client.

## Testing

### Test the unified endpoint

```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by type
curl http://localhost:3000/api/products?product_type=onhand

# Search
curl http://localhost:3000/api/products?search=cosrx

# Pagination
curl http://localhost:3000/api/products?page=2&limit=10

# Sorting
curl http://localhost:3000/api/products?sort=price_asc

# Price range
curl http://localhost:3000/api/products?min_price=1000&max_price=5000
```

## Frontend Integration

The frontend can now use a single service to fetch all product types:

```typescript
// Unified service
const products = await productService.getProducts({
  product_type: 'onhand',
  category: 'skincare',
  page: 1,
  limit: 20,
  sort: 'price_asc'
});

// Convenience methods still work
const onhandProducts = await productService.getOnhandProducts({ page: 1 });
const preorderProducts = await productService.getPreorderProducts({ page: 1 });
```

## Next Steps

1. **Run database migration** - Execute `database/add_product_optimization_tables.sql`
2. **Populate stores** - Add your store/warehouse data
3. **Update frontend** - Use the unified endpoint in your frontend code
4. **Test thoroughly** - Verify all filtering and pagination works correctly
5. **Monitor performance** - Check query performance and optimize if needed

