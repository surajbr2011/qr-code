# ✅ Deployment Checklist

Use this checklist to track your deployment progress.

---

## 📦 Pre-Deployment Preparation

### Code Preparation
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub/GitLab
- [ ] `.env` files added to `.gitignore`
- [ ] Production configuration files created:
  - [ ] `backend/render.yaml`
  - [ ] `userfrontend/netlify.toml`
  - [ ] `staffmanagement/netlify.toml`
  - [ ] `admin-folder-main/netlify.toml`
  - [ ] `.env.production` files for all frontends
- [ ] Backend CORS updated for production URLs

### Accounts Created
- [ ] GitHub account (repository hosted)
- [ ] MongoDB Atlas account
- [ ] Render.com account
- [ ] Netlify account (or 3 separate sites)

### Keys & Secrets Ready
- [ ] MongoDB Atlas connection string
- [ ] JWT Secret generated (32+ characters)
- [ ] Razorpay API keys (test or production)
- [ ] Stripe API keys (optional)
- [ ] Encryption key for QR codes

---

## 🗄️ Database Setup (MongoDB Atlas)

- [ ] MongoDB Atlas account created
- [ ] M0 Free tier cluster created
- [ ] Region selected (closest to users)
- [ ] Database user created with password
- [ ] Password saved securely
- [ ] Network access configured (0.0.0.0/0 for testing)
- [ ] Connection string copied and saved
- [ ] Connection string password replaced
- [ ] Tested connection locally (optional)

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@cluster.xxxxx.mongodb.net/restaurant_db?retryWrites=true&w=majority
```

---

## 🖥️ Backend Deployment (Render)

### Render Setup
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] New Web Service created
- [ ] Repository selected
- [ ] Branch selected (main/master)
- [ ] Root directory set to `backend`

### Build Configuration
- [ ] Environment: Node
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Region selected
- [ ] Instance type selected (Free or Starter)

### Environment Variables Added
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5001`
- [ ] `MONGO_URI` = [Your MongoDB connection string]
- [ ] `JWT_SECRET` = [Generated secret]
- [ ] `ENCRYPTION_KEY` = [Your encryption key]
- [ ] `RAZORPAY_KEY_ID` = [Your key]
- [ ] `RAZORPAY_KEY_SECRET` = [Your secret]
- [ ] `STRIPE_SECRET_KEY` = [If using Stripe]
- [ ] `CUSTOMER_FRONTEND_URL` = [Will add after Netlify]
- [ ] `ADMIN_FRONTEND_URL` = [Will add after Netlify]
- [ ] `STAFF_FRONTEND_URL` = [Will add after Netlify]

### Deployment & Testing
- [ ] Service deployed successfully
- [ ] Build logs checked (no errors)
- [ ] Service status is "Live"
- [ ] Backend URL noted: `https://____________.onrender.com`
- [ ] Tested: Backend URL shows "API is running..."
- [ ] Tested: API docs accessible at `/api/docs`

---

## 🌐 Customer Frontend Deployment (Netlify)

### Netlify Setup - Customer App
- [ ] Netlify site created
- [ ] Repository connected
- [ ] Branch selected (main/master)

### Build Settings
- [ ] Base directory: `userfrontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `userfrontend/dist`
- [ ] Node version: 18

### Environment Variables
- [ ] `VITE_API_URL` = `https://[YOUR-BACKEND].onrender.com/api`
- [ ] `VITE_SOCKET_URL` = `https://[YOUR-BACKEND].onrender.com`
- [ ] `VITE_STRIPE_PUBLIC_KEY` = [Your key]
- [ ] `VITE_RAZORPAY_KEY_ID` = [Your key]

### Deployment & Testing
- [ ] Site deployed successfully
- [ ] Build completed without errors
- [ ] Site name changed to: `restaurant-customer`
- [ ] Customer URL: `https://restaurant-customer.netlify.app`
- [ ] Site loads correctly
- [ ] No console errors in browser
- [ ] Can browse menu
- [ ] Login/signup works

---

## 👨‍💼 Staff Frontend Deployment (Netlify)

### Netlify Setup - Staff App
- [ ] New Netlify site created
- [ ] Repository connected
- [ ] Branch selected

### Build Settings
- [ ] Base directory: `staffmanagement`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `staffmanagement/dist`
- [ ] Node version: 18

### Environment Variables
- [ ] `VITE_API_URL` = `https://[YOUR-BACKEND].onrender.com/api`
- [ ] `VITE_SOCKET_URL` = `https://[YOUR-BACKEND].onrender.com`

### Deployment & Testing
- [ ] Site deployed successfully
- [ ] Build completed without errors
- [ ] Site name changed to: `restaurant-staff`
- [ ] Staff URL: `https://restaurant-staff.netlify.app`
- [ ] Site loads correctly
- [ ] Staff login works
- [ ] Can view orders

---

## 🎛️ Admin Frontend Deployment (Netlify)

### Netlify Setup - Admin App
- [ ] New Netlify site created
- [ ] Repository connected
- [ ] Branch selected

### Build Settings
- [ ] Base directory: `admin-folder-main`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `admin-folder-main/dist`
- [ ] Node version: 18

### Environment Variables
- [ ] `VITE_API_URL` = `https://[YOUR-BACKEND].onrender.com/api`
- [ ] `VITE_SOCKET_URL` = `https://[YOUR-BACKEND].onrender.com`

### Deployment & Testing
- [ ] Site deployed successfully
- [ ] Build completed without errors
- [ ] Site name changed to: `restaurant-admin`
- [ ] Admin URL: `https://restaurant-admin.netlify.app`
- [ ] Site loads correctly
- [ ] Admin login works
- [ ] Dashboard shows correctly
- [ ] Can manage menu items

---

## 🔄 Post-Deployment Configuration

### Update Backend with Frontend URLs
- [ ] Logged into Render dashboard
- [ ] Opened backend service
- [ ] Updated environment variables:
  - [ ] `CUSTOMER_FRONTEND_URL` = `https://restaurant-customer.netlify.app`
  - [ ] `ADMIN_FRONTEND_URL` = `https://restaurant-admin.netlify.app`
  - [ ] `STAFF_FRONTEND_URL` = `https://restaurant-staff.netlify.app`
- [ ] Service redeployed automatically
- [ ] Verified CORS works (no errors in browser console)

### Update Local Code (Optional)
- [ ] Updated `backend/server.js` with production URLs
- [ ] Updated `.env.production` files
- [ ] Committed changes
- [ ] Pushed to repository
- [ ] Services auto-deployed

---

## 🧪 Complete System Testing

### Customer Flow Testing
- [ ] Open customer app
- [ ] Create account / Login
- [ ] Browse menu
- [ ] Filter by category
- [ ] Search for items
- [ ] Add items to cart
- [ ] Place order
- [ ] Make payment (test mode)
- [ ] View order status
- [ ] Check order history

### Staff Flow Testing
- [ ] Open staff app
- [ ] Staff login works
- [ ] See pending orders
- [ ] Update order status
- [ ] Check real-time updates

### Admin Flow Testing
- [ ] Open admin app
- [ ] Admin login works
- [ ] Dashboard shows analytics
- [ ] Add/edit menu items
- [ ] Generate QR codes
- [ ] Download QR codes
- [ ] View all orders
- [ ] Update order status
- [ ] Export reports (PDF/Excel)
- [ ] Manage staff
- [ ] Add expenses
- [ ] Create promo codes
- [ ] View customer support tickets

### Real-time Features Testing
- [ ] Open customer + admin in different browsers
- [ ] Place order from customer
- [ ] Verify admin receives notification
- [ ] Update status from admin
- [ ] Verify customer sees update
- [ ] Check WebSocket connection (no errors)

### Cross-Browser Testing
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (if Mac)
- [ ] Edge (if Windows)
- [ ] Mobile browser (Chrome/Safari)

### Mobile Responsiveness
- [ ] Customer app on mobile (430px design)
- [ ] Staff app on mobile
- [ ] Admin app on tablet/desktop

---

## 🔒 Security Verification

### Environment Variables
- [ ] No secrets in code (all in env vars)
- [ ] Production keys different from test keys
- [ ] `.env` files not committed to Git
- [ ] Strong JWT secret (32+ characters)

### Database Security
- [ ] MongoDB user has strong password
- [ ] Network access properly configured
- [ ] Database backup enabled (optional)

### API Security
- [ ] CORS only allows specified origins
- [ ] JWT authentication working
- [ ] Protected routes working
- [ ] File upload validation working

### SSL/HTTPS
- [ ] Backend uses HTTPS (Render provides)
- [ ] Frontends use HTTPS (Netlify provides)
- [ ] All API calls use HTTPS
- [ ] No mixed content warnings

---

## 📈 Performance Verification

### Load Times
- [ ] Customer app loads < 3 seconds
- [ ] Staff app loads < 3 seconds
- [ ] Admin app loads < 3 seconds
- [ ] API responses < 500ms (check Network tab)

### Backend Performance
- [ ] No memory leaks (check Render metrics)
- [ ] Database queries optimized
- [ ] File uploads working

---

## 🎉 Go Live Checklist

### Pre-Launch
- [ ] All features tested and working
- [ ] Real payment keys configured (if going live)
- [ ] Terms & Privacy policy added (if required)
- [ ] Support contact info updated
- [ ] Restaurant branding/logo updated

### Launch Day
- [ ] Create admin account
- [ ] Upload real menu items
- [ ] Set correct prices
- [ ] Upload menu images
- [ ] Generate QR codes for all tables
- [ ] Print QR codes
- [ ] Place QR codes on tables
- [ ] Train staff on system
- [ ] Test with real orders

### Post-Launch
- [ ] Monitor error logs
- [ ] Check payment transactions
- [ ] Respond to customer feedback
- [ ] Monitor performance metrics
- [ ] Plan for scaling if needed

---

## 📊 URLs & Credentials Record

**Keep this information secure!**

### Deployment URLs
- **Backend API:** `https://______________________.onrender.com`
- **API Docs:** `https://______________________.onrender.com/api/docs`
- **Customer App:** `https://______________________.netlify.app`
- **Staff App:** `https://______________________.netlify.app`
- **Admin App:** `https://______________________.netlify.app`

### Database
- **MongoDB Cluster:** `restaurant-cluster`
- **Database Name:** `restaurant_db`
- **Connection String:** `mongodb+srv://...` (stored securely)

### Admin Credentials
- **Email:** `________________________`
- **Password:** `________________________` (stored securely)

### Payment Gateways
- **Razorpay Mode:** [ ] Test [ ] Live
- **Stripe Mode:** [ ] Test [ ] Live

---

## 🆘 Troubleshooting Reference

If issues occur, check:
1. **DEPLOYMENT_GUIDE.md** - Full troubleshooting section
2. **Browser Console** - For frontend errors
3. **Render Logs** - For backend errors
4. **Network Tab** - For API call issues
5. **Netlify Deploy Log** - For build errors

---

## 💡 Next Steps After Deployment

- [ ] Set up monitoring (optional: New Relic, Sentry)
- [ ] Configure automated backups
- [ ] Set up custom domains (optional)
- [ ] Enable analytics (optional: Google Analytics)
- [ ] Create user documentation
- [ ] Train restaurant staff
- [ ] Collect user feedback
- [ ] Plan feature updates

---

**Deployment Status:** [ ] In Progress [ ] Testing [ ] ✅ Live

**Deployment Date:** __________

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

---

*Checklist Version 1.0 - Use this to track your deployment progress*
