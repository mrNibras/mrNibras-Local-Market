# Deployment Guide

This guide will walk you through deploying the **backend to Render** and **frontend to Vercel**.

---

## Prerequisites

1. **MongoDB Atlas Account** (Free tier available)
   - Create at: https://www.mongodb.com/cloud/atlas
   - Create a cluster and get your connection string

2. **Render Account**
   - Sign up at: https://render.com
   - Free tier available

3. **Vercel Account**
   - Sign up at: https://vercel.com
   - Free tier available

4. **Stripe Account** (Optional, for payments)
   - Get API keys from: https://dashboard.stripe.com/apikeys

5. **Email Service** (Optional, for notifications)
   - Gmail or other SMTP provider

---

## Step 1: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://render.com/dashboard
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables**
   
   Fill in the following variables in Render dashboard:
   
   | Variable | Value | Notes |
   |----------|-------|-------|
   | `MONGODB_URI` | `mongodb+srv://...` | From MongoDB Atlas |
   | `JWT_SECRET` | (generate random) | Run: `openssl rand -base64 64` |
   | `CLIENT_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (set after deploying frontend) |
   | `STRIPE_SECRET_KEY` | `sk_test_...` | From Stripe (optional) |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe (optional) |
   | `SMTP_USER` | `your-email@gmail.com` | Your email (optional) |
   | `SMTP_PASS` | `your-app-password` | App-specific password (optional) |
   | `SMTP_FROM` | `mrNibras <noreply@yourdomain.com>` | Sender email (optional) |

4. **Deploy**
   - Click **"Apply"**
   - Wait for deployment to complete (~2-3 minutes)
   - Copy your backend URL (e.g., `https://local-link-api.onrender.com`)

### Option B: Manual Deployment

1. **Create a new Web Service on Render**
   - Go to https://render.com/dashboard
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository

2. **Configure the service**
   - **Name**: `local-link-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

3. **Add Environment Variables** (same as Option A table above)

4. **Deploy**

---

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel CLI

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm install -g vercel
   ```

2. **Navigate to project root**
   ```bash
   cd "local-link-main"
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production: `vercel --prod`

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   ```
   - Enter your Render backend URL: `https://local-link-api.onrender.com/api`

### Option B: Using Vercel Dashboard

1. **Push code to GitHub** (if not already done)
   ```bash
   git push origin main
   ```

2. **Import Project**
   - Go to https://vercel.com/new
   - Click **"Import Git Repository"**
   - Select your repository
   - Vercel will auto-detect Vite

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `local-link-main`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

4. **Add Environment Variables**
   
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://local-link-api.onrender.com/api` |
   | `VITE_SUPABASE_URL` | Your Supabase URL (if using) |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase key (if using) |

5. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment to complete (~1 minute)
   - Copy your frontend URL (e.g., `https://your-app.vercel.app`)

---

## Step 3: Connect Frontend and Backend

1. **Update Backend CORS**
   - Go to Render Dashboard → Your backend service → Environment
   - Update `CLIENT_URL` to your Vercel URL: `https://your-app.vercel.app`
   - Click **"Save Changes"** (Render will auto-redeploy)

2. **Test the Connection**
   - Visit your Vercel frontend URL
   - Try to register/login
   - Check browser console for any CORS errors

---

## Step 4: Set Up MongoDB Atlas

If you haven't already:

1. **Create a Cluster**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free M0 cluster

2. **Create Database User**
   - Go to **Database Access** → **Add New Database User**
   - Set username and password
   - Grant read/write permissions

3. **Whitelist IP Addresses**
   - Go to **Network Access** → **Add IP Address**
   - For Render: Add `0.0.0.0/0` (allow from anywhere) or Render's IP range
   - Or use **MongoDB Atlas Device Authentication**

4. **Get Connection String**
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/local-link?retryWrites=true&w=majority`

5. **Update Render**
   - Set `MONGODB_URI` in Render environment variables

---

## Step 5: Configure Stripe (Optional)

1. **Get API Keys**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy **Secret Key** (starts with `sk_test_`)
   - Copy **Publishable Key** (starts with `pk_test_`)

2. **Set Up Webhook**
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://local-link-api.onrender.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Webhook Secret** (starts with `whsec_`)

3. **Update Render**
   - Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Render

---

## Step 6: Configure Email (Optional)

For Gmail:

1. **Enable 2-Step Verification** on your Google account

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Generate a new app password for "Mail"

3. **Update Render**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=mrNibras <your-email@gmail.com>
   ```

---

## Verification Checklist

- [ ] Backend deployed on Render and accessible
- [ ] Frontend deployed on Vercel and accessible
- [ ] MongoDB Atlas connected and working
- [ ] CORS configured correctly (no console errors)
- [ ] User registration/login works
- [ ] Services can be created and viewed
- [ ] (Optional) Stripe payments working
- [ ] (Optional) Email notifications working

---

## Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Verify `MONGODB_URI` and `JWT_SECRET` are set
- Ensure MongoDB Atlas allows connections from Render IPs

### CORS errors in browser console
- Verify `CLIENT_URL` in Render matches your Vercel URL exactly
- Check for trailing slashes (should not have them)

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that backend URL is accessible
- Redeploy frontend after changing environment variables

### MongoDB connection timeout
- Check MongoDB Atlas network access settings
- Whitelist Render IPs or use `0.0.0.0/0`
- Verify connection string is correct

---

## Environment Variables Reference

### Backend (Render)

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=mrNibras <noreply@yourdomain.com>
```

### Frontend (Vercel)

```bash
VITE_API_URL=https://local-link-api.onrender.com/api
VITE_SUPABASE_URL=your_supabase_url (optional)
VITE_SUPABASE_ANON_KEY=your_supabase_key (optional)
```

---

## Useful Commands

```bash
# Check backend logs (Render Dashboard)
# View frontend logs (Vercel Dashboard → Functions → Logs)

# Redeploy frontend after env changes
vercel --prod

# Test backend locally
cd server && npm run dev

# Test frontend locally
npm run dev
```

---

## Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
