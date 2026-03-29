# Local Link API Server

A production-ready RESTful API for a local services marketplace built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

- **Layered Architecture**: Controller → Service → Repository → Model
- **RESTful API**: Stateless, resource-based endpoints
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Customer, Provider, Admin roles
- **MongoDB with Mongoose**: Flexible schema with geospatial support

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js              # Database connection & indexing
│   │   └── env.js             # Environment configuration
│   │
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── services/          # Service listings
│   │   ├── bookings/          # Booking system
│   │   ├── reviews/           # Review & ratings
│   │   ├── availability/      # Provider availability
│   │   └── admin/             # Admin dashboard
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   └── error.middleware.js
│   │   │
│   │   └── utils/
│   │       ├── apiFeatures.js   # Filtering, pagination, geo queries
│   │       ├── validators.js    # Input validation
│   │       └── logger.js        # Winston logger
│   │
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
│
├── logs/                        # Application logs
├── .env.example                 # Environment template
├── Dockerfile                   # Container configuration
├── docker-compose.yml           # Multi-container setup
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- MongoDB 6+
- npm or bun

### Installation

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Update environment variables**
   - Set your MongoDB URI
   - Generate a JWT secret: `openssl rand -base64 32`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Start production server**
   ```bash
   npm start
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Docker

```bash
# Build image
docker build -t local-link-api .

# Run container
docker run -d -p 5000:5000 \
  -e MONGODB_URI=mongodb://your-uri \
  -e JWT_SECRET=your-secret \
  local-link-api
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get my profile |
| PATCH | `/api/users/me` | Update my profile |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/near` | Find users nearby |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get service by ID |
| POST | `/api/services` | Create service (Provider) |
| PATCH | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |
| GET | `/api/services/near` | Find services nearby |
| GET | `/api/services/search` | Search services |
| GET | `/api/services/categories` | Get all categories |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/my-bookings` | Get my bookings (Customer) |
| GET | `/api/bookings/provider/my-bookings` | Get provider bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/:id/accept` | Accept booking (Provider) |
| PATCH | `/api/bookings/:id/reject` | Reject booking (Provider) |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| PATCH | `/api/bookings/:id/complete` | Complete booking (Provider) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/service/:serviceId` | Get service reviews |
| POST | `/api/reviews` | Create review |
| PATCH | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |
| POST | `/api/reviews/:id/helpful` | Mark as helpful |
| POST | `/api/reviews/:id/response` | Provider response |

### Availability (Provider)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability/my-availability` | Get my schedule |
| POST | `/api/availability` | Add availability |
| PATCH | `/api/availability/:id` | Update availability |
| DELETE | `/api/availability/:id` | Delete availability |
| GET | `/api/availability/day/:dayOfWeek/slots` | Get available slots |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/activities` | Recent activities |
| GET | `/api/admin/health` | System health |
| GET | `/api/admin/users/:role` | Users by role |
| DELETE | `/api/admin/users/:id` | Delete user |
| DELETE | `/api/admin/services/:id` | Delete service |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Features

### Security
- ✅ Helmet.js for HTTP headers
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation (express-validator)
- ✅ NoSQL injection protection (mongo-sanitize)
- ✅ XSS protection
- ✅ Password hashing (bcrypt)

### Performance
- ✅ Geospatial queries (2dsphere indexes)
- ✅ Pagination
- ✅ Field selection (projection)
- ✅ Advanced filtering
- ✅ Response compression
- ✅ Database indexing

### Business Logic
- ✅ Double-booking prevention
- ✅ Review aggregation (auto-update ratings)
- ✅ State transitions (booking workflow)
- ✅ Role-based access control
- ✅ Ownership verification

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | Token expiration | `30d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |
| `LOG_LEVEL` | Logging level | `info` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `warn.log` - Warning logs only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 👥 Team

Built with ❤️ for Local Link
