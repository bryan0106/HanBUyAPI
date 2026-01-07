# Deployment Checklist for Render

## ✅ Pre-Deployment Checks

### 1. Dependencies
- [x] All npm packages in package.json
- [x] jsonwebtoken added
- [x] multer added
- [x] qrcode added

### 2. Environment Variables Required in Render
Set these in Render Dashboard → Environment Variables:

```
DATABASE_URL=your_neon_database_url
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=production
ALLOWED_ORIGINS=https://han-b-uy.vercel.app
ALLOW_VERCEL_PREVIEWS=true
PORT=3000 (or let Render set it)
```

### 3. File Structure
- [x] All controllers created
- [x] All routes created
- [x] Middleware created
- [x] Database schema updated

### 4. Potential Issues to Fix

#### Issue 1: Uploads Directory
Multer needs an `uploads/` directory. Create it or handle it in code.

**Fix:** Add this to index.js or create uploads directory handler.

#### Issue 2: QRCode Import
QRCode package is installed, should work.

#### Issue 3: Database Schema
Make sure to run the updated schema.sql on your Neon database.

### 5. Build Command
Render will use: `npm install` (from render.yaml)

### 6. Start Command
Render will use: `npm start` (from render.yaml)

## 🚨 Critical Fixes Needed Before Deploy

### Fix 1: Create uploads directory handler
Add to index.js or create a startup script.

### Fix 2: Ensure .gitignore includes uploads
Check .gitignore file.

## ✅ Ready to Deploy Checklist

- [ ] All environment variables set in Render
- [ ] Database schema run on Neon
- [ ] JWT_SECRET set (use a strong random string)
- [ ] ALLOWED_ORIGINS set to your frontend URL
- [ ] Test locally first (optional but recommended)
- [ ] Push to GitHub
- [ ] Connect Render to GitHub repo
- [ ] Deploy

## 📝 Post-Deployment

1. Test health endpoint: `GET /health`
2. Test login endpoint: `POST /api/auth/login`
3. Check Render logs for errors
4. Verify CORS is working


