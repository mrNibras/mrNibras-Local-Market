#!/bin/bash
# Test Booking and Messaging System

echo "========================================="
echo "Testing Local Link Booking & Messaging"
echo "========================================="
echo ""

# Step 1: Register a test user
echo "Step 1: Registering test user..."
REGISTER=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@test.com",
    "password": "Test123456",
    "role": "customer"
  }')

TOKEN=$(echo $REGISTER | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to register user"
  echo "Response: $REGISTER"
  exit 1
fi

echo "✅ User registered successfully"
echo "   Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Get a service
echo "Step 2: Getting a service..."
SERVICES=$(curl -s http://localhost:5000/api/services)
SERVICE_ID=$(echo $SERVICES | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
PROVIDER_ID=$(echo $SERVICES | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['provider']['_id'] if d.get('data') and d['data'][0].get('provider') else '')" 2>/dev/null)

if [ -z "$SERVICE_ID" ] || [ -z "$PROVIDER_ID" ]; then
  echo "❌ Failed to get service"
  exit 1
fi

echo "✅ Got service: $SERVICE_ID"
echo "   Provider: $PROVIDER_ID"
echo ""

# Step 3: Test Booking
echo "Step 3: Testing booking creation..."
BOOKING=$(curl -s -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "provider": "'$PROVIDER_ID'",
    "service": "'$SERVICE_ID'",
    "bookingDate": "'$(date -d '+2 days' -Iseconds)'",
    "duration": 60,
    "note": "Test booking from script"
  }')

BOOKING_SUCCESS=$(echo $BOOKING | grep -o '"success":true')

if [ "$BOOKING_SUCCESS" = '"success":true' ]; then
  echo "✅ Booking created successfully!"
  echo "   Response: $(echo $BOOKING | head -c 100)..."
else
  echo "❌ Booking failed"
  echo "   Response: $BOOKING"
fi
echo ""

# Step 4: Test Message
echo "Step 4: Testing message sending..."
MESSAGE=$(curl -s -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recipient": "'$PROVIDER_ID'",
    "service": "'$SERVICE_ID'",
    "subject": "Test Message",
    "content": "This is a test message from the test script",
    "messageType": "inquiry"
  }')

MESSAGE_SUCCESS=$(echo $MESSAGE | grep -o '"success":true')

if [ "$MESSAGE_SUCCESS" = '"success":true' ]; then
  echo "✅ Message sent successfully!"
  echo "   Response: $(echo $MESSAGE | head -c 100)..."
else
  echo "❌ Message failed"
  echo "   Response: $MESSAGE"
fi
echo ""

echo "========================================="
echo "Test Complete!"
echo "========================================="
