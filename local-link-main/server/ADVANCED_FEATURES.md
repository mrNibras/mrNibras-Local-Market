# 🚀 Advanced Features Documentation

## New Modules Added

### 1. Offer/Negotiation System 💼
### 2. Real-Time Chat 💬
### 3. Socket.io Integration 🔌

---

## 💼 Offer/Negotiation System

### Overview

Enables price negotiation between customers and providers, similar to Fiverr/Upwork.

### Flow

```
Customer creates offer
     ↓
Provider receives notification
     ↓
Provider: Accept / Reject / Counter
     ↓
If countered → Customer can accept
     ↓
If accepted → Booking created automatically
     ↓
Payment triggered
```

### API Endpoints

#### Create Offer
```http
POST /api/offers
Authorization: Bearer <token>
Content-Type: application/json

{
  "service": "65f1234...",
  "proposedPrice": 80,
  "description": "Can you do this for $80?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "service": {...},
    "customer": {...},
    "provider": {...},
    "proposedPrice": 80,
    "status": "pending",
    "expiresAt": "2026-04-02T00:00:00.000Z",
    "negotiationHistory": [...]
  }
}
```

#### Respond to Offer (Provider)
```http
PATCH /api/offers/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "counter",
  "counterPrice": 90,
  "message": "Best I can do is $90"
}
```

**Actions:**
- `accept` - Accept the offer
- `reject` - Reject the offer
- `counter` - Make a counter-offer

#### Accept Counter Offer (Customer)
```http
PATCH /api/offers/:id/accept-counter
Authorization: Bearer <token>
```

#### Withdraw Offer (Customer)
```http
PATCH /api/offers/:id/withdraw
Authorization: Bearer <token>
```

#### Get My Offers (Customer)
```http
GET /api/offers/my-offers/customer?status=pending&page=1
Authorization: Bearer <token>
```

#### Get My Offers (Provider)
```http
GET /api/offers/my-offers/provider
Authorization: Bearer <token>
```

#### Get Offer Statistics
```http
GET /api/offers/stats
Authorization: Bearer <token>
```

### Offer Model

```javascript
{
  service: ObjectId,
  customer: ObjectId,
  provider: ObjectId,
  proposedPrice: Number,
  counterPrice: Number,
  description: String,
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired',
  expiresAt: Date, // Auto-expire after 24h
  negotiationHistory: [{
    type: 'offer' | 'counter' | 'accept' | 'reject',
    price: Number,
    by: ObjectId,
    timestamp: Date,
    message: String
  }],
  booking: ObjectId, // Created when accepted
  createdAt: Date
}
```

### Business Rules

1. **Self-offers prevented** - Can't offer on your own service
2. **Price validation** - Minimum 30% of listed price
3. **One active offer** - Per customer per service
4. **Auto-expiry** - Offers expire after 24 hours
5. **Negotiation history** - Full audit trail
6. **Auto-booking** - Accepted offers create bookings automatically

---

## 💬 Real-Time Chat System

### Overview

Production-ready chat with Socket.io for instant messaging.

### Features

- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online/offline status
- ✅ Chat rooms (per booking/offer)
- ✅ Message editing/deletion
- ✅ System messages
- ✅ File/image support (future)

### API Endpoints

#### Get or Create Chat
```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "participants": ["65f1234...", "65f5678..."],
  "booking": "65f9012...",
  "offer": "65f3456..."
}
```

#### Get My Chats
```http
GET /api/chat?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Chat Messages
```http
GET /api/chat/:chatId/messages?before=2026-03-29T00:00:00Z
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/chat/:chatId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello!",
  "type": "text"
}
```

#### Mark as Read
```http
PATCH /api/chat/:chatId/read
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /api/chat/unread-count
Authorization: Bearer <token>
```

### Socket.io Events

### Client → Server

```javascript
// Join chat room
socket.emit('joinChat', { chatId });

// Send message
socket.emit('sendMessage', {
  chatId,
  content: 'Hello!',
  type: 'text'
});

// Typing indicator
socket.emit('typing', { chatId });
socket.emit('stopTyping', { chatId });

// Mark as read
socket.emit('markAsRead', { chatId });

// Edit message
socket.emit('editMessage', {
  messageId,
  content: 'Edited content'
});

// Delete message
socket.emit('deleteMessage', { messageId });

// Offer/Booking notifications
socket.emit('offerCreated', { offerId, providerId });
socket.emit('bookingUpdate', { bookingId, userId, status });
```

### Server → Client

```javascript
// New message
socket.on('newMessage', (data) => {
  // data: { chatId, message }
});

// User joined chat
socket.on('userJoined', (data) => {
  // data: { chatId, userId }
});

// User left chat
socket.on('userLeft', (data) => {
  // data: { chatId, userId }
});

// Typing indicator
socket.on('typing', (data) => {
  // data: { chatId, userId, userName }
});

// Messages read
socket.on('messagesRead', (data) => {
  // data: { chatId, userId }
});

// Message edited
socket.on('messageEdited', (data) => {
  // data: { messageId, content, edited }
});

// Message deleted
socket.on('messageDeleted', (data) => {
  // data: { messageId }
});

// Notifications
socket.on('notification', (data) => {
  // data: { type, chatId, from, message }
});

// Offer notifications
socket.on('offerNotification', (data) => {
  // data: { type, offerId, action }
});

// Booking notifications
socket.on('bookingNotification', (data) => {
  // data: { type, bookingId, status }
});

// Presence
socket.on('userOnline', (data) => {
  // data: { userId }
});

socket.on('userOffline', (data) => {
  // data: { userId }
});
```

### Frontend Integration Example

```javascript
import io from 'socket.io-client';

// Connect to Socket.io
const socket = io('http://localhost:5000', {
  auth: {
    token: authToken
  }
});

// Join chat room
socket.emit('joinChat', chatId);

// Listen for messages
socket.on('newMessage', (data) => {
  console.log('New message:', data.message);
  // Update UI
});

// Send message
socket.emit('sendMessage', {
  chatId,
  content: 'Hello!',
  type: 'text'
});

// Typing indicator
socket.emit('typing', { chatId });

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from chat');
});
```

---

## 🔌 Socket.io Setup

### Server Configuration

```javascript
// src/server.js
import http from 'http';
import { initSocket } from './modules/chat/chat.socket.js';

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io enabled');
});
```

### Client Configuration

```javascript
// Frontend (React example)
import { useEffect } from 'react';
import io from 'socket.io-client';

const useChatSocket = (authToken) => {
  const socket = io('http://localhost:5000', {
    auth: { token: authToken }
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socket;
};
```

---

## 📊 Chat + Offer Integration

### Complete Flow Example

1. **Customer browses services**
2. **Customer interested in service** → Creates offer
3. **Offer created** → Socket.io notifies provider
4. **Provider counters** → Socket.io notifies customer
5. **Customer accepts** → Booking created
6. **Chat auto-created** → Both can discuss details
7. **Payment processed** → Booking confirmed
8. **Service delivered** → Review submitted

### Automatic Chat Creation

When offer is created:
```javascript
// Automatically create chat
const chat = await Chat.findOrCreateChat(
  [customerId, providerId],
  { offer: offerId }
);

// Send system message
await Message.create({
  chat: chat._id,
  sender: null,
  content: `Offer created: $${proposedPrice}`,
  type: 'system'
});
```

When booking is accepted:
```javascript
// Notify via chat
socket.to(`chat:${chatId}`).emit('newMessage', {
  chatId,
  message: {
    content: 'Booking accepted! Please proceed with payment.',
    type: 'system'
  }
});
```

---

## 🎯 Advanced Features

### 1. Negotiation History

Full audit trail of all offer changes:
```json
{
  "negotiationHistory": [
    {
      "type": "offer",
      "price": 80,
      "by": "customer",
      "timestamp": "2026-03-29T10:00:00Z",
      "message": "Can you do $80?"
    },
    {
      "type": "counter",
      "price": 90,
      "by": "provider",
      "timestamp": "2026-03-29T11:00:00Z",
      "message": "Best I can do is $90"
    },
    {
      "type": "accept",
      "by": "customer",
      "timestamp": "2026-03-29T12:00:00Z"
    }
  ]
}
```

### 2. Read Receipts

Track who has read messages:
```javascript
message.readBy = [userId1, userId2];

// Display: ✓✓ (both read) or ✓ (one read)
```

### 3. Typing Indicators

Real-time typing status:
```javascript
// When user types
socket.emit('typing', { chatId });

// Show typing indicator in UI
socket.on('typing', ({ userId }) => {
  showTypingIndicator(userId);
});
```

### 4. Message Editing

Edit sent messages:
```javascript
// Edit within 5 minutes
socket.emit('editMessage', {
  messageId,
  content: 'Updated content'
});

// Shows "(edited)" label
```

### 5. System Messages

Automatic notifications in chat:
- "Offer created: $100"
- "Offer accepted"
- "Booking confirmed"
- "Payment received"

---

## ✅ What's Been Added

### Offer System
- ✅ Offer model with negotiation history
- ✅ Create/accept/reject/counter offers
- ✅ Auto-expiry (24 hours)
- ✅ Auto-booking on acceptance
- ✅ Offer statistics

### Chat System
- ✅ Chat and Message models
- ✅ Real-time messaging (Socket.io)
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Message editing/deletion
- ✅ System messages
- ✅ Chat rooms per booking/offer

### Integration
- ✅ Offers trigger chat creation
- ✅ Booking updates via chat
- ✅ Payment notifications
- ✅ Real-time notifications

---

## 🚀 Next Steps

### Frontend Implementation
1. Add offer UI (create/counter/accept)
2. Add chat interface
3. Connect Socket.io client
4. Show typing indicators
5. Display read receipts

### Testing
1. Test offer negotiation flow
2. Test real-time messaging
3. Test notifications
4. Test edge cases (expiry, withdrawal)

### Production
1. Configure Socket.io for production
2. Add message persistence
3. Add file upload support
4. Add message search

---

**Your marketplace now has Fiverr/Upwork-level features!** 🎉
