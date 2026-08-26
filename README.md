# NexaCart — Full-Stack E-Commerce & Circular-Resale Marketplace

A production-ready full-stack marketplace combining new product shopping with circular-resale. Built during CodeAlpha internship with separate frontend and API deployments, JWT authentication, MongoDB persistence, and installable PWA.

## 🌐 Live Demo

**Frontend**: https://nexacart-marketplace.vercel.app  
**Status**: ✅ Live and deployed

## 📂 Repository

https://github.com/LaibaaJamil/nexacart-marketplace

## ✨ Key Features

### User & Authentication
- Secure user registration and login
- JWT token-based authentication
- Protected account data and order history
- User profile management

### Product Catalog
- Browse new products with details and images
- Circular-resale marketplace section
- Product search and filtering
- Product detail pages with full information

### Shopping Experience
- Add products to cart
- Update quantities and remove items
- View cart summary before checkout
- Responsive cart interface (mobile & desktop)

### Order Management
- Create orders from cart
- Order persistence in database
- Order history and status tracking
- Order details view

### Responsive Design
- Mobile-first responsive layout
- Works seamlessly on all screen sizes
- Touch-friendly interface
- Fast load times

### Progressive Web App (PWA)
- Installable on Android devices
- Offline support with service workers
- App-like experience without native app
- Installable from browser address bar

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with hooks
- **Styling**: CSS3, Bootstrap
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios for API calls
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Style**: RESTful
- **Middleware**: CORS, express.json()
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcryptjs
- **Deployment**: Vercel (serverless functions)

### Database
- **Platform**: MongoDB Atlas (cloud)
- **ODM**: Mongoose
- **Collections**: users, products, orders
- **Indexing**: Optimized queries on frequently accessed fields

### Additional
- **Real-time**: Socket.io ready (prepared for future updates)
- **Environment**: Environment variables via .env files
- **Git**: Version control and collaboration

## 📊 Architecture

```
Frontend (React)
    ↓
    ↓ HTTP/REST
    ↓
Backend API (Express.js)
    ↓
    ↓ Database queries
    ↓
MongoDB Atlas (Cloud Database)
```

### Deployment Architecture
- **Frontend**: Deployed on Vercel (automatic from GitHub)
- **Backend**: Deployed on Vercel as serverless functions
- **Database**: MongoDB Atlas (separate cloud database)
- **Environment Variables**: Managed in Vercel project settings

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB connection string
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LaibaaJamil/nexacart-marketplace.git
cd nexacart-marketplace
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
npm install
```

### Configuration

1. **Backend .env file** (`backend/.env`)
```
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexacart
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

2. **Frontend .env file** (`frontend/.env`)
```
VITE_API_URL=http://localhost:5001
```

### Running Locally

**Terminal 1 - Backend**
```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product details
- `GET /api/products/search?q=query` - Search products

### Cart & Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/mine` - Get user's orders
- `GET /api/orders/:id` - Get order details

## 🔐 Security Features

- **Password Security**: Passwords hashed with bcryptjs (salt rounds: 12)
- **Authentication**: JWT tokens with 7-day expiration
- **Protected Endpoints**: Authentication middleware on sensitive routes
- **CORS**: Configured to accept requests from frontend origin
- **Environment Variables**: Sensitive data not in code

## 📱 PWA Features

### How to Install
1. Visit https://nexacart-marketplace.vercel.app
2. Click address bar menu (three dots)
3. Select "Install app" or "Add to Home Screen"
4. App installs and appears on home screen

### Capabilities
- Works offline (with cached content)
- Push notifications ready
- App-like full-screen experience
- No app store needed

## 🎯 What I Learned

✓ Full-stack development from design to production  
✓ Separate frontend and backend deployment  
✓ Database design for e-commerce workflows  
✓ JWT authentication and secure endpoints  
✓ REST API design and HTTP methods  
✓ MongoDB document modeling  
✓ React component architecture  
✓ Responsive web design  
✓ PWA development and service workers  
✓ Environment variable management  
✓ Production deployment workflow  
✓ Git collaboration and version control  

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications for orders
- [ ] Admin dashboard for product management
- [ ] Review and rating system
- [ ] Wishlist feature
- [ ] Advanced search filters
- [ ] Real-time inventory updates
- [ ] Analytics and metrics dashboard

## 🤝 Contributing

This is a portfolio project, but I welcome feedback and suggestions!

## 📄 License

This project is for educational and portfolio purposes.

## 👤 Author

**Laiba Jamil**
- GitHub: [@LaibaaJamil](https://github.com/LaibaaJamil)
- LinkedIn: [laibajamil312](https://www.linkedin.com/in/laibajamil312)
- Portfolio: [laibaajamil.github.io/laiba-portfolio](https://laibaajamil.github.io/laiba-portfolio)
- Email: laibajamil.312@gmail.com

## 🙏 Acknowledgments

- Built during CodeAlpha Full-Stack Development Internship
- Inspired by real marketplace platforms
- Uses open-source libraries: React, Express, MongoDB, Bootstrap

---

**Live Demo**: https://nexacart-marketplace.vercel.app  
**Repository**: https://github.com/LaibaaJamil/nexacart-marketplace  
**Status**: Production-ready ✅
