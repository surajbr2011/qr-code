# 🏗️ Deployment Architecture Diagram

```
╔═══════════════════════════════════════════════════════════════════════╗
║                         DEPLOYMENT ARCHITECTURE                        ║
║                    Restaurant QR Code System                          ║
╚═══════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│                          🌐 NETLIFY                                 │
│                     (Frontend Hosting - CDN)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│  │   Customer   │   │    Staff     │   │    Admin     │          │
│  │   Frontend   │   │   Frontend   │   │  Dashboard   │          │
│  ├──────────────┤   ├──────────────┤   ├──────────────┤          │
│  │ React 19.2   │   │ React 19.2   │   │ React 19.2   │          │
│  │ Vite 7.2.4   │   │ Vite 7.2.4   │   │ Vite 7.2.4   │          │
│  │ Tailwind CSS │   │ Tailwind CSS │   │ Tailwind CSS │          │
│  │ Socket.IO    │   │ Socket.IO    │   │ Socket.IO    │          │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                       │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             │ HTTPS/REST API + WebSocket
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│                         🚀 RENDER                                  │
│                    (Backend Hosting - PaaS)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                    Backend API Server                      │    │
│  ├───────────────────────────────────────────────────────────┤    │
│  │  Node.js + Express 5.2.1                                  │    │
│  │  • RESTful API (14 route groups)                          │    │
│  │  • JWT Authentication & Authorization                     │    │
│  │  • Socket.IO Server (Real-time)                           │    │
│  │  • Payment Processing (Razorpay + Stripe)                 │    │
│  │  • File Upload (Multer)                                   │    │
│  │  • QR Code Generation                                     │    │
│  │  • Logging (Winston)                                      │    │
│  │  • Scheduled Tasks (Node-Cron)                            │    │
│  │  • API Documentation (Swagger)                            │    │
│  └───────────────────────┬───────────────────────────────────┘    │
│                          │                                         │
└──────────────────────────┼─────────────────────────────────────────┘
                           │
                           │ Mongoose ODM
                           │
┌──────────────────────────▼─────────────────────────────────────────┐
│                    🍃 MONGODB ATLAS                                │
│                   (Cloud Database - DBaaS)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │              restaurant_db Database                        │    │
│  ├───────────────────────────────────────────────────────────┤    │
│  │  Collections (14):                                        │    │
│  │  • users           • menuItems      • orders              │    │
│  │  • staff           • qrcodes        • promocodes          │    │
│  │  • offers          • expenses       • events              │    │
│  │  • notifications   • tableSessions  • shifts              │    │
│  │  • tickets         • hotelProfile                         │    │
│  │                                                            │    │
│  │  Features:                                                │    │
│  │  ✓ Automatic backups                                      │    │
│  │  ✓ Encryption at rest                                     │    │
│  │  ✓ Global availability                                    │    │
│  │  ✓ Free M0 tier (512MB)                                   │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

                         📡 DATA FLOW DIAGRAM

┌─────────────┐                                        ┌─────────────┐
│   Customer  │──── Scan QR Code ────────────────────▶│   Access    │
│   at Table  │                                        │    Menu     │
└─────────────┘                                        └──────┬──────┘
                                                              │
                                                              │
                                                              ▼
┌─────────────┐                                        ┌─────────────┐
│   Browse &  │◀───── Customer Frontend ──────────────│  Add Items  │
│   Select    │       (React App - Netlify)           │   to Cart   │
└──────┬──────┘                                        └─────────────┘
       │
       │
       ▼
┌─────────────┐         HTTPS POST                    ┌─────────────┐
│  Place      │────────────────────────────────────▶  │   Backend   │
│  Order      │                                        │     API     │
└─────────────┘                                        └──────┬──────┘
                                                              │
                                                              │
                         ┌────────────────────────────────────┤
                         │                                    │
                         ▼                                    ▼
                  ┌─────────────┐                    ┌─────────────┐
                  │   MongoDB   │                    │  WebSocket  │
                  │   Insert    │                    │  Broadcast  │
                  │   Order     │                    │   Event     │
                  └─────────────┘                    └──────┬──────┘
                                                            │
                         ┌──────────────────────────────────┤
                         │                                  │
                         ▼                                  ▼
                  ┌─────────────┐                    ┌─────────────┐
                  │   Staff     │                    │    Admin    │
                  │   Notified  │                    │   Notified  │
                  │ (Real-time) │                    │ (Real-time) │
                  └──────┬──────┘                    └──────┬──────┘
                         │                                  │
                         ▼                                  ▼
                  ┌─────────────┐                    ┌─────────────┐
                  │   Update    │                    │   Monitor   │
                  │   Order     │                    │  Dashboard  │
                  │   Status    │                    │  Analytics  │
                  └─────────────┘                    └─────────────┘

═══════════════════════════════════════════════════════════════════════

                      🔐 SECURITY LAYERS

┌─────────────────────────────────────────────────────────────────────┐
│                         SSL/TLS (HTTPS)                             │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │              CORS & Origin Validation                      │     │
│  │  ┌─────────────────────────────────────────────────────┐  │     │
│  │  │           JWT Authentication                         │  │     │
│  │  │  ┌───────────────────────────────────────────────┐  │  │     │
│  │  │  │      Role-Based Access Control                │  │  │     │
│  │  │  │  ┌─────────────────────────────────────────┐ │  │  │     │
│  │  │  │  │      Input Validation                   │ │  │  │     │
│  │  │  │  │  ┌───────────────────────────────────┐  │ │  │  │     │
│  │  │  │  │  │   Password Hashing (Bcrypt)       │  │ │  │  │     │
│  │  │  │  │  │  ┌─────────────────────────────┐  │  │ │  │  │     │
│  │  │  │  │  │  │  Database Encryption        │  │  │ │  │  │     │
│  │  │  │  │  │  │  (MongoDB Atlas)            │  │  │ │  │  │     │
│  │  │  │  │  │  └─────────────────────────────┘  │  │ │  │  │     │
│  │  │  │  │  └───────────────────────────────────┘  │ │  │  │     │
│  │  │  │  └─────────────────────────────────────────┘ │  │  │     │
│  │  │  └───────────────────────────────────────────────┘  │  │     │
│  │  └─────────────────────────────────────────────────────┘  │     │
│  └───────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

                    💰 COST BREAKDOWN (Monthly)

┌─────────────────────────────────────────────────────────────────────┐
│                         FREE TIER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Netlify (3 sites)        $0  (100GB bandwidth each)                │
│  Render (Backend)         $0  (512MB RAM, sleeps after 15 min)      │
│  MongoDB Atlas            $0  (M0: 512MB storage)                   │
│  ─────────────────────────────────────────────────────────────────  │
│  TOTAL:                   $0/month                                  │
│                                                                     │
│  ⚠️ Limitations:                                                    │
│  - Backend sleeps when inactive                                    │
│  - Limited storage & bandwidth                                     │
│  - No custom domains included                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  PRODUCTION RECOMMENDED                             │
├─────────────────────────────────────────────────────────────────────┤
│  Netlify Pro (1 site)     $19  (More bandwidth, analytics)          │
│  Render Starter           $7   (Always on, 512MB RAM)               │
│  MongoDB M10              $9   (2GB RAM, better performance)        │
│  ─────────────────────────────────────────────────────────────────  │
│  TOTAL:                   ~$35/month                                │
│                                                                     │
│  ✅ Benefits:                                                       │
│  - No downtime (always on)                                         │
│  - Better performance                                              │
│  - Production-ready                                                │
│  - Professional support                                            │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

                   🚀 DEPLOYMENT SEQUENCE

Step 1: MongoDB Atlas (15 min)
  └─ Create account
  └─ Create cluster
  └─ Configure access
  └─ Get connection string

Step 2: Render Backend (15 min)
  └─ Connect GitHub
  └─ Configure build
  └─ Add environment variables
  └─ Deploy & test

Step 3: Netlify - Customer (10 min)
  └─ Connect repository
  └─ Configure build
  └─ Add env variables
  └─ Deploy & test

Step 4: Netlify - Staff (10 min)
  └─ Repeat for staff app

Step 5: Netlify - Admin (10 min)
  └─ Repeat for admin app

Step 6: Final Configuration (10 min)
  └─ Update backend with frontend URLs
  └─ Test complete system
  └─ Verify real-time features

═══════════════════════════════════════════════════════════════════════

                        📊 PERFORMANCE METRICS

┌─────────────────────────────────────────────────────────────────────┐
│                     TARGET PERFORMANCE                              │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend Load Time:      < 3 seconds                               │
│  API Response Time:       < 500ms                                   │
│  Database Query Time:     < 100ms                                   │
│  WebSocket Latency:       < 50ms                                    │
│  Page Size (Customer):    ~500KB (gzipped)                          │
│  Concurrent Users:        100+ (Free tier)                          │
│  Uptime (Paid):           99.9%                                     │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
```
