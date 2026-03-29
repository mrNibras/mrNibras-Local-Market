# 🚀 How to Run & Test Local Link in Browser

## Quick Start Guide

Follow these steps to run and test the application in your browser.

---

## Step 1: Start MongoDB

### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod

# Or if you have MongoDB as a service
sudo systemctl start mongod
```

### Option B: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name local-link-mongo mongo:7
```

### Option C: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env` with your connection string

---

## Step 2: Start Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies (if not done)
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# At minimum, set:
# - MONGODB_URI=mongodb://localhost:27017/local-link
# - JWT_SECRET=your-secret-key-here

# Start development server
npm run dev
```

**Backend will run on**: `http://localhost:5000`

### Verify Backend is Running
Open browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "...",
  "environment": "development"
}
```

---

## Step 3: Start Frontend Application

Open a **new terminal** (keep backend running):

```bash
# Navigate to project root
cd /home/mrnibra/mrNibras\ Local\ Market/local-link-main

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

**Frontend will run on**: `http://localhost:5173`

---

## Step 4: Open in Browser

### Access the Application

1. **Homepage**: http://localhost:5173
2. **Services Page**: http://localhost:5173/services
3. **API Docs**: http://localhost:5000/api

---

## 🧪 Manual Testing Checklist

### 1. Homepage Testing
```
☐ Open http://localhost:5173
☐ Verify navbar displays
☐ Verify hero section shows
☐ Verify categories section
☐ Verify featured services
☐ Verify footer displays
☐ Test responsive design (resize browser)
```

### 2. Navigation Testing
```
☐ Click on "Services" link
☐ Verify URL changes to /services
☐ Click on "Login" link
☐ Click on "Register" link
☐ Test browser back/forward buttons
```

### 3. Services Page Testing
```
☐ Browse services list
☐ Test search functionality
☐ Test category filter
☐ Test price filter
☐ Click on a service card
☐ Verify service detail page loads
```

### 4. Authentication Testing
```
☐ Click "Register"
☐ Fill registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: SecurePass123
   - Role: Customer
☐ Submit form
☐ Verify redirect to dashboard
☐ Check browser console for errors
```

### 5. API Testing (Using Browser DevTools)

Open DevTools (F12) → Console tab:

```javascript
// Test 1: Register a user
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Browser Test',
    email: `test${Date.now()}@test.com`,
    password: 'SecurePass123',
    role: 'customer'
  })
})
.then(res => res.json())
.then(data => console.log('Register:', data));

// Test 2: Login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login:', data);
  // Save token for next test
  window.authToken = data.data.accessToken;
});

// Test 3: Get current user (requires token)
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${window.authToken}`
  }
})
.then(res => res.json())
.then(data => console.log('Profile:', data));

// Test 4: Get all services
fetch('http://localhost:5000/api/services')
  .then(res => res.json())
  .then(data => console.log('Services:', data));
```

---

## 🎨 Visual Testing

### Desktop View (1920x1080)
1. Open http://localhost:5173
2. Press F12 → Device Toolbar
3. Select "Responsive" → Set to 1920x1080
4. Verify layout

### Tablet View (768x1024)
1. In Device Toolbar, select "iPad"
2. Verify responsive layout
3. Test touch interactions

### Mobile View (375x667)
1. In Device Toolbar, select "iPhone SE"
2. Verify mobile layout
3. Test hamburger menu
4. Test touch interactions

---

## 🔧 Browser DevTools Testing

### Network Tab
1. Open DevTools → Network tab
2. Refresh page
3. Verify all API calls succeed (status 200)
4. Check for failed requests (red)
5. Inspect request/response payloads

### Console Tab
1. Open DevTools → Console tab
2. Look for errors (red text)
3. Look for warnings (yellow text)
4. No errors should appear

### Application Tab
1. Open DevTools → Application tab
2. Check Local Storage
3. Check Session Storage
4. Verify no sensitive data stored

### Performance Tab
1. Open DevTools → Performance tab
2. Click Record
3. Refresh page
4. Stop recording
5. Check load time (< 3 seconds)
6. Check for performance issues

---

## 🧪 Automated Browser Testing

### Run Playwright Tests with UI
```bash
npx playwright test --ui
```

This opens a browser-like UI where you can:
- See all tests
- Run individual tests
- Watch test execution
- View screenshots/videos

### Run Specific Browser Test
```bash
# Run homepage tests
npx playwright test --grep "Homepage"

# Run authentication tests
npx playwright test --grep "Authentication"

# Run mobile tests
npx playwright test --grep "Mobile"
```

### Generate HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

This opens a beautiful HTML report in your browser showing:
- All test results
- Screenshots
- Videos
- Execution traces

---

## 🐛 Debugging in Browser

### Enable Debug Mode
```bash
# Backend
cd server
DEBUG=* npm run dev

# Frontend (in another terminal)
npm run dev
```

### Common Issues & Fixes

**Issue**: Backend not starting
```bash
# Check MongoDB is running
pgrep -x mongod

# Check port is not in use
lsof -i :5000

# Kill process on port 5000
kill -9 $(lsof -t -i:5000)
```

**Issue**: Frontend not loading
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

**Issue**: API calls failing
```bash
# Check CORS origin in server/.env
CORS_ORIGIN=http://localhost:5173

# Check backend is running
curl http://localhost:5000/health
```

---

## 📱 Mobile Testing

### Using Chrome DevTools
1. Open http://localhost:5173
2. Press F12
3. Click Device Toolbar (Ctrl+Shift+M)
4. Select device:
   - iPhone 12 Pro
   - Pixel 5
   - Samsung Galaxy S20
5. Test all features

### Using Real Mobile Device
1. Find your computer's IP address:
   ```bash
   # Linux
   ip addr show
   
   # Or
   hostname -I
   ```

2. Update `vite.config.ts`:
   ```javascript
   export default defineConfig({
     server: {
       host: '0.0.0.0', // Allow external access
       port: 5173
     }
   });
   ```

3. On mobile browser, go to:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```

---

## ✅ Browser Testing Checklist

### Functionality
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Services page loads
- [ ] Search works
- [ ] Filters work
- [ ] Service detail loads
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Profile updates work

### UI/UX
- [ ] No layout issues
- [ ] Images load properly
- [ ] Fonts render correctly
- [ ] Colors consistent
- [ ] Buttons clickable
- [ ] Forms validate
- [ ] Error messages show
- [ ] Success messages show

### Performance
- [ ] Page loads < 3 seconds
- [ ] No console errors
- [ ] No network errors
- [ ] Smooth scrolling
- [ ] Fast interactions

### Responsive
- [ ] Desktop layout works
- [ ] Tablet layout works
- [ ] Mobile layout works
- [ ] Hamburger menu works
- [ ] Touch targets adequate

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus visible
- [ ] Alt text on images
- [ ] Proper headings
- [ ] Color contrast good

---

## 🎯 Quick Test Commands

```bash
# Start everything
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Run tests
npx playwright test --ui
```

### URLs to Test
```
Homepage:     http://localhost:5173
Services:     http://localhost:5173/services
API Health:   http://localhost:5000/health
API Docs:     http://localhost:5000/api
Playwright UI: npx playwright test --ui
HTML Report:  npx playwright show-report
```

---

## 🎉 Success Criteria

Your application is working correctly if:

1. ✅ Backend starts without errors
2. ✅ Frontend starts without errors
3. ✅ Homepage loads at http://localhost:5173
4. ✅ API health returns success at http://localhost:5000/health
5. ✅ No console errors in browser
6. ✅ All navigation links work
7. ✅ Registration/Login works
8. ✅ Services display correctly
9. ✅ Responsive design works
10. ✅ All Playwright tests pass

---

**Happy Testing! 🚀**
