# ⚡ Quick Start - Run & Test in Browser

## 🚀 Option 1: One-Click Start (Recommended)

```bash
# Run the start script
./start.sh
```

This will:
- ✅ Check MongoDB
- ✅ Install dependencies
- ✅ Start backend (port 5000)
- ✅ Start frontend (port 5173)
- ✅ Open browser automatically

**Then open**: http://localhost:5173

---

## 🚀 Option 2: Manual Start

### Terminal 1 - Backend
```bash
cd server
npm run dev
```
Backend runs on: **http://localhost:5000**

### Terminal 2 - Frontend
```bash
npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## 🧪 Option 3: Test Page

Open the interactive test page directly in your browser:

```bash
# Open test page
firefox test-page.html
# or
google-chrome test-page.html
# or simply double-click test-page.html
```

**Features:**
- ✅ Register users
- ✅ Login/logout
- ✅ Create services
- ✅ Test API endpoints
- ✅ Live console logging

---

## 📋 Quick Test Checklist

### 1. Verify Backend
Open: http://localhost:5000/health
```json
✅ Should show: {"success": true, "message": "API is running"}
```

### 2. Verify Frontend
Open: http://localhost:5173
```
✅ Should see: Homepage with navbar, hero section, etc.
```

### 3. Test API in Browser
Open DevTools (F12) → Console, then run:
```javascript
// Test registration
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@test.com',
    password: 'SecurePass123',
    role: 'customer'
  })
}).then(r => r.json()).then(console.log)
```

---

## 🎯 Key URLs

| Page | URL |
|------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5000/api |
| **Health Check** | http://localhost:5000/health |
| **Test Page** | file://.../test-page.html |

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check MongoDB
pgrep -x mongod

# Start MongoDB if needed
sudo systemctl start mongod
```

### Port already in use
```bash
# Kill process on port 5000
kill -9 $(lsof -t -i:5000)

# Kill process on port 5173
kill -9 $(lsof -t -i:5173)
```

### Frontend build errors
```bash
# Clear cache
rm -rf node_modules/.vite

# Reinstall
npm install

# Restart
npm run dev
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Backend terminal shows: "MongoDB Connected"
2. ✅ Backend terminal shows: "Server running on port 5000"
3. ✅ Frontend terminal shows: "Local: http://localhost:5173"
4. ✅ http://localhost:5000/health returns success
5. ✅ http://localhost:5173 loads the homepage
6. ✅ No console errors in browser (F12)

---

## 🎨 Browser Testing

### Desktop
1. Open http://localhost:5173
2. Navigate through pages
3. Test all features

### Mobile
1. Press F12 → Device Toolbar
2. Select iPhone/Android
3. Test responsive design

### API Testing
1. Open http://localhost:5000/api
2. See all available endpoints
3. Use test-page.html for interactive testing

---

## 📊 Run Tests

### Backend Tests
```bash
cd server
node __tests__/runTests.js
```

### Integration Tests
```bash
node scripts/test-integration.js
```

### E2E Tests (with UI)
```bash
npx playwright test --ui
```

---

**Happy Testing! 🎉**

For detailed instructions, see: `RUN_IN_BROWSER.md`
