# 🍽️ Restaurant QR Code System

A complete, production-ready restaurant management system with QR code ordering, real-time updates, and comprehensive admin controls.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 Overview

This system revolutionizes restaurant operations by enabling:
- **Contactless ordering** via QR codes
- **Real-time order tracking** for customers and staff
- **Complete management dashboard** for restaurant owners
- **Payment integration** with Razorpay & Stripe
- **Analytics and reporting** for business insights

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT LAYER                        │
├─────────────────┬───────────────┬───────────────────┤
│  User Frontend  │ Staff Frontend│  Admin Frontend   │
│   (Customer)    │   (Waiters)   │  (Management)     │
│   React + Vite  │ React + Vite  │  React + Vite     │
└────────┬────────┴───────┬───────┴─────────┬─────────┘
         │                │                 │
         └────────────────┼─────────────────┘
                          │
                ┌─────────▼──────────┐
                │   Backend API      │
                │  Express + Socket  │
                └─────────┬──────────┘
                          │
                ┌─────────▼──────────┐
                │   MongoDB          │
                └────────────────────┘
```

---

## ✨ Features

### 👥 Customer Frontend
- QR code scanning to access menu
- Browse menu with categories and filters
- Vegetarian/Non-vegetarian filters
- Real-time search
- Shopping cart management
- User authentication
- Order placement and tracking
- Payment integration (Stripe/Razorpay)
- Order history

### 👨‍🍳 Staff Management
- Staff authentication
- Live order dashboard
- Order status updates
- Real-time notifications
- Table management
- Kitchen display integration

### 🎛️ Admin Dashboard
- Comprehensive analytics dashboard
- Menu management (CRUD operations)
- QR code generation and download
- Order tracking and management
- Staff management
- Expense tracking
- Sales reports (PDF/Excel export)
- Promo code management
- Support ticket system
- Restaurant profile settings

### ⚡ Real-time Features
- Live order notifications
- Order status updates via WebSocket
- Kitchen display system updates
- Admin alerts

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 3.4/4.1
- **State Management:** Context API
- **Routing:** React Router 7.11
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client
- **Animations:** Framer Motion
- **Charts:** Recharts
- **PDF Generation:** jsPDF

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5.2.1
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Bcrypt
- **Real-time:** Socket.IO 4.8.3
- **Payments:** Razorpay, Stripe
- **File Upload:** Multer
- **Logging:** Winston
- **API Docs:** Swagger
- **Scheduling:** Node-Cron

---

## 📁 Project Structure

```
Restaurant-QR-Code/
├── backend/                 # Node.js Backend API
├── userfrontend/           # Customer React App
├── staffmanagement/        # Staff React App
├── admin-folder-main/      # Admin React App
├── PROJECT_ANALYSIS.md     # Detailed project documentation
├── DEPLOYMENT_GUIDE.md     # Complete deployment guide
├── DEPLOYMENT_CHECKLIST.md # Deployment progress tracker
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB installed (local) or MongoDB Atlas account
- Git installed
- Code editor (VS Code recommended)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Restaurant-QR-Code.git
cd Restaurant-QR-Code
```

#### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

Backend will run on `http://localhost:5001`

#### 3. Setup Customer Frontend
```bash
cd userfrontend
npm install
npm run dev
```

Customer app will run on `http://localhost:5173`

#### 4. Setup Staff Frontend
```bash
cd staffmanagement
npm install
npm run dev
```

Staff app will run on `http://localhost:5174`

#### 5. Setup Admin Dashboard
```bash
cd admin-folder-main
npm install
npm run dev
```

Admin app will run on `http://localhost:5175`

### Default Admin Credentials
After running the backend for the first time, a default admin is created by the seeder script:
- **Email:** `admin@example.com`
- **Password:** `password123`

(If the user already exists the password won't be overwritten – remove the record or use `backend/verify_admin.js` to update it.)

⚠️ **Change this immediately in production!**

---

## 📚 Documentation

Comprehensive documentation is available:

- **[PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)** - Complete system analysis, architecture, and features
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment to Render & Netlify
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Track your deployment progress
- **[QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md)** - Quick commands for deployment

---

## 🌐 Deployment

This system is ready to deploy to:

### Recommended Platform Stack
- **Backend:** [Render.com](https://render.com) (or Railway, Heroku)
- **Frontends:** [Netlify](https://netlify.com) (or Vercel)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)

### Quick Deployment
See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete instructions.

**Estimated deployment time:** 30-45 minutes

**Cost:** Free tier available (with limitations), ~$35/month for production-ready hosting

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
CUSTOMER_FRONTEND_URL=http://localhost:5173
ENCRYPTION_KEY=your_encryption_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

#### Frontends (.env.production)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Build frontends to verify
cd userfrontend && npm run build
cd staffmanagement && npm run build
cd admin-folder-main && npm run build
```

---

## 📊 API Documentation

Once the backend is running, visit:
```
http://localhost:5001/api/docs
```

For complete Swagger API documentation.

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with Bcrypt
- Role-based access control (Customer, Staff, Admin)
- CORS configuration
- Input validation
- QR code encryption
- Secure payment processing
- Environment-based configuration

---

## 📱 Mobile Support

- Customer app optimized for mobile (430px width)
- Touch-friendly navigation
- Bottom navigation bar
- Responsive design across all apps
- PWA-ready (can be installed on mobile)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for amazing framework
- Vite for blazing fast build tool
- MongoDB for flexible database
- Render & Netlify for hosting
- All open-source contributors

---

## 📞 Support

For issues, questions, or contributions:

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/Restaurant-QR-Code/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/Restaurant-QR-Code/discussions)
- **Email:** your.email@example.com

---

## 🎯 Roadmap

### Planned Features
- [ ] Push notifications
- [ ] Multi-language support (i18n)
- [ ] Loyalty program
- [ ] Table reservation system
- [ ] Inventory management
- [ ] WhatsApp notifications
- [ ] Dark mode
- [ ] Mobile apps (React Native)

---

## 📈 Project Stats

- **3 Frontend Applications**
- **1 Backend API**
- **14+ Database Models**
- **14+ API Route Groups**
- **Real-time WebSocket Integration**
- **Multi-payment Gateway Support**
- **Production Ready**

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

## 📸 Screenshots

> Add screenshots of your deployed application here

### Customer App
![Customer App](./screenshots/customer-app.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)

### Staff Management
![Staff App](./screenshots/staff-app.png)

---

## 🔗 Live Demo

**Note:** Update these URLs after deployment

- **Customer App:** https://restaurant-customer.netlify.app
- **Staff App:** https://restaurant-staff.netlify.app
- **Admin Dashboard:** https://restaurant-admin.netlify.app

---

**Built with ❤️ for restaurants worldwide**

*Last Updated: February 14, 2026*
#   Q r - t e s t  
 