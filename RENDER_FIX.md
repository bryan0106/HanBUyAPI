# Fix: package.json Not Found Error on Render

## Problem
You're seeing this error:
```
npm error path /opt/render/project/src/package.json
npm error errno -2
npm error enoent Could not read package.json
```

## Solution

The error occurs because Render is looking for `package.json` in the wrong location. This happens when the **Root Directory** setting is incorrect.

### Fix Steps:

1. **Go to your Render Dashboard**
   - Navigate to your service
   - Click on "Settings" in the left sidebar

2. **Check Root Directory Setting**
   - Scroll down to find "Root Directory" field
   - **IT MUST BE EMPTY/BLANK** - Click on the field and delete any value (like `src`, `/`, `./`, etc.)
   - The field should be completely empty with no text
   - ⚠️ Your error shows it's set to `src` - DELETE that value!

3. **Save and Redeploy**
   - Click "Save Changes"
   - Go to "Manual Deploy" or wait for the next auto-deploy
   - The build should now find `package.json` in the correct location

### How to Verify Your Repository Structure

Your GitHub repository should have this structure:
```
your-repo/
  ├── package.json      ← Must be at root
  ├── index.js          ← Must be at root
  ├── .env              ← Should be in .gitignore
  ├── .gitignore
  └── ...other files
```

### If Your Code IS in a Subdirectory

If your Express code is actually in a subdirectory (like `DBExpress/`), you have two options:

**Option 1: Set Root Directory** (if code is in a subfolder)
- If your repo structure is:
  ```
  your-repo/
    └── DBExpress/
        ├── package.json
        └── index.js
  ```
- Then set Root Directory to: `DBExpress`

**Option 2: Move files to root** (recommended)
- Move `package.json`, `index.js`, and other files to the repository root
- Keep Root Directory empty

### Quick Checklist

- [ ] Root Directory is EMPTY in Render settings (currently shows `src` - needs to be cleared!)
- [ ] `package.json` exists in your GitHub repository root (check at https://github.com/bryan0106/HanBUyAPI)
- [ ] `index.js` exists in your GitHub repository root
- [ ] Code is pushed to GitHub
- [ ] Service is redeployed after fixing Root Directory

### Visual Guide

When you go to Render Dashboard → Your Service → Settings:

**WRONG** (causes the error):
```
Root Directory: [src]  ← DELETE THIS!
```

**CORRECT**:
```
Root Directory: []  ← Empty/blank field
```

After fixing, your deployment should work! ✅

