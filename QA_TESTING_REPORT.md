# 🧪 QA Testing Report
## Restaurant QR Code System — Full-Stack Application

---

| Field               | Details                                      |
|---------------------|----------------------------------------------|
| **Report Title**    | QA Testing Report — Restaurant QR Code System |
| **Prepared By**     | Senior Full-Stack Developer                  |
| **Report Date**     | February 18, 2026                            |
| **Project Version** | v1.0 (Production Release Candidate)          |
| **Report Type**     | Pre-Production QA Handoff Report             |
| **Status**          | 🟡 Ready for QA Testing                      |

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Modules Under Test](#3-application-modules-under-test)
4. [Test Environment Setup](#4-test-environment-setup)
5. [Functional Test Cases](#5-functional-test-cases)
   - 5.1 Customer Frontend (userfrontend)
   - 5.2 Staff Management App (staffmanagement)
   - 5.3 Admin Dashboard (admin-folder-main)
   - 5.4 Backend API
   - 5.5 Real-time (WebSocket / Socket.IO)
   - 5.6 Payment Gateway
6. [Non-Functional Test Cases](#6-non-functional-test-cases)
   - 6.1 Performance Testing
   - 6.2 Security Testing
   - 6.3 Responsive / Cross-Device Testing
   - 6.4 Cross-Browser Testing
   - 6.5 Accessibility Testing
7. [API Testing Reference](#7-api-testing-reference)
8. [Known Issues & Risk Register](#8-known-issues--risk-register)
9. [Test Execution Matrix](#9-test-execution-matrix)
10. [QA Sign-Off Checklist](#10-qa-sign-off-checklist)

---

## 1. Project Overview

The **Restaurant QR Code System** is a full-stack, production-ready restaurant management platform. It enables customers to scan QR codes at their tables, browse a digital menu, place orders, and make payments — all from their mobile browser. Restaurant staff and administrators are served by dedicated management interfaces.

### System Components

| Component              | Technology          | Port (Local) | Deployment Target |
|------------------------|---------------------|--------------|-------------------|
| Customer Frontend      | React 19 + Vite     | 5173         | Netlify           |
| Staff Management App   | React 19 + Vite     | 5174         | Netlify           |
| Admin Dashboard        | React 19 + Vite     | 5175         | Netlify           |
| Backend API            | Node.js + Express 5 | 5001         | Render            |
| Database               | MongoDB             | 27017        | MongoDB Atlas     |

---

## 2. Technology Stack

### Frontend (All 3 Apps)

| Library / Tool       | Version    | Purpose                        |
|----------------------|------------|--------------------------------|
| React                | 19.2.0     | UI Framework                   |
| Vite                 | 7.2.4      | Build Tool & Dev Server        |
| Tailwind CSS         | 3.4.17 / 4.1.18 | Styling                   |
| React Router DOM     | 7.11.0     | Client-side Routing            |
| Axios                | 1.13.2     | HTTP API Client                |
| Socket.IO Client     | 4.8.3      | Real-time WebSocket            |
| Framer Motion        | 12.24      | Animations (Customer App)      |
| Recharts             | 3.6.0      | Data Charts (Admin)            |
| jsPDF + autoTable    | 3.0.4      | PDF Export (Admin)             |
| React Hot Toast      | 2.6.0      | Toast Notifications            |
| Lucide React         | Latest     | Icon Library                   |
| HTML5 QR Code        | Latest     | QR Scanner (Customer App)      |

### Backend

| Library / Tool       | Version    | Purpose                        |
|----------------------|------------|--------------------------------|
| Node.js              | LTS        | Runtime Environment            |
| Express.js           | 5.2.1      | Web Framework                  |
| Mongoose             | 9.1.3      | MongoDB ODM                    |
| Socket.IO            | 4.8.3      | WebSocket Server               |
| JSON Web Token       | 9.0.3      | Authentication                 |
| Bcrypt.js            | 3.0.3      | Password Hashing               |
| Multer               | 1.4.5      | File Upload Handling           |
| QRCode               | 1.5.4      | QR Code Generation             |
| Razorpay SDK         | 2.9.6      | Indian Payment Gateway         |
| Stripe SDK           | 12.10.0    | International Payments         |
| Winston              | 3.9.0      | Structured Logging             |
| Node-Cron            | 3.0.2      | Scheduled Tasks                |
| Swagger              | Latest     | API Documentation              |

---

## 3. Application Modules Under Test

### 3.1 Customer Frontend (`userfrontend`)
- QR Code Scanning & Table Session
- Menu Browsing (Categories, Filters, Search)
- Shopping Cart Management
- User Authentication (Register / Login)
- Order Placement & Tracking
- Payment Processing (Stripe / Razorpay)
- Order History
- Real-time Order Status Updates

### 3.2 Staff Management App (`staffmanagement`)
- Staff Login / Authentication
- Live Order Dashboard
- Order Status Updates (Pending → Preparing → Ready → Delivered)
- Real-time Notifications
- Table Management View
- Quick Order Entry

### 3.3 Admin Dashboard (`admin-folder-main`)
- Admin Login & Protected Routes
- Overview Dashboard (Revenue, Orders, Charts)
- Menu Management (CRUD + Image Upload)
- QR Code Management (Generate / Download / Reset)
- Order Tracking (All Tables, Real-time)
- Staff Management (Add / Remove / Permissions)
- Expense Tracking
- Sales Reports (Daily / Weekly / Monthly, PDF / Excel Export)
- Table Management (Zones, Capacity)
- Promo Code Management
- Offer Management
- Bill Generation
- Support Ticket System
- Hotel Profile Settings

### 3.4 Backend API
- 14 RESTful Route Groups
- JWT Authentication & RBAC
- File Upload (Multer)
- Payment Webhooks
- Scheduled Report Generation (Node-Cron)
- API Documentation (Swagger at `/api/docs`)

---

## 4. Test Environment Setup

### 4.1 Local Development Environment

```
OS:              Windows 10/11
Node.js:         v18+ (LTS recommended)
MongoDB:         Local (Port 27017) OR MongoDB Atlas
Browser:         Chrome 120+, Firefox 120+, Edge 120+, Safari 17+
Mobile Device:   Android (Chrome) / iOS (Safari) for QR scan testing
```

### 4.2 Environment Variables Required (Backend)

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/restaurant_db
JWT_SECRET=<strong_random_secret>
FRONTEND_URL=http://localhost:5173
CUSTOMER_FRONTEND_URL=http://localhost:5173
ENCRYPTION_KEY=s3cur3_3ncr_k3y_for_qr_codes_32c
RAZORPAY_KEY_ID=rzp_test_<your_key>
RAZORPAY_KEY_SECRET=<your_secret>
STRIPE_SECRET_KEY=<your_stripe_key>
```

### 4.3 Starting the Applications

```bash
# Backend
cd backend
npm install
npm start          # Runs on http://localhost:5001

# Customer Frontend
cd userfrontend
npm install
npm run dev        # Runs on http://localhost:5173

# Staff App
cd staffmanagement
npm install
npm run dev        # Runs on http://localhost:5174

# Admin Dashboard
cd admin-folder-main
npm install
npm run dev        # Runs on http://localhost:5175
```

### 4.4 Test Accounts

| Role     | Email                    | Password      | Notes                         |
|----------|--------------------------|---------------|-------------------------------|
| Admin    | admin@restaurant.com     | Admin@123     | Use `verify_admin.js` to set  |
| Staff    | staff@restaurant.com     | Staff@123     | Use `verify_staff.js` to set  |
| Customer | customer@test.com        | Test@123      | Register via Customer App     |

---

## 5. Functional Test Cases

> **Legend:** ✅ Pass | ❌ Fail | ⚠️ Partial | 🔲 Not Tested

---

### 5.1 Customer Frontend — Test Cases

#### TC-CU-001: QR Code Scanning
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Open Customer App on mobile browser | App loads within 3 seconds | 🔲 |
| 2 | Tap "Scan QR Code" button | Camera permission prompt appears | 🔲 |
| 3 | Grant camera permission | Camera view opens | 🔲 |
| 4 | Point camera at a valid table QR code | QR decoded; table session created | 🔲 |
| 5 | Point camera at an invalid/expired QR | Error message shown: "Invalid QR Code" | 🔲 |
| 6 | Verify URL contains table number after scan | URL includes `?table=<tableNo>` | 🔲 |

#### TC-CU-002: Menu Browsing
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Open menu after QR scan | All menu categories load | 🔲 |
| 2 | Click on a category (e.g., "Starters") | Items filtered to selected category | 🔲 |
| 3 | Toggle "Veg Only" filter | Only vegetarian items displayed | 🔲 |
| 4 | Toggle "Non-Veg" filter | Only non-vegetarian items displayed | 🔲 |
| 5 | Type in search bar | Real-time search results appear | 🔲 |
| 6 | Search for a non-existent item | "No items found" message displayed | 🔲 |
| 7 | Click on a menu item | Item detail/description shown | 🔲 |

#### TC-CU-003: Shopping Cart
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Click "Add to Cart" on a menu item | Item added; cart count increments | 🔲 |
| 2 | Add the same item again | Quantity increases by 1 | 🔲 |
| 3 | Open cart | All added items listed with correct prices | 🔲 |
| 4 | Increase item quantity in cart | Subtotal updates correctly | 🔲 |
| 5 | Decrease item quantity to 0 | Item removed from cart | 🔲 |
| 6 | Remove item using delete button | Item removed; total recalculated | 🔲 |
| 7 | Apply a valid promo code | Discount applied; total reduced | 🔲 |
| 8 | Apply an invalid/expired promo code | Error: "Invalid or expired promo code" | 🔲 |
| 9 | Verify cart persists on page refresh | Cart items retained (localStorage) | 🔲 |

#### TC-CU-004: User Authentication
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Click "Sign Up" | Registration form opens | 🔲 |
| 2 | Register with valid details | Account created; auto-logged in | 🔲 |
| 3 | Register with existing email | Error: "Email already registered" | 🔲 |
| 4 | Register with invalid email format | Validation error shown | 🔲 |
| 5 | Login with valid credentials | Redirected to menu/home | 🔲 |
| 6 | Login with wrong password | Error: "Invalid credentials" | 🔲 |
| 7 | Login with unregistered email | Error: "User not found" | 🔲 |
| 8 | Logout | Session cleared; redirected to login | 🔲 |
| 9 | Access protected page without login | Redirected to login page | 🔲 |

#### TC-CU-005: Order Placement
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Add items to cart and click "Place Order" | Order confirmation screen shown | 🔲 |
| 2 | Place order as guest (no login) | Guest info form appears (name, phone) | 🔲 |
| 3 | Place order as logged-in user | Order placed using profile info | 🔲 |
| 4 | Verify order appears in Order History | Order listed with correct details | 🔲 |
| 5 | Verify real-time notification to Staff App | Staff sees new order notification | 🔲 |
| 6 | Verify real-time notification to Admin | Admin dashboard shows new order | 🔲 |
| 7 | Track order status in real-time | Status updates: Pending → Preparing → Ready | 🔲 |

#### TC-CU-006: Payment Processing
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Select "Pay Online" (Razorpay) | Razorpay checkout modal opens | 🔲 |
| 2 | Complete payment with test card | Payment success; order marked "paid" | 🔲 |
| 3 | Cancel payment midway | Order remains in "pending payment" state | 🔲 |
| 4 | Select "Cash on Delivery" | Order placed with COD payment method | 🔲 |
| 5 | Verify payment webhook updates order | Order status updated via webhook | 🔲 |
| 6 | Test Stripe payment flow | Stripe checkout opens and processes | 🔲 |

---

### 5.2 Staff Management App — Test Cases

#### TC-ST-001: Staff Authentication
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Open Staff App at localhost:5174 | Login page displayed | 🔲 |
| 2 | Login with valid staff credentials | Redirected to Order Dashboard | 🔲 |
| 3 | Login with invalid credentials | Error message shown | 🔲 |
| 4 | Access dashboard without login | Redirected to login | 🔲 |
| 5 | Logout from staff app | Session cleared; back to login | 🔲 |

#### TC-ST-002: Order Management
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | View live order dashboard | All pending orders displayed | 🔲 |
| 2 | Receive real-time new order notification | Toast notification + order appears | 🔲 |
| 3 | Update order status to "Preparing" | Status changes; customer notified | 🔲 |
| 4 | Update order status to "Ready" | Status changes; customer notified | 🔲 |
| 5 | Update order status to "Delivered" | Order marked complete | 🔲 |
| 6 | Filter orders by table number | Correct orders shown | 🔲 |
| 7 | View order item details | All items, quantities, prices shown | 🔲 |

---

### 5.3 Admin Dashboard — Test Cases

#### TC-AD-001: Admin Authentication
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Open Admin App at localhost:5175 | Login page displayed | 🔲 |
| 2 | Login with valid admin credentials | Redirected to Dashboard | 🔲 |
| 3 | Login with non-admin credentials | Access denied / error shown | 🔲 |
| 4 | Access admin route without token | Redirected to login | 🔲 |
| 5 | Logout | Session cleared | 🔲 |

#### TC-AD-002: Dashboard Overview
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | View Dashboard tab | Revenue, orders, charts load | 🔲 |
| 2 | Verify today's order count | Matches actual orders placed | 🔲 |
| 3 | Verify revenue chart | Chart renders with correct data | 🔲 |
| 4 | Verify real-time order updates | New orders appear without refresh | 🔲 |

#### TC-AD-003: Menu Management
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Navigate to Menu Management | All menu items listed | 🔲 |
| 2 | Add a new menu item with image | Item saved; appears in customer menu | 🔲 |
| 3 | Add item without required fields | Validation error shown | 🔲 |
| 4 | Edit an existing menu item | Changes saved and reflected | 🔲 |
| 5 | Toggle item availability (on/off) | Item hidden/shown in customer menu | 🔲 |
| 6 | Delete a menu item | Item removed from all menus | 🔲 |
| 7 | Upload image > allowed size | Error: "File too large" | 🔲 |
| 8 | Upload non-image file | Error: "Invalid file type" | 🔲 |

#### TC-AD-004: QR Code Management
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Navigate to QR Code Management | Existing QR codes listed | 🔲 |
| 2 | Generate QR codes for 5 tables | 5 QR codes generated with table IDs | 🔲 |
| 3 | Download a single QR code | PNG file downloaded | 🔲 |
| 4 | Download all QR codes (ZIP) | ZIP file with all QR PNGs downloaded | 🔲 |
| 5 | Reset a QR code | Old QR invalidated; new one generated | 🔲 |
| 6 | Scan generated QR with customer app | Correct table session created | 🔲 |

#### TC-AD-005: Order Tracking
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Navigate to Order Tracking | All active orders displayed | 🔲 |
| 2 | Filter by order status | Correct orders shown | 🔲 |
| 3 | View order details | Full item list, amounts, customer info | 🔲 |
| 4 | Update order status from admin | Status updates in real-time | 🔲 |

#### TC-AD-006: Staff Management
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Navigate to Staff Management | Staff list displayed | 🔲 |
| 2 | Add a new staff member | Staff created; can login to Staff App | 🔲 |
| 3 | Add staff with duplicate email | Error: "Email already exists" | 🔲 |
| 4 | Edit staff details | Changes saved | 🔲 |
| 5 | Remove a staff member | Staff deleted; login blocked | 🔲 |

#### TC-AD-007: Reports & Exports
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Navigate to Reports | Report options displayed | 🔲 |
| 2 | Generate Daily Sales Report | Report with today's data generated | 🔲 |
| 3 | Generate Weekly Report | 7-day data report generated | 🔲 |
| 4 | Export report as PDF | PDF downloaded with correct data | 🔲 |
| 5 | Export report as Excel | XLSX file downloaded | 🔲 |
| 6 | Generate Expense Report | Expense data categorized correctly | 🔲 |

#### TC-AD-008: Promo Codes & Offers
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Create a new promo code (10% off) | Code saved; usable in customer app | 🔲 |
| 2 | Set expiry date on promo code | Code rejected after expiry | 🔲 |
| 3 | Delete a promo code | Code no longer valid | 🔲 |
| 4 | Create a new offer/promotion | Offer visible in customer menu | 🔲 |
| 5 | Deactivate an offer | Offer hidden from customers | 🔲 |

#### TC-AD-009: Hotel Profile Settings
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Navigate to Hotel Profile | Current profile info displayed | 🔲 |
| 2 | Update restaurant name | Name updated across the app | 🔲 |
| 3 | Update contact information | Contact info saved | 🔲 |
| 4 | Upload restaurant logo | Logo updated | 🔲 |

---

### 5.4 Backend API — Test Cases

> **Tool Recommended:** Postman or Insomnia  
> **Base URL (Local):** `http://localhost:5001`  
> **API Docs:** `http://localhost:5001/api/docs`

#### TC-API-001: Authentication Endpoints
| # | Endpoint | Method | Test Input | Expected Response | Status |
|---|----------|--------|------------|-------------------|--------|
| 1 | `/api/auth/register` | POST | Valid user data | 201 + JWT token | 🔲 |
| 2 | `/api/auth/register` | POST | Duplicate email | 400 + error message | 🔲 |
| 3 | `/api/auth/login` | POST | Valid credentials | 200 + JWT token | 🔲 |
| 4 | `/api/auth/login` | POST | Wrong password | 401 Unauthorized | 🔲 |
| 5 | `/api/auth/staff/login` | POST | Valid staff creds | 200 + JWT token | 🔲 |
| 6 | `/api/auth/me` | GET | Valid JWT header | 200 + user profile | 🔲 |
| 7 | `/api/auth/me` | GET | No/invalid token | 401 Unauthorized | 🔲 |

#### TC-API-002: Menu Endpoints
| # | Endpoint | Method | Auth | Expected Response | Status |
|---|----------|--------|------|-------------------|--------|
| 1 | `/api/menu` | GET | None | 200 + menu array | 🔲 |
| 2 | `/api/menu` | POST | Admin JWT | 201 + new item | 🔲 |
| 3 | `/api/menu` | POST | No auth | 401 Unauthorized | 🔲 |
| 4 | `/api/menu/:id` | PUT | Admin JWT | 200 + updated item | 🔲 |
| 5 | `/api/menu/:id` | DELETE | Admin JWT | 200 + success | 🔲 |
| 6 | `/api/menu/:id` | DELETE | Staff JWT | 403 Forbidden | 🔲 |

#### TC-API-003: Order Endpoints
| # | Endpoint | Method | Auth | Expected Response | Status |
|---|----------|--------|------|-------------------|--------|
| 1 | `/api/orders` | POST | Customer JWT | 201 + order object | 🔲 |
| 2 | `/api/orders` | GET | Admin/Staff JWT | 200 + orders array | 🔲 |
| 3 | `/api/orders/:id` | GET | Valid JWT | 200 + order details | 🔲 |
| 4 | `/api/orders/:id/status` | PUT | Staff/Admin JWT | 200 + updated status | 🔲 |
| 5 | `/api/orders/:id/status` | PUT | Customer JWT | 403 Forbidden | 🔲 |
| 6 | `/api/orders/request-bill` | POST | Customer JWT | 200 + bill request | 🔲 |

#### TC-API-004: QR Code Endpoints
| # | Endpoint | Method | Auth | Expected Response | Status |
|---|----------|--------|------|-------------------|--------|
| 1 | `/api/qrcodes` | GET | Admin JWT | 200 + QR list | 🔲 |
| 2 | `/api/qrcodes/generate` | POST | Admin JWT | 201 + QR codes | 🔲 |
| 3 | `/api/qrcodes/reset` | POST | Admin JWT | 200 + new QR codes | 🔲 |
| 4 | `/api/qrcodes/download` | GET | Admin JWT | File download | 🔲 |

#### TC-API-005: Payment Endpoints
| # | Endpoint | Method | Auth | Expected Response | Status |
|---|----------|--------|------|-------------------|--------|
| 1 | `/api/payments/create-order` | POST | Customer JWT | 200 + payment order | 🔲 |
| 2 | `/api/payments/verify` | POST | Customer JWT | 200 + verification | 🔲 |
| 3 | `/api/payments/webhook` | POST | Webhook secret | 200 + processed | 🔲 |
| 4 | `/api/razorpay/create-order` | POST | Customer JWT | 200 + Razorpay order | 🔲 |

---

### 5.5 Real-time (Socket.IO) — Test Cases

#### TC-RT-001: WebSocket Connection
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Open Customer App | Socket.IO connects to backend | 🔲 |
| 2 | Open Staff App | Socket.IO connects; joins staff room | 🔲 |
| 3 | Open Admin App | Socket.IO connects; joins admin room | 🔲 |
| 4 | Check browser console for socket errors | No connection errors | 🔲 |

#### TC-RT-002: Real-time Order Events
| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Customer places order | Staff App shows toast + new order card | 🔲 |
| 2 | Customer places order | Admin Dashboard shows new order | 🔲 |
| 3 | Staff updates order to "Preparing" | Customer sees status change instantly | 🔲 |
| 4 | Staff updates order to "Ready" | Customer sees "Your order is ready!" | 🔲 |
| 5 | Customer requests bill | Staff receives bill request notification | 🔲 |
| 6 | Disconnect and reconnect | Socket reconnects automatically | 🔲 |

---

### 5.6 Payment Gateway — Test Cases

#### TC-PAY-001: Razorpay (Test Mode)

> **Test Card:** 4111 1111 1111 1111 | Expiry: Any future | CVV: Any 3 digits  
> **Test UPI:** success@razorpay

| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Select Razorpay payment at checkout | Razorpay modal opens | 🔲 |
| 2 | Complete payment with test card | Payment success; order updated to "paid" | 🔲 |
| 3 | Complete payment with test UPI | Payment success | 🔲 |
| 4 | Simulate payment failure | Order stays "payment pending" | 🔲 |
| 5 | Close Razorpay modal without paying | Order not marked paid | 🔲 |

#### TC-PAY-002: Stripe (Test Mode)

> **Test Card:** 4242 4242 4242 4242 | Expiry: Any future | CVV: Any 3 digits

| # | Test Step | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Select Stripe payment at checkout | Stripe checkout opens | 🔲 |
| 2 | Complete payment with test card | Payment success; order updated | 🔲 |
| 3 | Use declined test card (4000 0000 0000 0002) | Payment declined; error shown | 🔲 |

---

## 6. Non-Functional Test Cases

### 6.1 Performance Testing

#### Target Benchmarks (from Architecture Diagram)

| Metric                  | Target        | Tool to Use          |
|-------------------------|---------------|----------------------|
| Frontend Load Time      | < 3 seconds   | Lighthouse / GTmetrix |
| API Response Time       | < 500ms       | Postman / k6         |
| Database Query Time     | < 100ms       | MongoDB Compass      |
| WebSocket Latency       | < 50ms        | Browser DevTools     |
| Customer App Bundle     | ~500KB gzipped| Vite Build Analyzer  |
| Concurrent Users        | 100+          | k6 / Artillery       |

#### TC-PERF-001: Load Time Tests
| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Customer App initial load (cold) | < 3 seconds | 🔲 |
| 2 | Customer App load (cached) | < 1 second | 🔲 |
| 3 | Admin Dashboard initial load | < 4 seconds | 🔲 |
| 4 | Menu API response time | < 500ms | 🔲 |
| 5 | Order creation API response | < 500ms | 🔲 |
| 6 | 50 concurrent order requests | No errors; avg < 1s | 🔲 |

#### TC-PERF-002: Backend Sleep (Free Tier)
| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Access backend after 15 min idle | Cold start < 30 seconds | 🔲 |
| 2 | First API call after cold start | Response received (may be slow) | 🔲 |

---

### 6.2 Security Testing

#### TC-SEC-001: Authentication Security
| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Access admin API without JWT | 401 Unauthorized | 🔲 |
| 2 | Use expired JWT token | 401 Unauthorized | 🔲 |
| 3 | Use customer JWT on admin endpoint | 403 Forbidden | 🔲 |
| 4 | Use staff JWT on admin endpoint | 403 Forbidden | 🔲 |
| 5 | Tamper with JWT payload | 401 Invalid token | 🔲 |

#### TC-SEC-002: Input Validation & Injection
| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Submit `<script>alert(1)</script>` in name field | Input sanitized; no XSS | 🔲 |
| 2 | Submit MongoDB injection `{"$gt":""}` in login | Rejected; no bypass | 🔲 |
| 3 | Upload `.exe` file as menu image | Error: "Invalid file type" | 🔲 |
| 4 | Upload 50MB image file | Error: "File too large" | 🔲 |
| 5 | Send empty required fields to API | 400 Validation error | 🔲 |

#### TC-SEC-003: CORS & Headers
| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | API request from unauthorized origin | CORS error / 403 | 🔲 |
| 2 | Check HTTPS in production | All traffic over HTTPS | 🔲 |
| 3 | Check security headers (X-Frame-Options, etc.) | Headers present | 🔲 |

#### TC-SEC-004: Password Security
| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Register with weak password (< 6 chars) | Validation error | 🔲 |
| 2 | Verify password stored as bcrypt hash | DB shows hashed value, not plaintext | 🔲 |
| 3 | Brute force login (10+ attempts) | Rate limiting or lockout (if implemented) | 🔲 |

---

### 6.3 Responsive / Cross-Device Testing

#### TC-RESP-001: Customer App (Mobile-First, 430px locked)
| # | Device / Viewport | Expected | Status |
|---|-------------------|----------|--------|
| 1 | iPhone 14 (390px) | Full layout visible; no overflow | 🔲 |
| 2 | Samsung Galaxy S23 (360px) | Layout correct | 🔲 |
| 3 | iPad (768px) | Centered 430px view; no distortion | 🔲 |
| 4 | Desktop (1920px) | Centered mobile view displayed | 🔲 |
| 5 | Bottom navigation bar | All 4 tabs visible and tappable | 🔲 |

#### TC-RESP-002: Admin Dashboard (Desktop-First)
| # | Device / Viewport | Expected | Status |
|---|-------------------|----------|--------|
| 1 | Desktop 1920x1080 | Full dashboard visible | 🔲 |
| 2 | Laptop 1366x768 | All panels visible; no overflow | 🔲 |
| 3 | Tablet 768px | Sidebar collapses; content readable | 🔲 |
| 4 | Mobile 375px | Basic usability maintained | 🔲 |

#### TC-RESP-003: Staff App
| # | Device / Viewport | Expected | Status |
|---|-------------------|----------|--------|
| 1 | Tablet (768px) | Order cards visible; status buttons accessible | 🔲 |
| 2 | Desktop (1280px) | Full layout | 🔲 |
| 3 | Mobile (375px) | Usable; no critical overflow | 🔲 |

---

### 6.4 Cross-Browser Testing

| Browser          | Version | Customer App | Staff App | Admin App | Status |
|------------------|---------|--------------|-----------|-----------|--------|
| Chrome           | 120+    | 🔲           | 🔲        | 🔲        | 🔲     |
| Firefox          | 120+    | 🔲           | 🔲        | 🔲        | 🔲     |
| Microsoft Edge   | 120+    | 🔲           | 🔲        | 🔲        | 🔲     |
| Safari (macOS)   | 17+     | 🔲           | 🔲        | 🔲        | 🔲     |
| Safari (iOS)     | 17+     | 🔲           | 🔲        | 🔲        | 🔲     |
| Chrome (Android) | 120+    | 🔲           | 🔲        | 🔲        | 🔲     |

**Key items to verify per browser:**
- QR code scanner functionality (camera API)
- Socket.IO WebSocket connection
- Payment gateway modals (Razorpay / Stripe)
- PDF/Excel download functionality
- CSS rendering (Tailwind v3 vs v4 beta)

---

### 6.5 Accessibility Testing

| # | Test | Tool | Expected | Status |
|---|------|------|----------|--------|
| 1 | Run Lighthouse Accessibility audit on Customer App | Chrome Lighthouse | Score ≥ 80 | 🔲 |
| 2 | Run Lighthouse Accessibility audit on Admin App | Chrome Lighthouse | Score ≥ 75 | 🔲 |
| 3 | Verify all images have `alt` attributes | Manual / axe DevTools | All images have alt text | 🔲 |
| 4 | Verify form labels are associated with inputs | Manual | All inputs labeled | 🔲 |
| 5 | Keyboard navigation through Customer App | Manual | Tab order logical | 🔲 |
| 6 | Color contrast ratio check | axe DevTools | WCAG AA (4.5:1 min) | 🔲 |
| 7 | Check focus indicators on interactive elements | Manual | Visible focus ring | 🔲 |

---

## 7. API Testing Reference

### Postman Collection Setup

**Base URL Variables:**
```
local_base_url: http://localhost:5001
prod_base_url: https://your-render-url.onrender.com
```

**Authentication Header:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

### Key API Endpoints Summary

| Route Group         | Base Path            | Key Operations                    |
|---------------------|----------------------|-----------------------------------|
| Authentication      | `/api/auth`          | register, login, staff/login, me  |
| Menu                | `/api/menu`          | CRUD menu items                   |
| Orders              | `/api/orders`        | create, list, status update, bill |
| QR Codes            | `/api/qrcodes`       | generate, download, reset         |
| Payments (Stripe)   | `/api/payments`      | create-order, verify, webhook     |
| Payments (Razorpay) | `/api/razorpay`      | create-order, verify, webhook     |
| Promo Codes         | `/api/promocodes`    | CRUD, validate                    |
| Offers              | `/api/offers`        | CRUD                              |
| Expenses            | `/api/expenses`      | CRUD, report                      |
| Hotel Profile       | `/api/hotel`         | get/update profile                |
| Notifications       | `/api/notifications` | list, create, mark-read           |
| Support Tickets     | `/api/support`       | CRUD tickets                      |
| Events              | `/api/events`        | CRUD                              |
| Shifts              | `/api/shifts`        | clock-in, clock-out               |
| API Docs            | `/api/docs`          | Swagger UI                        |

---

## 8. Known Issues & Risk Register

### 8.1 Confirmed Known Issues

| ID     | Module          | Issue Description                                         | Severity | Status     |
|--------|-----------------|-----------------------------------------------------------|----------|------------|
| KI-001 | Backend         | Debug files (crash.log, error_log.txt) committed to repo  | Low      | Open       |
| KI-002 | Backend         | No automated test files (Jest configured but unused)      | Medium   | Open       |
| KI-003 | Backend         | Rate limiting not implemented                             | High     | Open       |
| KI-004 | Backend         | File uploads stored on local filesystem (not cloud)       | High     | Open       |
| KI-005 | Backend         | ESLint not configured for backend                         | Low      | Open       |
| KI-006 | Admin Dashboard | Tailwind CSS v4 Beta used (may have instability)          | Medium   | Monitor    |
| KI-007 | Customer App    | 430px locked width — verify UX on very small screens      | Medium   | Open       |
| KI-008 | All Apps        | No database indexing review done                          | Medium   | Open       |
| KI-009 | Backend         | Render free tier sleeps after 15 min inactivity           | Medium   | By Design  |
| KI-010 | Payment         | Razorpay/Stripe in test mode — production keys needed     | High     | Pre-launch |

### 8.2 Risk Register

| Risk ID | Risk Description                              | Probability | Impact | Mitigation                                    |
|---------|-----------------------------------------------|-------------|--------|-----------------------------------------------|
| R-001   | Payment webhook failure in production         | Medium      | High   | Test webhooks with ngrok locally; add retry   |
| R-002   | Socket.IO disconnects under load              | Low         | High   | Test with 50+ concurrent users; add reconnect |
| R-003   | MongoDB Atlas free tier (512MB) storage limit | Medium      | Medium | Monitor storage; plan upgrade                 |
| R-004   | QR code encryption key exposed in .env        | Low         | High   | Use secrets manager in production             |
| R-005   | File upload storage fills up on Render        | Medium      | Medium | Migrate to Cloudinary/S3 before launch        |
| R-006   | Admin panel accessible without HTTPS          | Low         | High   | Enforce HTTPS in production                   |
| R-007   | JWT secret too weak in production             | Low         | High   | Use 256-bit random secret; rotate regularly   |

---

## 9. Test Execution Matrix

### Module Coverage Summary

| Module                  | Total TCs | Pass | Fail | Partial | Not Tested |
|-------------------------|-----------|------|------|---------|------------|
| Customer Frontend       | 30        | -    | -    | -       | 30         |
| Staff Management App    | 12        | -    | -    | -       | 12         |
| Admin Dashboard         | 40        | -    | -    | -       | 40         |
| Backend API             | 28        | -    | -    | -       | 28         |
| Real-time (Socket.IO)   | 8         | -    | -    | -       | 8          |
| Payment Gateway         | 8         | -    | -    | -       | 8          |
| Performance             | 8         | -    | -    | -       | 8          |
| Security                | 16        | -    | -    | -       | 16         |
| Responsive Design       | 12        | -    | -    | -       | 12         |
| Cross-Browser           | 18        | -    | -    | -       | 18         |
| Accessibility           | 7         | -    | -    | -       | 7          |
| **TOTAL**               | **187**   | **0**| **0**| **0**   | **187**    |

> **Note:** All test cases are pending QA execution. Update this matrix as tests are executed.

### Priority Testing Order

```
Priority 1 (Critical Path — Test First):
  ├── TC-CU-001: QR Code Scanning
  ├── TC-CU-005: Order Placement
  ├── TC-ST-002: Staff Order Management
  ├── TC-RT-002: Real-time Order Events
  └── TC-PAY-001: Razorpay Payment

Priority 2 (Core Features):
  ├── TC-CU-002: Menu Browsing
  ├── TC-CU-003: Shopping Cart
  ├── TC-CU-004: User Authentication
  ├── TC-AD-003: Menu Management
  ├── TC-AD-004: QR Code Management
  └── TC-API-001 to TC-API-005: All API Tests

Priority 3 (Non-Functional):
  ├── TC-SEC-001 to TC-SEC-004: Security
  ├── TC-PERF-001: Performance
  ├── TC-RESP-001 to TC-RESP-003: Responsive
  └── Cross-Browser Testing
```

---

## 10. QA Sign-Off Checklist

### Pre-Testing Checklist (QA Team)
- [ ] Backend server running at `http://localhost:5001`
- [ ] Customer App running at `http://localhost:5173`
- [ ] Staff App running at `http://localhost:5174`
- [ ] Admin App running at `http://localhost:5175`
- [ ] MongoDB connected (check backend console logs)
- [ ] Test accounts created (Admin, Staff, Customer)
- [ ] Postman collection imported with correct base URL
- [ ] Razorpay test keys configured in backend `.env`
- [ ] Physical/virtual mobile device available for QR scan testing
- [ ] Browser DevTools open to monitor console errors and network

### Testing Completion Criteria (Definition of Done)
- [ ] All Priority 1 (Critical Path) test cases executed
- [ ] All Priority 2 (Core Features) test cases executed
- [ ] Zero Critical / High severity bugs open
- [ ] Performance benchmarks met (< 3s load, < 500ms API)
- [ ] Security tests passed (no XSS, no auth bypass)
- [ ] Cross-browser testing completed for Chrome, Firefox, Edge
- [ ] Mobile QR scan tested on real Android and iOS device
- [ ] Payment flows tested end-to-end in test mode
- [ ] Real-time Socket.IO events verified across all 3 apps
- [ ] All test results documented in Test Execution Matrix

### Bug Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| 🔴 Critical | System crash / data loss / security breach | Login bypass, payment not recorded |
| 🟠 High | Core feature broken; no workaround | Order cannot be placed, QR scan fails |
| 🟡 Medium | Feature partially broken; workaround exists | Filter not working, chart not rendering |
| 🟢 Low | Minor UI/UX issue; cosmetic | Typo, slight alignment issue |

### Bug Report Template (for QA Team)

```
Bug ID:        BUG-XXX
Title:         [Short description]
Module:        [Customer App / Staff App / Admin / Backend / API]
Severity:      [Critical / High / Medium / Low]
Priority:      [P1 / P2 / P3]
Test Case ID:  [TC-XX-XXX]
Environment:   [Local / Staging / Production]
Browser:       [Chrome 120 / Firefox 120 / etc.]
Device:        [Desktop / Mobile / Tablet]

Steps to Reproduce:
  1. ...
  2. ...
  3. ...

Expected Result:
  [What should happen]

Actual Result:
  [What actually happened]

Screenshots/Logs:
  [Attach if available]

Assigned To:   [Developer Name]
Reported By:   [QA Name]
Date:          [YYYY-MM-DD]
```

---

## 📎 Appendix

### A. Useful URLs (Local Development)

| URL | Purpose |
|-----|---------|
| `http://localhost:5001/api/docs` | Swagger API Documentation |
| `http://localhost:5173` | Customer Frontend |
| `http://localhost:5174` | Staff Management App |
| `http://localhost:5175` | Admin Dashboard |
| `http://localhost:5001/api/menu` | Menu API (public) |

### B. Useful Test Scripts (Backend Root)

| Script | Purpose |
|--------|---------|
| `node verify_admin.js` | Verify/create admin account |
| `node verify_staff.js` | Verify/create staff account |
| `node seed_menu.js` | Seed database with sample menu |
| `node check_db_sample.js` | Check database connection & sample data |

### C. Recommended QA Tools

| Tool | Purpose | Free? |
|------|---------|-------|
| Postman | API testing | ✅ Yes |
| Chrome DevTools | Network, console, performance | ✅ Yes |
| Lighthouse | Performance & accessibility audit | ✅ Yes |
| axe DevTools | Accessibility testing | ✅ Yes (basic) |
| BrowserStack | Cross-browser testing | ❌ Paid |
| k6 | Load / performance testing | ✅ Yes |
| ngrok | Expose local server for webhook testing | ✅ Yes (basic) |
| MongoDB Compass | Database inspection | ✅ Yes |

---

*Report Version: 1.0*  
*Prepared By: Senior Full-Stack Developer*  
*Date: February 18, 2026*  
*Project: Restaurant QR Code System*  
*Status: Delivered to QA Team — Awaiting Test Execution* ✅
