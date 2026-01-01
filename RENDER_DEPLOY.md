# Deploy Express.js API to Render

This guide will help you deploy your Express.js API with Neon Postgres to Render.

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. A Render account (sign up at https://render.com)

## Step 1: Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/dbexpress.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Create a Web Service on Render

1. **Sign in to Render**: Go to https://dashboard.render.com and sign in

2. **Create New Web Service**:
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub account if you haven't already
   - Select your repository

3. **Configure the Service**:
   - **Name**: `dbexpress` (or any name you prefer)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: ⚠️ **MUST BE EMPTY** (leave it blank if `package.json` is in the repository root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   
   ⚠️ **IMPORTANT**: If you get an error about `package.json` not found, make sure **Root Directory is EMPTY/BLANK**. Do NOT set it to `/`, `./`, or any other value.

4. **Environment Variables**:
   Click "Advanced" and add these environment variables:
   
   - `DATABASE_URL`: Your Neon Postgres connection string
     ```
     postgresql://neondb_owner:npg_aUc5FQOotH9j@ep-tiny-base-a4uruudc-pooler.us-east-1.aws.neon.tech/HanBUyDB?sslmode=require&channel_binding=require
     ```
   
   - `FRONTEND_URL`: Your production frontend URL (e.g., `https://your-frontend.onrender.com` or your custom domain)
   
   - `NODE_ENV`: `production`

5. **Click "Create Web Service"**

## Step 3: Deploy and Monitor

1. After clicking "Create Web Service", Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Start your service (`npm start`)

2. **Monitor the Deploy**:
   - Watch the build logs in the Render dashboard
   - Check for any errors
   - The service URL will be something like: `https://dbexpress.onrender.com`

3. **Test Your API**:
   - Health check: `https://your-service.onrender.com/health`
   - Bank types: `https://your-service.onrender.com/api/bank-type`
   - Box types: `https://your-service.onrender.com/api/box-type`

## Step 4: Update Your Frontend

Update your Next.js frontend to use the production API URL:

```typescript
// In your API client or config file
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5173';

// Then use it:
const response = await fetch(`${API_URL}/api/bank-type`);
```

Add to your Next.js `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-service.onrender.com
```

## Step 5: Custom Domain (Optional)

1. In your Render service dashboard, go to "Settings"
2. Scroll to "Custom Domains"
3. Add your custom domain
4. Update DNS records as instructed by Render

## Important Notes

### Free Tier Limitations:
- **Spin down**: Free tier services spin down after 15 minutes of inactivity
- **First request**: May take 30-60 seconds to wake up
- **Usage limits**: 750 hours/month on free tier

### Database Connection:
- Your Neon database connection string works the same way
- Make sure your Neon database allows connections from Render's IPs
- Neon's serverless driver (`@neondatabase/serverless`) works well with Render

### Environment Variables:
- Never commit `.env` files to GitHub
- Use Render's environment variables section
- Mark sensitive variables as "Secret" if available

### Logs:
- View logs in the Render dashboard under "Logs" tab
- Logs help debug issues in production

## Troubleshooting

### Service won't start / package.json not found:
- ⚠️ **Most Common Issue**: Make sure **Root Directory is EMPTY/BLANK** in Render settings
- If Root Directory is set to `src` or any value, clear it completely
- Verify `package.json` is in the root of your repository
- Check build logs for dependency issues
- Verify `DATABASE_URL` is set correctly
- Ensure `npm start` command is correct
- Check that `index.js` exists and is the entry point

### Database connection errors:
- Verify `DATABASE_URL` environment variable is set
- Check Neon database is accessible
- Review connection string format
- Check Neon dashboard for connection logs

### CORS errors:
- Update `FRONTEND_URL` environment variable in Render
- Check CORS configuration in code (should allow your production frontend URL)
- Verify frontend is making requests to correct URL

### Service spins down:
- This is normal on free tier
- First request after spin-down will be slow (~30-60 seconds)
- Consider upgrading to paid plan for always-on service

### 404 errors:
- Check that your routes are registered before the 404 handler
- Verify the service is running (check logs)
- Test with `/health` endpoint first

## Updating Your Deployment

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. **Render automatically deploys**: Render watches your repository and automatically deploys on push to the configured branch

3. **Manual deploy**: You can also manually trigger a deploy from the Render dashboard by clicking "Manual Deploy"

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created on Render
- [ ] `DATABASE_URL` environment variable set
- [ ] `FRONTEND_URL` environment variable set (if using production frontend)
- [ ] `NODE_ENV` set to `production`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Service deployed successfully
- [ ] Health endpoint tested
- [ ] API endpoints tested

## Useful Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Neon Database: https://neon.tech
- Your service will be at: `https://your-service-name.onrender.com`

Good luck with your deployment! 🚀

