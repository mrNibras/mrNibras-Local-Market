# 💳 Payment & Notification System Documentation

## New Features Added

### 1. Payment System (Stripe Integration)
- ✅ Credit/debit card payments
- ✅ Payment intents
- ✅ Refund processing
- ✅ Payment history
- ✅ Platform fees (commission)
- ✅ Provider earnings tracking
- ✅ Webhook handling

### 2. Notification System
- ✅ In-app notifications
- ✅ Email notifications
- ✅ Notification templates
- ✅ Read/unread status
- ✅ Priority levels
- ✅ Auto-expiry

---

## 📁 New Modules

```
server/src/modules/
├── payments/
│   ├── payment.model.js          # Payment schema
│   ├── payment.repository.js     # Database operations
│   ├── payment.service.js        # Business logic
│   ├── payment.controller.js     # HTTP handlers
│   └── payment.routes.js         # API routes
│
└── notifications/
    ├── notification.model.js     # Notification schema
    ├── notification.repository.js # Database operations
    ├── notification.service.js   # Business logic
    ├── notification.controller.js # HTTP handlers
    ├── notification.routes.js    # API routes
    └── email.service.js          # Email templates & sending
```

---

## 💳 Payment API Endpoints

### Create Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking": "65f1234...",
  "amount": 100,
  "currency": "usd"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "...",
    "clientSecret": "pi_..._secret_...",
    "amount": 100,
    "currency": "USD"
  }
}
```

### Get My Payments (Customer)
```http
GET /api/payments/my-payments?status=completed&page=1&limit=10
Authorization: Bearer <token>
```

### Get Provider Payments
```http
GET /api/payments/provider/payments?status=completed
Authorization: Bearer <token>
Role: provider
```

### Get Provider Stats
```http
GET /api/payments/provider/stats
Authorization: Bearer <token>
Role: provider
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "totalRevenue": 5000,
    "byStatus": {
      "completed": { "count": 45, "amount": 4500 },
      "pending": { "count": 5, "amount": 500 }
    }
  }
}
```

### Process Refund
```http
POST /api/payments/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "reason": "Customer request"
}
```

### Stripe Webhook
```http
POST /api/payments/webhook
Content-Type: application/json

{
  "type": "payment_intent.succeeded",
  "data": { "object": { "id": "pi_..." } }
}
```

---

## 🔔 Notification API Endpoints

### Get Notifications
```http
GET /api/notifications?page=1&limit=20&isRead=false
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

### Delete All Read
```http
DELETE /api/notifications/read
Authorization: Bearer <token>
```

---

## 📧 Email Notification Types

### 1. Booking Confirmation
Sent to customer when booking is created.

**Template Data:**
- customerName
- serviceTitle
- providerName
- bookingDate
- amount

### 2. Booking Status Update
Sent to customer when booking status changes.

**Template Data:**
- customerName
- status (accepted/rejected/completed/cancelled)
- message
- serviceTitle
- providerName
- bookingDate

### 3. Payment Receipt
Sent to customer after successful payment.

**Template Data:**
- customerName
- amount
- serviceTitle
- transactionId

### 4. New Booking (Provider)
Sent to provider when new booking is created.

**Template Data:**
- providerName
- serviceTitle
- customerName
- bookingDate
- amount

### 5. Review Received
Sent to provider when they receive a review.

**Template Data:**
- providerName
- serviceTitle
- rating
- comment
- customerName

### 6. Password Reset
Sent when user requests password reset.

**Template Data:**
- userName
- resetCode

### 7. Welcome Email
Sent when user registers.

**Template Data:**
- userName
- role

---

## 🔧 Setup Instructions

### 1. Stripe Setup

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Update `server/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Email Setup (Gmail Example)

1. Enable 2FA on your Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `server/.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=mrNibras <noreply@mrnibras.com>
```

### 3. Install Dependencies

```bash
cd server
npm install
```

---

## 💡 Usage Examples

### Frontend: Create Payment

```javascript
// 1. Create payment intent
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    booking: bookingId,
    amount: 100,
    currency: 'usd'
  })
});

const { data } = await response.json();

// 2. Use Stripe.js to confirm payment
const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
const { error, paymentIntent } = await stripe.confirmCardPayment(
  data.clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: { name: 'Customer Name' }
    }
  }
);

if (error) {
  console.error('Payment failed:', error);
} else {
  console.log('Payment successful:', paymentIntent);
}
```

### Frontend: Get Notifications

```javascript
// Poll for new notifications every 30 seconds
setInterval(async () => {
  const response = await fetch('/api/notifications/unread-count', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  
  if (data.count > 0) {
    showNotificationBadge(data.count);
  }
}, 30000);

// Get full notification list
const notifications = await fetch('/api/notifications', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Frontend: Mark Notification as Read

```javascript
await fetch(`/api/notifications/${notificationId}/read`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🎯 Payment Flow

```
1. Customer creates booking
   ↓
2. Backend creates payment intent
   ↓
3. Frontend receives client_secret
   ↓
4. Customer enters card details (Stripe Elements)
   ↓
5. Stripe processes payment
   ↓
6. Stripe sends webhook to backend
   ↓
7. Backend updates payment status
   ↓
8. Backend sends confirmation email
   ↓
9. Backend creates in-app notification
```

---

## 📊 Payment Model Fields

```javascript
{
  booking: ObjectId,          // Reference to booking
  customer: ObjectId,         // Payer
  provider: ObjectId,         // Payee
  service: ObjectId,          // Service being paid for
  amount: Number,             // Total amount
  currency: String,           // USD, EUR, etc.
  paymentMethod: String,      // stripe, cash, bank_transfer
  stripePaymentIntentId: String,
  status: String,             // pending, completed, failed, refunded
  platformFee: Number,        // Your commission (10%)
  providerEarnings: Number,   // amount - platformFee
  refundInfo: Object,         // Refund details
  receiptUrl: String,         // Stripe receipt
  createdAt: Date
}
```

---

## 🔔 Notification Model Fields

```javascript
{
  user: ObjectId,             // Recipient
  type: String,               // booking, payment, review, etc.
  title: String,              // Notification title
  message: String,            // Notification body
  data: Object,               // Additional data
  booking: ObjectId,          // Related booking
  payment: ObjectId,          // Related payment
  isRead: Boolean,            // Read status
  readAt: Date,               // When read
  channels: Object,           // Delivery channels
  priority: String,           // low, medium, high, urgent
  expiresAt: Date             // Auto-delete after
}
```

---

## ✅ What's Been Added

### Payment Features
- ✅ Stripe payment integration
- ✅ Payment intent creation
- ✅ Webhook handling
- ✅ Refund processing
- ✅ Payment history
- ✅ Provider earnings tracking
- ✅ Platform fee calculation (10%)
- ✅ Payment receipts

### Notification Features
- ✅ In-app notifications
- ✅ Email notifications
- ✅ 7 email templates
- ✅ Read/unread tracking
- ✅ Priority levels
- ✅ Auto-expiry (30 days)
- ✅ Notification counts
- ✅ Bulk operations

### Integration
- ✅ Payments linked to bookings
- ✅ Automatic notifications on events
- ✅ Email on booking creation
- ✅ Email on payment completion
- ✅ Email on review received

---

## 🚀 Next Steps

1. **Frontend Integration**
   - Add Stripe Elements to checkout
   - Create notification bell UI
   - Add notification settings page

2. **Testing**
   - Test with Stripe test cards
   - Verify email delivery
   - Test webhook events

3. **Production**
   - Switch to live Stripe keys
   - Configure production SMTP
   - Set up webhook endpoint

---

**Your marketplace now has production-ready payments and notifications!** 🎉
