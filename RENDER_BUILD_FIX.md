# Render Build Fix Guide

## ✅ Fixed Issues

I've fixed the following common Render build problems:

### 1. **Added Node.js Version Specification**
   - Added `engines` field to `package.json` specifying Node.js >= 18.0.0
   - Created `.nvmrc` file with Node.js version 18
   - This ensures Render uses the correct Node.js version

### 2. **Improved Build Command**
   - Changed from `npm install` to `npm ci --production=false`
   - `npm ci` is faster and more reliable for CI/CD environments
   - `--production=false` ensures devDependencies are installed if needed

### 3. **Added PORT Environment Variable**
   - Added PORT to render.yaml (Render sets this automatically, but specifying helps)

## 🔧 What Was Fixed

### package.json
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### render.yaml
```yaml
buildCommand: npm ci --production=false
```

### .nvmrc
```
18
```

## 🚀 Next Steps

1. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "Fix Render build configuration"
   git push
   ```

2. **Check Render Dashboard**:
   - Go to your Render service
   - Verify Root Directory is **EMPTY** (not `src` or any other value)
   - Check that environment variables are set:
     - `DATABASE_URL`
     - `NODE_ENV=production`
     - `ALLOWED_ORIGINS` (optional)
     - `FRONTEND_URL` (optional)

3. **Monitor Build**:
   - Watch the build logs in Render dashboard
   - The build should now:
     - ✅ Use Node.js 18
     - ✅ Install dependencies correctly
     - ✅ Start the server successfully

## 🔍 Common Build Errors and Solutions

### Error: "package.json not found"
**Solution**: Make sure Root Directory in Render settings is **EMPTY/BLANK**

### Error: "Cannot find module"
**Solution**: 
- Check that all dependencies are in `package.json`
- Verify `npm ci` completes successfully
- Check build logs for missing packages

### Error: "Port already in use"
**Solution**: 
- Render automatically sets PORT environment variable
- Your code uses `process.env.PORT || 3000` which is correct
- No action needed

### Error: "Database connection failed"
**Solution**:
- Verify `DATABASE_URL` is set in Render environment variables
- Check Neon database is accessible
- Verify connection string format

## ✅ Verification Checklist

After deploying, verify:

- [ ] Build completes successfully
- [ ] Service starts without errors
- [ ] Health endpoint works: `GET /health`
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] CORS is configured properly

## 📝 Environment Variables Checklist

Make sure these are set in Render Dashboard → Environment Variables:

- [ ] `DATABASE_URL` - Your Neon Postgres connection string
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGINS` (optional) - Comma-separated frontend URLs
- [ ] `FRONTEND_URL` (optional) - Your frontend URL
- [ ] `ALLOW_VERCEL_PREVIEWS=true` (optional) - For Vercel previews
- [ ] `JWT_SECRET` (if using JWT) - Strong random string

## 🎯 Quick Fix Summary

**If build still fails:**

1. **Check Root Directory**: Must be EMPTY in Render settings
2. **Check package.json**: Must be at repository root
3. **Check build logs**: Look for specific error messages
4. **Verify Node version**: Should use Node.js 18+ (now specified in package.json)
5. **Check dependencies**: All required packages should be in package.json

## 📞 Still Having Issues?

Check the build logs in Render dashboard for specific error messages. Common issues:

- Missing environment variables
- Database connection issues
- Port conflicts (rare on Render)
- Missing files or directories

The fixes I've made should resolve most common build issues. If you still see errors, share the specific error message from Render build logs.
