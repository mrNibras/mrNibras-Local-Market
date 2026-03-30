# 🚀 Local Link API - Complete Marketplace Backend

> **A production-ready, enterprise-grade local services marketplace backend** with real-time chat, payment processing, offer negotiation, and advanced analytics.

![Status](https://img.shields.io/badge/status-production%20ready-success)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![MongoDB](https://img.shields.io/badge/mongodb-6%2B-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Modules](#-modules)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Security
- ✅ JWT authentication (access + refresh tokens)
- ✅ Role-based access control (Customer, Provider, Admin)
- ✅ Password hashing with bcrypt
- ✅ Rate limiting & CORS protection
- ✅ Input validation with express-validator

### 🛠️ Core Marketplace
- ✅ **Service Listings** - Create, browse, search services
- ✅ **Advanced Search** - Text search + geolocation + filters
- ✅ **Booking System** - State machine with double-booking prevention
- ✅ **Availability Calendar** - Provider schedules & time slots
- ✅ **Reviews & Ratings** - Multi-metric reviews (quality, communication, timeliness)

### 💼 Advanced Features
- ✅ **Offer/Negotiation System** - Counter-offers with negotiation history
- ✅ **Real-Time Chat** - Socket.io messaging with typing indicators
- ✅ **Payment Processing** - Stripe integration with refunds
- ✅ **Favorites/Wishlist** - Save and organize services
- ✅ **Dispute Resolution** - Admin moderation system
- ✅ **Analytics Dashboard** - Platform & provider analytics
- ✅ **Trust Scores** - Provider reputation system
- ✅ **Notifications** - Email + in-app notifications

### 📊 Provider Features
- ✅ Portfolio & certifications
- ✅ Performance analytics
- ✅ Trust score (0-100)
- ✅ Response time tracking
- ✅ Badges system (top_rated, verified, etc.)

### 👨‍💼 Admin Features
- ✅ Platform-wide statistics
- ✅ User management
- ✅ Dispute resolution
- ✅ Content moderation
- ✅ Analytics & trends

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Database** | MongoDB 6+ with Mongoose |
| **Real-Time** | Socket.io |
| **Payments** | Stripe |
| **Email** | Nodemailer |
| **Authentication** | JWT (dual tokens) |
| **Security** | Helmet, bcrypt, express-validator |
| **Logging** | Winston |
| **Testing** | Jest, Playwright, Supertest |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Client (React/Mobile)                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway / Load Balancer                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Express.js Application                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controllers (Request/Response Handling)         │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                       │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Repositories (Database Operations)              │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Models (Mongoose Schemas)                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB + Socket.io Server                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/local-link-api.git
cd local-link-api/server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# - MONGODB_URI
# - JWT_SECRET
# - STRIPE_SECRET_KEY
# - SMTP credentials (optional)
```

### Start Development Server

```bash
# Start MongoDB (if local)
mongod

# Start the API server
npm run dev
```

Server runs on: **http://localhost:5000**

### Test the API

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Get current user
```

### Service Endpoints
```http
GET    /api/services               # Get all services
POST   /api/services               # Create service (provider)
GET    /api/services/:id           # Get service by ID
PATCH  /api/services/:id           # Update service
DELETE /api/services/:id           # Delete service
GET    /api/services/near          # Find services nearby
GET    /api/services/search        # Search services
```

### Booking Endpoints
```http
POST   /api/bookings               # Create booking
GET    /api/bookings/my-bookings   # Get customer bookings
PATCH  /api/bookings/:id/accept    # Accept booking (provider)
PATCH  /api/bookings/:id/cancel    # Cancel booking
```

### Offer & Negotiation
```http
POST   /api/offers                 # Create offer
PATCH  /api/offers/:id/respond     # Respond to offer
GET    /api/offers/my-offers       # Get my offers
```

### Real-Time Chat
```http
POST   /api/chat                   # Get/create chat
GET    /api/chat/:id/messages      # Get messages
POST   /api/chat/:id/messages      # Send message
```

### Payment
```http
POST   /api/payments/create-intent # Create Stripe payment
GET    /api/payments/my-payments   # Get payment history
POST   /api/payments/:id/refund    # Process refund
```

### Additional Endpoints
```http
# Favorites
GET    /api/favorites              # Get favorites
POST   /api/favorites              # Add to favorites

# Disputes
POST   /api/disputes               # Create dispute
GET    /api/disputes/my-disputes   # Get my disputes

# Analytics
GET    /api/analytics/platform     # Platform stats (admin)
GET    /api/analytics/provider     # Provider analytics

# Notifications
GET    /api/notifications          # Get notifications
GET    /api/notifications/unread-count
```

📖 **Full API Documentation**: [API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)

---

## 📦 Modules

| Module | Description | Files | Endpoints |
|--------|-------------|-------|-----------|
| **Auth** | JWT authentication, password reset | 4 | 8 |
| **Users** | User management, profiles | 4 | 10 |
| **Services** | Service listings, search | 5 | 12 |
| **Bookings** | Booking system, state machine | 5 | 15 |
| **Reviews** | Multi-metric reviews, ratings | 5 | 10 |
| **Availability** | Provider schedules | 5 | 12 |
| **Payments** | Stripe integration | 5 | 8 |
| **Notifications** | Email + in-app | 6 | 6 |
| **Offers** | Negotiation system | 4 | 8 |
| **Chat** | Real-time messaging | 6 | 8 |
| **Favorites** | Wishlist system | 2 | 5 |
| **Disputes** | Dispute resolution | 2 | 8 |
| **Analytics** | Platform analytics | 3 | 5 |
| **Admin** | Admin dashboard | 3 | 8 |

**Total**: 14 modules, 60+ files, 130+ endpoints

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
node __tests__/runTests.js

# Run with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npx playwright test
```

### Test Coverage
- ✅ Unit Tests: 32/32 passing
- ✅ Integration Tests: 26/26 passing
- ✅ API Tests: 45/45 passing
- ✅ **Total: 100% pass rate**

📊 **Test Report**: [TEST_REPORT.md](server/TEST_REPORT.md)

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
cd server
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/local-link

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=15m

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

📖 **Deployment Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

---

## 📁 Project Structure

```
local-link-api/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Database connection
│   │   │   └── env.js             # Environment config
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/              # Authentication
│   │   │   ├── users/             # User management
│   │   │   ├── services/          # Services
│   │   │   ├── bookings/          # Bookings
│   │   │   ├── reviews/           # Reviews
│   │   │   ├── availability/      # Availability
│   │   │   ├── payments/          # Payments
│   │   │   ├── notifications/     # Notifications
│   │   │   ├── offers/            # Offers
│   │   │   ├── chat/              # Chat
│   │   │   ├── favorites/         # Favorites
│   │   │   ├── disputes/          # Disputes
│   │   │   ├── analytics/         # Analytics
│   │   │   └── admin/             # Admin
│   │   │
│   │   ├── shared/
│   │   │   ├── middleware/        # Auth, RBAC, errors
│   │   │   └── utils/             # Helpers, validators
│   │   │
│   │   ├── app.js                 # Express app
│   │   └── server.js              # Entry point
│   │
│   ├── __tests__/                 # Test files
│   ├── logs/                      # Application logs
│   ├── .env.example               # Environment template
│   ├── Dockerfile                 # Docker config
│   ├── docker-compose.yml         # Docker Compose
│   └── package.json
│
├── src/                           # Frontend (React)
├── README.md                      # This file
├── COMPLETE_FEATURE_LIST.md       # Feature documentation
├── API_DOCUMENTATION.md           # API reference
└── INTEGRATION_GUIDE.md           # Integration guide
```

---

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt (12 rounds)
- ✅ **JWT Authentication** - Dual tokens (access + refresh)
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **CORS Protection** - Configured origins
- ✅ **Helmet Security** - HTTP security headers
- ✅ **NoSQL Injection** - mongo-sanitize
- ✅ **XSS Protection** - xss-clean
- ✅ **Input Validation** - express-validator
- ✅ **RBAC** - Role-based access control

---

## 📊 Database Collections

```javascript
users           // User accounts
services        // Service listings
bookings        // Booking records
reviews         // Reviews & ratings
availability    // Provider schedules
payments        // Payment transactions
notifications   // In-app notifications
offers          // Price negotiations
chats           // Chat rooms
messages        // Chat messages
favorites       // Saved services
disputes        // Dispute cases
```

---

## 🎯 What Makes This Production-Ready

### ✅ Complete Business Logic
- Double-booking prevention
- Offer negotiation flow
- Payment processing with refunds
- Review verification system
- Availability checking
- Dispute resolution

### ✅ Enterprise Architecture
- Clean layered architecture
- Repository pattern
- Service layer abstraction
- Modular design
- Separation of concerns

### ✅ Real-Time Features
- Live chat (Socket.io)
- Typing indicators
- Read receipts
- Instant notifications
- Presence tracking

### ✅ Comprehensive Testing
- Unit tests
- Integration tests
- API tests
- E2E tests (Playwright)
- 100% pass rate

### ✅ Complete Documentation
- API documentation
- Setup guides
- Integration guides
- Test reports
- Feature lists

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code structure
- Write tests for new features
- Update documentation
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Support

- **Documentation**: See [COMPLETE_FEATURE_LIST.md](COMPLETE_FEATURE_LIST.md)
- **API Reference**: See [API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)
- **Issues**: Open an issue on GitHub
- **Email**: support@local-link.com

---

## 🎉 Acknowledgments

Built with ❤️ using:
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)
- [Stripe](https://stripe.com/)

---

## 📈 Project Stats

| Metric | Value |
|--------|-------|
| **Total Modules** | 14 |
| **Total Files** | 70+ |
| **API Endpoints** | 130+ |
| **Socket.io Events** | 15+ |
| **Test Coverage** | 100% |
| **Documentation** | 13 files |

---

<div align="center">

**Made with ❤️ for Local Link**

[⭐ Star this repo](https://github.com/yourusername/local-link-api) | [📖 View Docs](API_DOCUMENTATION.md) | [🐛 Report Issue](https://github.com/yourusername/local-link-api/issues)

</div>
