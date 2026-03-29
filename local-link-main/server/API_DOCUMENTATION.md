# Local Link API Documentation

Complete API documentation for the Local Link local services marketplace.

## Base URL
```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) with a dual-token system:

- **Access Token**: Short-lived (15 minutes) - used for API requests
- **Refresh Token**: Long-lived (7 days) - used to get new access tokens

### Token Format
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "15m",
  "refreshExpiresIn": "7d"
}
```

### Using Tokens
Include the access token in the Authorization header:
```
Authorization: Bearer <your-access-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "customer"  // "customer", "provider", or "admin"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "65f1234...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "15m",
    "refreshExpiresIn": "7d"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1234...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "15m",
    "refreshExpiresIn": "7d"
  }
}
```

### Refresh Access Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "15m",
    "refreshExpiresIn": "7d"
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Logout from All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer <access-token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "65f1234...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "profileImage": "...",
    "phone": "+1234567890",
    "location": {
      "type": "Point",
      "coordinates": [-73.935242, 40.730610]
    }
  }
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "If the email exists, a reset code has been sent"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 👤 User Endpoints

### Get My Profile
```http
GET /api/users/me
Authorization: Bearer <access-token>
```

### Update My Profile
```http
PATCH /api/users/me
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  },
  "bio": "Experienced service provider"
}
```

### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <access-token>
```

### Change Password
```http
POST /api/users/:id/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

### Find Users Near Location
```http
GET /api/users/near?lng=-73.935242&lat=40.730610&maxDistance=5000
Authorization: Bearer <access-token>
```

---

## 🛠️ Service Endpoints

### Get All Services
```http
GET /api/services?page=1&limit=10&category=plumbing&sort=-averageRating
```

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `minRating` - Minimum rating
- `sort` - Sort field (prefix with `-` for descending)

### Get Service by ID
```http
GET /api/services/:id
```

### Create Service (Provider Only)
```http
POST /api/services
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Professional Plumbing Services",
  "description": "Expert plumbing repair and installation",
  "category": "plumbing",
  "price": 50,
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  },
  "tags": ["plumbing", "repair", "installation"],
  "duration": "1-2 hours",
  "serviceType": "in-person"
}
```

### Update Service
```http
PATCH /api/services/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 75
}
```

### Delete Service
```http
DELETE /api/services/:id
Authorization: Bearer <access-token>
```

### Find Services Near Location
```http
GET /api/services/near?lng=-73.935242&lat=40.730610&maxDistance=5000&category=plumbing
```

### Search Services
```http
GET /api/services/search?q=plumbing&page=1&limit=10
```

### Get Service Categories
```http
GET /api/services/categories
```

### Get My Services (Provider)
```http
GET /api/services/my-services
Authorization: Bearer <access-token>
```

### Toggle Service Active Status
```http
PATCH /api/services/:id/toggle-active
Authorization: Bearer <access-token>
```

---

## 📅 Booking Endpoints

### Create Booking (Customer)
```http
POST /api/bookings
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "provider": "65f1234...",
  "service": "65f5678...",
  "bookingDate": "2025-04-01T10:00:00Z",
  "notes": "Please call when you arrive"
}
```

### Get My Bookings (Customer)
```http
GET /api/bookings/my-bookings?status=pending&page=1&limit=10
Authorization: Bearer <access-token>
```

### Get Provider Bookings
```http
GET /api/bookings/provider/my-bookings?status=accepted
Authorization: Bearer <access-token>
Role: provider
```

### Accept Booking (Provider)
```http
PATCH /api/bookings/:id/accept
Authorization: Bearer <access-token>
Role: provider
```

### Reject Booking (Provider)
```http
PATCH /api/bookings/:id/reject
Authorization: Bearer <access-token>
Role: provider
Content-Type: application/json

{
  "reason": "Not available at this time"
}
```

### Cancel Booking
```http
PATCH /api/bookings/:id/cancel
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "reason": "Change of plans"
}
```

### Complete Booking (Provider)
```http
PATCH /api/bookings/:id/complete
Authorization: Bearer <access-token>
Role: provider
```

### Get Upcoming Bookings
```http
GET /api/bookings/upcoming
Authorization: Bearer <access-token>
```

### Get Past Bookings
```http
GET /api/bookings/past
Authorization: Bearer <access-token>
```

### Get Booking Statistics (Provider)
```http
GET /api/bookings/provider/stats
Authorization: Bearer <access-token>
Role: provider
```

---

## ⭐ Review Endpoints

### Get Service Reviews
```http
GET /api/reviews/service/:serviceId?page=1&limit=10
```

### Get Review Statistics
```http
GET /api/reviews/service/:serviceId/stats
```

### Create Review (Customer - After Completed Booking)
```http
POST /api/reviews
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "service": "65f5678...",
  "rating": 5,
  "comment": "Excellent service! Highly recommended.",
  "booking": "65f9012..."
}
```

### Update Review
```http
PATCH /api/reviews/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated comment"
}
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <access-token>
```

### Mark Review as Helpful
```http
POST /api/reviews/:id/helpful
Authorization: Bearer <access-token>
```

### Provider Response to Review
```http
POST /api/reviews/:id/response
Authorization: Bearer <access-token>
Role: provider
Content-Type: application/json

{
  "response": "Thank you for your feedback!"
}
```

### Get My Reviews
```http
GET /api/reviews/my-reviews
Authorization: Bearer <access-token>
```

---

## 🕐 Availability Endpoints (Provider Only)

### Get My Availability
```http
GET /api/availability/my-availability
Authorization: Bearer <access-token>
Role: provider
```

### Create Availability
```http
POST /api/availability
Authorization: Bearer <access-token>
Role: provider
Content-Type: application/json

{
  "dayOfWeek": 1,  // 0=Sunday, 1=Monday, ..., 6=Saturday
  "slots": [
    { "startTime": "09:00", "endTime": "12:00" },
    { "startTime": "14:00", "endTime": "18:00" }
  ]
}
```

### Get Available Slots for Day
```http
GET /api/availability/day/:dayOfWeek/slots
Authorization: Bearer <access-token>
Role: provider
```

### Update Availability
```http
PATCH /api/availability/:id
Authorization: Bearer <access-token>
Role: provider
```

### Delete Availability
```http
DELETE /api/availability/:id
Authorization: Bearer <access-token>
Role: provider
```

### Set Exception (Holiday/Vacation)
```http
POST /api/availability/exception
Authorization: Bearer <access-token>
Role: provider
Content-Type: application/json

{
  "date": "2025-12-25",
  "slots": [],
  "reason": "Christmas Holiday"
}
```

---

## 👨‍💼 Admin Endpoints

All admin endpoints require `admin` role.

### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <access-token>
Role: admin
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "customer": 800,
      "provider": 190,
      "admin": 10
    },
    "services": {
      "totalServices": 500,
      "activeServices": 450,
      "avgPrice": 75.5,
      "avgRating": 4.3
    },
    "bookings": {
      "total": 2000,
      "pending": 50,
      "accepted": 100,
      "completed": 1800,
      "cancelled": 50
    },
    "reviews": {
      "totalReviews": 1500,
      "avgRating": 4.5,
      "verifiedReviews": 1200
    }
  }
}
```

### Get Recent Activities
```http
GET /api/admin/activities?limit=10
Authorization: Bearer <access-token>
Role: admin
```

### Get System Health
```http
GET /api/admin/health
Authorization: Bearer <access-token>
Role: admin
```

### Get Pending Bookings
```http
GET /api/admin/pending-bookings
Authorization: Bearer <access-token>
Role: admin
```

### Get Users by Role
```http
GET /api/admin/users/:role?page=1&limit=20
Authorization: Bearer <access-token>
Role: admin
```

### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <access-token>
Role: admin
```

### Delete Service
```http
DELETE /api/admin/services/:id
Authorization: Bearer <access-token>
Role: admin
```

### Get All Bookings
```http
GET /api/admin/bookings?status=pending&page=1&limit=20
Authorization: Bearer <access-token>
Role: admin
```

### Get All Reviews
```http
GET /api/admin/reviews?rating=1&page=1&limit=20
Authorization: Bearer <access-token>
Role: admin
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "status": "fail"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NO_TOKEN` | 401 | No authentication token provided |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_TOKEN` | 401 | Token is invalid |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required role |
| `NOT_AUTHORIZED` | 403 | User doesn't own the resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `SLOT_UNAVAILABLE` | 409 | Time slot already booked |

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP

Exceeding the limit returns:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later",
  "errorCode": "RATE_LIMIT_EXCEEDED"
}
```

---

## Geospatial Queries

Many endpoints support location-based filtering using GeoJSON:

### Location Format
```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

### Example: Find Services Within 5km
```http
GET /api/services/near?lng=-73.935242&lat=40.730610&maxDistance=5000
```

---

## Best Practices

1. **Token Management**
   - Store tokens securely (HTTP-only cookies recommended)
   - Refresh access tokens before expiry
   - Implement token rotation on refresh

2. **Error Handling**
   - Always check `success` field in responses
   - Handle error codes appropriately
   - Display user-friendly messages

3. **Pagination**
   - Always use pagination for list endpoints
   - Cache pagination metadata

4. **Geospatial**
   - Use appropriate `maxDistance` for your use case
   - Index location fields for performance

---

## API Versioning

Current version: `v1` (implicit)

Future versions will use URL prefix: `/api/v2/`
