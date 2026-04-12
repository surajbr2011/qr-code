# 🚀 Quick Deployment Script

This guide provides copy-paste commands for quick deployment.

## Step 1: Prepare Your Repository

```bash
# Make sure you're in the project root
cd "c:/Users/SURAJ/B2 Spice A_D Lite download starting..._files/Downloads/Restaurant-QR-Code -hotel/Restaurant-QR-Code"

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for production deployment"

# Push to GitHub (if not already done)
git push origin main
```

If you don't have a git repository yet:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Restaurant QR Code System"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Generate JWT Secret

**Windows PowerShell:**
```powershell
# Run this to generate a secure JWT secret
$bytes = 1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }
[Convert]::ToBase64String($bytes)

# Copy the output - you'll need this for Render
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

## Step 3: MongoDB Atlas Connection String Template

After creating your MongoDB Atlas cluster, your connection string will look like:

```
mongodb+srv://restaurant_admin:YOUR_PASSWORD@restaurant-cluster.xxxxx.mongodb.net/restaurant_db?retryWrites=true&w=majority
```

**Important:** Replace:
- `YOUR_PASSWORD` with the actual password you generated
- `xxxxx` with your cluster ID

## Step 4: Environment Variables for Render

When deploying to Render, add these environment variables:

| Variable Name | Example Value | Notes |
|--------------|---------------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5001` | Render will override this |
| `MONGO_URI` | `mongodb+srv://...` | Full connection string from Atlas |
| `JWT_SECRET` | `abc123XYZ...` | From Step 2 |
| `ENCRYPTION_KEY` | `s3cur3_3ncr_k3y_for_qr_codes_32c` | Or generate new one |
| `CUSTOMER_FRONTEND_URL` | `https://restaurant-customer.netlify.app` | Update after Netlify deploy |
| `ADMIN_FRONTEND_URL` | `https://restaurant-admin.netlify.app` | Update after Netlify deploy |
| `STAFF_FRONTEND_URL` | `https://restaurant-staff.netlify.app` | Update after Netlify deploy |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | `...` | Your Razorpay secret |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Optional - Stripe key |

## Step 5: Environment Variables for Netlify (Each Frontend)

### Customer Frontend (userfrontend)

| Variable Name | Example Value |
|--------------|---------------|
| `VITE_API_URL` | `https://restaurant-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://restaurant-backend.onrender.com` |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_...` |

### Staff Frontend (staffmanagement)

| Variable Name | Example Value |
|--------------|---------------|
| `VITE_API_URL` | `https://restaurant-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://restaurant-backend.onrender.com` |

### Admin Frontend (admin-folder-main)

| Variable Name | Example Value |
|--------------|---------------|
| `VITE_API_URL` | `https://restaurant-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://restaurant-backend.onrender.com` |

## Step 6: Netlify Build Settings

### Customer Frontend
- **Base directory:** `userfrontend`
- **Build command:** `npm run build`
- **Publish directory:** `userfrontend/dist`

### Staff Frontend
- **Base directory:** `staffmanagement`
- **Build command:** `npm run build`
- **Publish directory:** `staffmanagement/dist`

### Admin Frontend
- **Base directory:** `admin-folder-main`
- **Build command:** `npm run build`
- **Publish directory:** `admin-folder-main/dist`

## Step 7: Test Locally Before Deploying

```bash
# Test backend
cd backend
npm install
npm start

# Test customer frontend (new terminal)
cd userfrontend
npm install
npm run build
npm run preview

# Test staff frontend (new terminal)
cd staffmanagement
npm install
npm run build
npm run preview

# Test admin frontend (new terminal)
cd admin-folder-main
npm install
npm run build
npm run preview
```

## Step 8: Deployment Sequence

**✅ Recommended Order:**

1. **MongoDB Atlas** (database first)
2. **Render** (backend second)
3. **Netlify** (frontends last)

Why this order?
- Backend needs database connection string
- Frontends need backend URL

## Step 9: Post-Deployment Updates

After all apps are deployed:

1. **Update .env.production files** with actual URLs
2. **Update Render environment variables** with Netlify URLs
3. **Redeploy** if needed

```bash
# After updating .env.production files
git add .
git commit -m "Update production URLs"
git push origin main

# Netlify will auto-redeploy
# Render will auto-redeploy
```

## Step 10: Verification Checklist

Test each URL:

```
✅ Backend API: https://YOUR-BACKEND.onrender.com
✅ API Docs: https://YOUR-BACKEND.onrender.com/api/docs
✅ Customer App: https://YOUR-CUSTOMER.netlify.app
✅ Staff App: https://YOUR-STAFF.netlify.app
✅ Admin App: https://YOUR-ADMIN.netlify.app
```

## Common Issues & Quick Fixes

### Issue: "Build failed" on Netlify

**Fix:**
```bash
# Make sure build works locally first
cd userfrontend  # or staffmanagement or admin-folder-main
npm install
npm run build

# If successful, push changes
git add .
git commit -m "Fix build issues"
git push origin main
```

### Issue: CORS errors in browser console

**Fix:** Update Render environment variables with exact Netlify URLs (no trailing slash)

### Issue: "Cannot connect to database" on Render

**Fix:** Check MongoDB Atlas:
1. Network Access allows all IPs (0.0.0.0/0)
2. Database user credentials are correct
3. Connection string is complete

### Issue: Environment variables not working

**Fix:** 
1. Rebuild the site in Netlify after adding env vars
2. Variables must start with `VITE_` for Vite projects
3. Check variable names match exactly

## 🎉 Success!

Once all apps are deployed and working:

1. Share the customer app URL with your restaurant clients
2. Give staff app URL to waiters
3. Give admin app URL to restaurant managers
4. Generate QR codes from admin panel
5. Print and place QR codes on tables

## Need Help?

Refer to the full `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

*Quick Start Version 1.0*
