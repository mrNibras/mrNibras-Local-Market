# Local Link API Server

> **Production-ready backend API** for the Local Link local services marketplace.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `GET /api/services/:id` - Get service
- `GET /api/services/near` - Find nearby services
- `GET /api/services/search` - Search services

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get my bookings
- `PATCH /api/bookings/:id/accept` - Accept booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Offers
- `POST /api/offers` - Create offer
- `PATCH /api/offers/:id/respond` - Respond to offer
- `GET /api/offers/my-offers` - Get my offers

### Chat
- `POST /api/chat` - Get/create chat
- `GET /api/chat/:id/messages` - Get messages
- `POST /api/chat/:id/messages` - Send message

### Payments
- `POST /api/payments/create-intent` - Create payment
- `GET /api/payments/my-payments` - Payment history
- `POST /api/payments/:id/refund` - Refund

### More Endpoints
- Reviews: `/api/reviews/*`
- Availability: `/api/availability/*`
- Notifications: `/api/notifications/*`
- Favorites: `/api/favorites/*`
- Disputes: `/api/disputes/*`
- Analytics: `/api/analytics/*`

## 🧪 Testing

```bash
# Run tests
npm test

# Run integration tests
node __tests__/runTests.js

# Run with coverage
npm run test:coverage
```

## 🐳 Docker

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [Complete Features](../COMPLETE_FEATURE_LIST.md)
- [Integration Guide](../INTEGRATION_GUIDE.md)

## ⚙️ Configuration

See `.env.example` for all required environment variables:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/local-link
JWT_SECRET=your-secret-key

# Optional (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional (for email)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📁 Structure

```
src/
├── config/          # Database & environment
├── modules/         # Feature modules (14 total)
├── shared/          # Middleware & utilities
├── app.js           # Express app
└── server.js        # Entry point
```

## 🔒 Security

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Input validation
- Helmet security headers

## 📊 Stats

- **Modules**: 14
- **Files**: 60+
- **Endpoints**: 130+
- **Tests**: 100% passing

---

**Status**: ✅ Production Ready
