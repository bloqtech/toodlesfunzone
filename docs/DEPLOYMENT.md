# Deployment Guide

## ✅ Build Completed Successfully!

### Build Output
- **Server Bundle**: `dist/index.js` (156KB)
- **Frontend Assets**: `dist/public/`
  - `index.html` (0.74 KB)
  - `index-aaiV1M1n.css` (95.29 KB, gzipped: 16.29 KB)
  - `index-CKcXhPeu.js` (618.04 KB, gzipped: 160.60 KB)
- **Total Size**: ~39MB

---

## 🚀 Production Deployment

### Start Production Server

```bash
npm start
```

Or directly:
```bash
NODE_ENV=production node dist/index.js
```

The server will run on **port 5000** by default.

---

## 📋 Pre-Deployment Checklist

- [x] Build completed successfully
- [ ] Environment variables configured:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `DATABASE_URL` (Neon PostgreSQL)
  - `SESSION_SECRET`
  - `GOOGLE_CLIENT_ID` (if using Google OAuth)
  - `GOOGLE_CLIENT_SECRET`
  - `VITE_GA_MEASUREMENT_ID` (Google Analytics)
- [ ] Database migrations applied (`npm run db:push`)
- [ ] Operating hours configured (`npm run db:update-hours`)
- [ ] Time slots created (`npm run db:create-slots`)

---

## 🌐 Deployment Platforms

### Replit Deployment
If deploying on Replit:
1. The `.replit` file is already configured
2. Replit will automatically run `npm start` in production
3. Ensure all environment variables are set in Replit Secrets

### Other Platforms (Vercel, Railway, Render, etc.)

#### For Serverless/Edge Functions:
- Deploy `dist/index.js` as serverless function
- Deploy `dist/public/` as static assets
- Configure environment variables

#### For Traditional Hosting:
1. Upload `dist/` folder to server
2. Install Node.js dependencies: `npm install --production`
3. Run: `npm start`
4. Configure reverse proxy (nginx/Apache) if needed

---

## 🔧 Environment Variables

Create a `.env` file or set in your hosting platform:

```bash
# Database
DATABASE_URL=your_neon_postgresql_url

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Session Security
SESSION_SECRET=your_random_session_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Analytics (optional)
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id

# WhatsApp API (if using)
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# Email Service (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 📊 Recent Changes Included in Build

- ✅ Updated operating hours: **11:00 AM - 8:30 PM**
- ✅ Added message: "We're open 7 days a week for your convenience"
- ✅ Complete payment and booking flow implementation
- ✅ Razorpay integration
- ✅ Guest booking support

---

## 🧪 Testing Production Build Locally

```bash
# Stop development server
pkill -f "tsx server/index.ts"

# Start production server
npm start

# Or
NODE_ENV=production node dist/index.js
```

Visit: http://localhost:5000

---

## 📝 Notes

- The production build uses optimized/minified code
- Static assets are served from `dist/public/`
- Server runs on port 5000 (configure via PORT env var if needed)
- All API routes are available at `/api/*`
- Frontend routes are handled by the server

---

**Build Date**: $(date)
**Status**: ✅ Ready for Deployment

