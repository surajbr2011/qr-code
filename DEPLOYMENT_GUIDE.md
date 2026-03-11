# 🚀 Deployment Guide - Render & Netlify

**Project:** Restaurant QR Code System  
**Backend:** Render.com  
**Frontends:** Netlify  
**Database:** MongoDB Atlas  

---

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:

- [ ] GitHub account (or GitLab/Bitbucket)
- [ ] Project pushed to a Git repository
- [ ] Render.com account (free tier available)
- [ ] Netlify account (free tier available)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Razorpay/Stripe API keys (at least test keys)

---

## 🗂️ Deployment Overview

```
┌─────────────────────────────────────────────┐
│         DEPLOYMENT ARCHITECTURE             │
├─────────────────────────────────────────────┤
│                                             │
│  Netlify (Static Hosting)                   │
│  ├─ Customer Frontend                       │
│  ├─ Staff Frontend                          │
│  └─ Admin Dashboard                         │
│         ↓                                   │
│  Render (Backend API)                       │
│  └─ Node.js + Socket.IO                     │
│         ↓                                   │
│  MongoDB Atlas (Database)                   │
│  └─ Cloud Database                          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 STEP 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Create account with email/Google/GitHub

### 1.2 Create a New Cluster
1. After login, click **"Build a Database"**
2. Select **"M0 Free"** tier
3. Choose a cloud provider: **AWS** (recommended)
4. Select region closest to your users (e.g., Mumbai for India)
5. Cluster Name: `restaurant-cluster` (or any name)
6. Click **"Create"**

### 1.3 Configure Database Access
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `restaurant_admin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** → **COPY THIS PASSWORD**
6. Database User Privileges: **"Atlas Admin"**
7. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IPs later
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://restaurant_admin:<password>@restaurant-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>` with your actual password**
6. Save this connection string securely - you'll need it soon!

---

## 🔧 STEP 2: Prepare Backend for Deployment

### 2.1 Create `render.yaml` (Optional but Recommended)

Create a file named `render.yaml` in your **backend/** folder:

```yaml
services:
  - type: web
    name: restaurant-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: ENCRYPTION_KEY
        generateValue: true
      - key: FRONTEND_URL
        sync: false
      - key: CUSTOMER_FRONTEND_URL
        sync: false
      - key: RAZORPAY_KEY_ID
        sync: false
      - key: RAZORPAY_KEY_SECRET
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
```

### 2.2 Update CORS Configuration

Edit `backend/server.js` to accept production URLs:

**Find this section (around line 19-25):**
```javascript
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    process.env.FRONTEND_URL
];
```

**Replace with:**
```javascript
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    process.env.FRONTEND_URL,
    process.env.CUSTOMER_FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
    process.env.STAFF_FRONTEND_URL,
    // Add your Netlify URLs here after deployment
    "https://your-customer-app.netlify.app",
    "https://your-admin-app.netlify.app",
    "https://your-staff-app.netlify.app"
];
```

**Also update Socket.IO CORS (around line 62-72):**
```javascript
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            process.env.FRONTEND_URL || "http://localhost:5173",
            process.env.CUSTOMER_FRONTEND_URL,
            process.env.ADMIN_FRONTEND_URL,
            process.env.STAFF_FRONTEND_URL,
            // Add Netlify URLs
            "https://your-customer-app.netlify.app",
            "https://your-admin-app.netlify.app",
            "https://your-staff-app.netlify.app"
        ],
        methods: ["GET", "POST"],
        credentials: true,
    }
});
```

### 2.3 Verify package.json Scripts

Ensure `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --runInBand"
  }
}
```

### 2.4 Create .gitignore (if not exists)

In `backend/` folder, create `.gitignore`:
```
node_modules/
.env
uploads/*
!uploads/.gitkeep
reports/*
!reports/.gitkeep
*.log
.DS_Store
```

### 2.5 Commit Changes

```bash
cd backend
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

---

## 🌐 STEP 3: Deploy Backend to Render

### 3.1 Create Render Account
1. Go to [Render.com](https://render.com)
2. Click **"Get Started"** → Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### 3.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your **Restaurant-QR-Code** repository
4. Configure the service:

**Basic Settings:**
- **Name:** `restaurant-backend` (or your choice)
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** (for testing) or **"Starter"** ($7/month for production)

### 3.3 Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add the following variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5001` | Render will override with their port |
| `MONGO_URI` | Your MongoDB Atlas connection string | From Step 1.5 |
| `JWT_SECRET` | Generate a strong random string | Use: `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `s3cur3_3ncr_k3y_for_qr_codes_32c` | Or generate new one |
| `CUSTOMER_FRONTEND_URL` | Leave empty for now | Update after Netlify deployment |
| `ADMIN_FRONTEND_URL` | Leave empty for now | Update after Netlify deployment |
| `STAFF_FRONTEND_URL` | Leave empty for now | Update after Netlify deployment |
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID | |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Secret | |
| `STRIPE_SECRET_KEY` | Your Stripe Secret (optional) | |

**To generate JWT_SECRET:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# On Mac/Linux:
openssl rand -base64 32
```

### 3.4 Deploy
1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (5-10 minutes)
4. You'll get a URL like: `https://restaurant-backend.onrender.com`

### 3.5 Test Backend
1. Open your backend URL: `https://restaurant-backend.onrender.com`
2. You should see: **"API is running..."**
3. Test API docs: `https://restaurant-backend.onrender.com/api/docs`

**IMPORTANT:** Copy your backend URL - you'll need it for frontend deployment!

---

## 📱 STEP 4: Deploy Customer Frontend to Netlify

### 4.1 Prepare Customer Frontend

#### Create Environment File
In `userfrontend/` folder, create `.env.production`:

```env
VITE_API_URL=https://restaurant-backend.onrender.com/api
VITE_SOCKET_URL=https://restaurant-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Replace `restaurant-backend.onrender.com` with your actual Render URL.

#### Update API Configuration

Find your API configuration file (usually `src/utils/api.js` or similar):

**Create if not exists:** `userfrontend/src/config/api.js`
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export { API_URL, SOCKET_URL };
```

**Update all axios instances to use:**
```javascript
import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

#### Create Netlify Configuration

Create `userfrontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 4.2 Build Test Locally

```bash
cd userfrontend
npm install
npm run build
```

Check that `dist/` folder is created successfully.

### 4.3 Deploy to Netlify

**Method 1: Drag & Drop (Quick Test)**
1. Go to [Netlify](https://app.netlify.com)
2. Sign up/Login
3. Drag the `dist/` folder to the deployment area
4. Wait for deployment
5. You'll get a URL like: `https://random-name-123.netlify.app`

**Method 2: Git Integration (Recommended)**
1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Select your repository
5. Configure build settings:
   - **Base directory:** `userfrontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `userfrontend/dist`
   - **Branch:** `main`

6. Click **"Advanced build settings"** → **"New variable"**
   Add your environment variables:
   - `VITE_API_URL` = `https://restaurant-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://restaurant-backend.onrender.com`
   - `VITE_STRIPE_PUBLIC_KEY` = your key
   - `VITE_RAZORPAY_KEY_ID` = your key

7. Click **"Deploy site"**

### 4.4 Configure Custom Domain (Optional)
1. Go to **"Site settings"** → **"Domain management"**
2. Click **"Add custom domain"**
3. Follow instructions to configure your domain

### 4.5 Update Site Name
1. Go to **"Site settings"** → **"General"**
2. Click **"Change site name"**
3. Enter: `restaurant-customer` (or your choice)
4. Your URL becomes: `https://restaurant-customer.netlify.app`

---

## 🔧 STEP 5: Deploy Staff Frontend to Netlify

Repeat STEP 4 for the staff frontend:

### 5.1 Prepare Staff Frontend

Create `staffmanagement/.env.production`:
```env
VITE_API_URL=https://restaurant-backend.onrender.com/api
VITE_SOCKET_URL=https://restaurant-backend.onrender.com
```

Create `staffmanagement/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 5.2 Deploy
1. Follow same steps as 4.3 (Git Integration)
2. Base directory: `staffmanagement`
3. Publish directory: `staffmanagement/dist`
4. Site name: `restaurant-staff`
5. URL: `https://restaurant-staff.netlify.app`

---

## 🎛️ STEP 6: Deploy Admin Dashboard to Netlify

Repeat for admin dashboard:

### 6.1 Prepare Admin Frontend

Create `admin-folder-main/.env.production`:
```env
VITE_API_URL=https://restaurant-backend.onrender.com/api
VITE_SOCKET_URL=https://restaurant-backend.onrender.com
```

Create `admin-folder-main/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 6.2 Deploy
1. Follow same steps as 4.3 (Git Integration)
2. Base directory: `admin-folder-main`
3. Publish directory: `admin-folder-main/dist`
4. Site name: `restaurant-admin`
5. URL: `https://restaurant-admin.netlify.app`

---

## 🔄 STEP 7: Update Backend CORS with Frontend URLs

Now that you have your Netlify URLs, update your backend:

### 7.1 Go to Render Dashboard
1. Go to your **restaurant-backend** service
2. Click **"Environment"** tab
3. Add/Update environment variables:
   - `CUSTOMER_FRONTEND_URL` = `https://restaurant-customer.netlify.app`
   - `ADMIN_FRONTEND_URL` = `https://restaurant-admin.netlify.app`
   - `STAFF_FRONTEND_URL` = `https://restaurant-staff.netlify.app`

### 7.2 Update server.js CORS

Edit `backend/server.js` and replace placeholder URLs with actual Netlify URLs:

```javascript
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    process.env.CUSTOMER_FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
    process.env.STAFF_FRONTEND_URL,
    "https://restaurant-customer.netlify.app",
    "https://restaurant-admin.netlify.app",
    "https://restaurant-staff.netlify.app"
];
```

### 7.3 Commit and Push
```bash
git add backend/server.js
git commit -m "Update CORS for production URLs"
git push origin main
```

Render will auto-deploy the changes.

---

## 🧪 STEP 8: Testing the Deployment

### 8.1 Test Backend
1. Visit: `https://restaurant-backend.onrender.com`
2. Should show: "API is running..."
3. Test API docs: `https://restaurant-backend.onrender.com/api/docs`

### 8.2 Test Customer Frontend
1. Visit: `https://restaurant-customer.netlify.app`
2. Try signup/login
3. Browse menu
4. Add items to cart
5. Check if API calls work (open browser console)

### 8.3 Test Staff Frontend
1. Visit: `https://restaurant-staff.netlify.app`
2. Login with staff credentials
3. Check order management
4. Test real-time updates

### 8.4 Test Admin Dashboard
1. Visit: `https://restaurant-admin.netlify.app`
2. Login with admin credentials
3. Check dashboard analytics
4. Test menu management
5. Generate QR codes
6. Download reports

### 8.5 Test Real-time Features
1. Open Customer app in one browser
2. Open Admin app in another
3. Place an order from customer app
4. Check if admin receives notification
5. Update order status from admin
6. Check if customer sees status update

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Symptom:** Frontend shows CORS errors in console

**Solution:**
1. Check backend environment variables in Render
2. Verify CORS configuration in `server.js`
3. Make sure frontend URLs match exactly (no trailing slash)
4. Redeploy backend after changes

### Issue: API Calls Failing

**Symptom:** Network errors, 404s

**Solution:**
1. Check `VITE_API_URL` in Netlify environment variables
2. Rebuild frontend after changing env vars
3. Verify backend is running on Render
4. Check browser console for exact error

### Issue: Socket.IO Not Connecting

**Symptom:** Real-time features not working

**Solution:**
1. Check `VITE_SOCKET_URL` in frontend env
2. Verify Socket.IO CORS in backend
3. Check Render logs for connection errors
4. Ensure WebSocket support is enabled (Render supports it by default)

### Issue: Database Connection Failed

**Symptom:** Backend crashes, "MongoNetworkError"

**Solution:**
1. Verify `MONGO_URI` in Render env variables
2. Check MongoDB Atlas network access (allow all IPs)
3. Verify database user credentials
4. Check Render logs for exact error

### Issue: Build Fails on Netlify

**Symptom:** "Build failed" message

**Solution:**
1. Check build logs in Netlify
2. Verify `package.json` scripts
3. Ensure all dependencies are in `dependencies`, not `devDependencies`
4. Check Node version compatibility
5. Try building locally first: `npm run build`

### Issue: Environment Variables Not Working

**Symptom:** `undefined` values in code

**Solution:**
1. Rebuild site after adding env vars in Netlify
2. Ensure variable names start with `VITE_` for Vite projects
3. Clear cache and redeploy
4. Check if using correct env file syntax

### Issue: Render Service Sleeping (Free Tier)

**Symptom:** First request takes 30+ seconds

**Solution:**
1. This is normal for Render free tier (spins down after inactivity)
2. Upgrade to paid tier for always-on service
3. Use a cron job to ping your backend every 10 minutes
4. Accept the delay for free hosting

---

## 🔒 Security Best Practices

### Post-Deployment Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use different keys for production
   - Rotate secrets regularly

2. **MongoDB Atlas**
   - Restrict IP access to known IPs (remove 0.0.0.0/0)
   - Use strong passwords
   - Enable encryption at rest

3. **API Security**
   - Implement rate limiting
   - Add request validation
   - Monitor for suspicious activity

4. **CORS**
   - Remove localhost URLs from production
   - Restrict to specific domains only

5. **Secrets**
   - Use strong JWT secrets (32+ characters)
   - Store payment keys securely
   - Never expose secrets in frontend code

---

## 📊 Performance Optimization

### After Deployment

1. **Enable Caching**
   - Configure Netlify edge caching
   - Add cache headers in backend responses

2. **Image Optimization**
   - Compress menu item images
   - Use WebP format
   - Enable lazy loading

3. **Code Splitting**
   - Already implemented with React.lazy()
   - Verify in production build

4. **CDN**
   - Netlify provides CDN automatically
   - Consider Cloudflare for backend

5. **Database Indexing**
   - Add indexes to frequently queried fields
   - Monitor query performance

---

## 🎉 Post-Deployment Checklist

After successful deployment:

- [ ] All 3 frontends are accessible
- [ ] Backend API is responding
- [ ] Database connection is working
- [ ] User authentication works
- [ ] Order placement works
- [ ] Payment integration works
- [ ] Real-time notifications work
- [ ] QR codes can be generated and downloaded
- [ ] Admin can manage menu
- [ ] Reports can be exported
- [ ] SSL certificates are active (automatic on Netlify/Render)
- [ ] Environment variables are secure
- [ ] CORS is properly configured
- [ ] Error monitoring is set up
- [ ] Backup strategy is in place

---

## 🔗 Quick Reference

### Deployment URLs

**Backend:**
```
https://restaurant-backend.onrender.com
API Docs: https://restaurant-backend.onrender.com/api/docs
```

**Frontends:**
```
Customer: https://restaurant-customer.netlify.app
Staff: https://restaurant-staff.netlify.app
Admin: https://restaurant-admin.netlify.app
```

### Important Commands

**Redeploy Frontend (Netlify):**
```bash
# Trigger redeploy via Git
git add .
git commit -m "Update frontend"
git push origin main
```

**View Backend Logs (Render):**
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab

**View Frontend Logs (Netlify):**
1. Go to Netlify dashboard
2. Select your site
3. Click "Functions" or "Deploy log"

---

## 💰 Cost Breakdown

### Free Tier Limits

**Netlify (per site):**
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Continuous deployment
- ✅ SSL included
- ✅ Custom domain

**Render (Free tier):**
- ✅ 512 MB RAM
- ✅ Shared CPU
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 750 hours/month free (enough for 1 service)

**MongoDB Atlas (M0 Free):**
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Enough for small-medium restaurants

**Total Cost: $0/month** (with limitations)

### Recommended Paid Tier

**Netlify:** $19/month (Pro) - More bandwidth, better support
**Render:** $7/month (Starter) - Always on, better performance
**MongoDB Atlas:** $9/month (M10) - More storage, better performance

**Total: ~$35/month** for production-ready hosting

---

## 🆘 Support Resources

**Render Documentation:** https://render.com/docs
**Netlify Documentation:** https://docs.netlify.com
**MongoDB Atlas Docs:** https://docs.atlas.mongodb.com

**Community:**
- Render Community: https://community.render.com
- Netlify Community: https://answers.netlify.com

---

## ✅ Deployment Complete!

Congratulations! 🎉 Your Restaurant QR Code System is now live!

**Share your URLs:**
- Customer App: `https://restaurant-customer.netlify.app`
- Staff App: `https://restaurant-staff.netlify.app`
- Admin Dashboard: `https://restaurant-admin.netlify.app`

**Next Steps:**
1. Test all features thoroughly
2. Show to restaurant staff for feedback
3. Generate QR codes for tables
4. Print QR codes and place on tables
5. Start taking real orders!

**Need help?** Refer to the troubleshooting section or check the support resources.

---

*Deployment Guide Version 1.0 - February 14, 2026*
