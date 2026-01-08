# Fix for 500 Internal Server Error on Render

## What Was Fixed

### 1. **Build Command Fix**
- Changed `npm ci --production=false` to `npm install` in `render.yaml`
- The `--production=false` flag is invalid for `npm ci`

### 2. **Enhanced Error Logging**
- Added detailed error logging in `productController.js`
- Errors now show: message, code, detail, hint, and stack trace
- Helps identify exact database errors

### 3. **Database Connection Testing**
- Added database connection test on server startup in `index.js`
- Checks if `DATABASE_URL` is set
- Tests database connectivity
- Verifies if `products` table exists

### 4. **Enhanced Health Endpoint**
- `/health` endpoint now checks:
  - Database connection
  - Products table existence
  - Products table accessibility
  - Product count

## How to Diagnose the 500 Error

### Step 1: Check Render Logs
1. Go to Render Dashboard → Your Service → Logs
2. Look for error messages when the server starts
3. Check for database connection errors

### Step 2: Test Health Endpoint
Visit: `https://hanbuyapi.onrender.com/health`

**Expected Response (if everything is OK):**
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "...",
  "postgres_version": "PostgreSQL 15.x",
  "tables": {
    "products": {
      "exists": true,
      "count": 0,
      "error": null
    }
  }
}
```

**If Products Table Missing:**
```json
{
  "status": "WARNING",
  "database": "Connected",
  "message": "Products table does not exist. Please run database migrations.",
  "tables": {
    "products": {
      "exists": false,
      "count": null,
      "error": null
    }
  }
}
```

**If Database Connection Failed:**
```json
{
  "status": "Error",
  "database": "Disconnected",
  "message": "Connection error message here"
}
```

### Step 3: Common Causes and Solutions

#### ❌ Cause 1: DATABASE_URL Not Set
**Symptoms:**
- Logs show: `ERROR: DATABASE_URL environment variable is not set!`
- Health endpoint returns database disconnected

**Solution:**
1. Go to Render Dashboard → Your Service → Environment
2. Add `DATABASE_URL` with your Neon Postgres connection string
3. Format: `postgresql://user:password@host/database?sslmode=require`

#### ❌ Cause 2: Products Table Doesn't Exist
**Symptoms:**
- Health endpoint shows `products.exists: false`
- Products API returns 500 error
- Logs show: `WARNING: products table does not exist!`

**Solution:**
1. Connect to your Neon database
2. Run `database/schema.sql` to create the products table
3. Run `database/add_product_optimization_tables.sql` to add missing columns
4. Verify with: `SELECT * FROM products LIMIT 1;`

#### ❌ Cause 3: Missing Columns in Products Table
**Symptoms:**
- Products table exists but queries fail
- Error mentions specific column names (e.g., `reserved_stock`, `php_price`)

**Solution:**
Run `database/add_product_optimization_tables.sql` which adds:
- `reserved_stock`
- `min_threshold`
- `php_price`
- `price_conversion_rate`
- `order_deadline`
- `release_date`
- `expected_delivery`
- `tags`
- `full_description`
- `specifications`

#### ❌ Cause 4: Database Connection String Wrong
**Symptoms:**
- Logs show connection errors
- Error code: `ENOTFOUND`, `ETIMEDOUT`, or `28P01` (authentication failed)

**Solution:**
1. Verify connection string format
2. Check username/password are correct
3. Ensure database allows connections from Render IPs
4. Test connection string locally first

#### ❌ Cause 5: Database Not Accessible from Render
**Symptoms:**
- Connection timeout errors
- Network errors

**Solution:**
1. Check Neon dashboard → Settings → Connection
2. Ensure "Allow connections from anywhere" or add Render IPs
3. Verify SSL mode is set correctly (`sslmode=require`)

## Quick Diagnostic Checklist

- [ ] `DATABASE_URL` is set in Render Environment Variables
- [ ] Health endpoint (`/health`) shows database connected
- [ ] Products table exists (check health endpoint response)
- [ ] Database migrations have been run (`schema.sql` and `add_product_optimization_tables.sql`)
- [ ] Connection string format is correct
- [ ] Database allows external connections

## Testing After Fix

1. **Check Server Logs:**
   ```
   ✅ Database connected successfully
   ✅ Products table exists
   🚀 Server is running on port 10000
   ```

2. **Test Health Endpoint:**
   ```bash
   curl https://hanbuyapi.onrender.com/health
   ```

3. **Test Products Endpoint:**
   ```bash
   curl https://hanbuyapi.onrender.com/api/products
   ```

## Next Steps

1. **Commit and Push Changes:**
   ```bash
   git add .
   git commit -m "Fix Render build and add database diagnostics"
   git push
   ```

2. **Monitor Render Logs:**
   - Watch for startup messages
   - Check for any new errors

3. **Verify Database:**
   - Run migrations if needed
   - Test queries directly in Neon dashboard

4. **Test API:**
   - Try `/health` endpoint first
   - Then try `/api/products` endpoint

## Still Getting 500 Error?

Check the Render logs for the specific error message. The enhanced error logging will show:
- Exact error message
- PostgreSQL error code
- Detailed error information
- Stack trace (in development mode)

Share the error details from the logs for further assistance.

