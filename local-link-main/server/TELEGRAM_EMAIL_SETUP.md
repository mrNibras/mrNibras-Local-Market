# 📱 Telegram & Email Notification Setup Guide

## 🎯 Overview

When a customer:
1. **Confirms a booking** → Provider receives notification via Telegram AND Email
2. **Sends a message** → Provider receives notification via Telegram AND Email

---

## 📧 Part 1: Email Setup

### Option A: Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "mrNibras" as the name
   - Copy the 16-character password

3. **Update `.env` file**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=mrNibras <your-email@gmail.com>
   ```

### Option B: Other Email Providers

| Provider | SMTP Host | Port |
|----------|-----------|------|
| **Yahoo** | smtp.mail.yahoo.com | 587 |
| **Outlook** | smtp-mail.outlook.com | 587 |
| **Custom** | Your SMTP server | 587 or 465 |

---

## 📱 Part 2: Telegram Bot Setup

### Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Send `/newbot`** command
3. **Choose a name** for your bot (e.g., "mrNibras Notifications")
4. **Choose a username** (must end in 'bot', e.g., `mrnibras_notify_bot`)
5. **Copy the Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`)

### Step 2: Get Your Chat ID

1. **Start a chat** with your new bot
2. **Send any message** (e.g., "Hello")
3. **Open this URL** in your browser:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. **Find your chat ID** in the response:
   ```json
   {
     "result": [{
       "message": {
         "chat": {
           "id": 123456789
         }
       }
     }]
   }
   ```
5. **Copy the `id` value** (this is your chat ID)

### Step 3: Update `.env` file

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
APP_URL=https://your-app.vercel.app
```

### Step 4: Set Chat ID in User Profile

**Via API:**
```bash
curl -X PATCH http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramChatId": "123456789",
    "telegramUsername": "your_telegram_username"
  }'
```

**Or via MongoDB:**
```javascript
db.users.updateOne(
  { email: "provider@example.com" },
  { $set: { telegramChatId: "123456789", telegramUsername: "your_username" } }
)
```

---

## 🔔 Part 3: How It Works

### When Customer Creates Booking:

**Provider Receives:**

1. **Telegram Message:**
   ```
   🔔 NEW BOOKING CONFIRMED!
   
   👤 Customer: John Doe
   🛠 Service: Professional Plumbing
   📅 Date: Monday, April 8, 2026 at 10:00 AM
   ⏱ Duration: 60 minutes
   💰 Price: 150 ETB
   
   📝 Notes: Please call when you arrive
   
   🆔 Booking ID: 69ca1234...
   
   ✅ Please accept this booking to confirm it.
   ```

2. **Email:**
   - Beautiful HTML email with booking details
   - "View Booking in Dashboard" button
   - Customer information
   - Service details

### When Customer Sends Message:

**Provider Receives:**

1. **Telegram Message:**
   ```
   💬 NEW MESSAGE RECEIVED!
   
   👤 From: John Doe
   🛠 Service: Professional Plumbing
   📧 Subject: Question about availability
   
   📝 Message:
   Hi, are you available next week?
   
   🆔 Message ID: 69ca5678...
   
   💡 Login to your dashboard to respond.
   ```

2. **Email:**
   - HTML email with full message
   - "View Messages in Dashboard" button
   - Customer details
   - Complete message content

---

## ✅ Part 4: Testing

### Test Email:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Then send a test message
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "PROVIDER_ID",
    "subject": "Test Message",
    "content": "This is a test"
  }'
```

### Test Telegram:
```bash
curl -X GET "https://api.telegram.org/botYOUR_BOT_TOKEN/getMe"

# Should return bot info
```

---

## 🎯 Part 5: Provider Setup Flow

### For Each Provider:

1. **Provider creates account** on platform
2. **Provider contacts bot** on Telegram (`@your_bot_name`)
3. **Provider sends `/start`** to bot
4. **System saves chat ID** (automatically or manually)
5. **Provider adds email** to profile
6. **Notifications enabled!** ✅

### Automated Chat ID Capture:

You can create a Telegram bot endpoint that automatically saves chat IDs:

```javascript
// Webhook handler for Telegram updates
app.post('/webhook/telegram', async (req, res) => {
  const update = req.body;
  
  if (update.message) {
    const chatId = update.message.chat.id;
    const username = update.message.from.username;
    
    // Find user by telegram username
    const user = await User.findOne({ telegramUsername: username });
    
    if (user) {
      user.telegramChatId = chatId.toString();
      await user.save();
    }
  }
  
  res.status(200).send('OK');
});
```

---

## 🔧 Part 6: Environment Variables

### Required for Notifications:

```bash
# Email (at least one method)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Telegram (optional but recommended)
TELEGRAM_BOT_TOKEN=your_bot_token

# App URL (for notification links)
APP_URL=https://your-app.vercel.app
```

### Notifications are:
- ✅ **Non-blocking** - Won't slow down booking/message creation
- ✅ **Fault-tolerant** - If Telegram/Email fails, booking/message still works
- ✅ **Logged** - All notification attempts are logged
- ✅ **Optional** - System works even if not configured

---

## 📊 Part 7: What Gets Notified

| Event | Telegram | Email |
|-------|----------|-------|
| **New Booking** | ✅ Yes | ✅ Yes |
| **New Message** | ✅ Yes | ✅ Yes |
| **Booking Accepted** | ✅ Yes | ✅ Yes |
| **Booking Rejected** | ✅ Yes | ✅ Yes |
| **Booking Completed** | ✅ Yes | ✅ Yes |
| **Payment Received** | ✅ Yes | ✅ Yes |

---

## 🎉 Setup Complete!

Once configured:
1. ✅ Providers get instant Telegram notifications
2. ✅ Providers get detailed email notifications
3. ✅ All notifications include actionable links
4. ✅ Beautiful HTML emails with branding
5. ✅ Non-blocking - won't affect user experience

**Your providers will never miss a booking or message!** 🚀
