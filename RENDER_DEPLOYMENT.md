# Render Deployment Guide for Glimmr Backend

## Environment Variables Required on Render

When deploying the backend to Render, you **MUST** configure these environment variables in your Render dashboard:

### 1. Database
```
MONGO_URI=mongodb+srv://Ayush:Aabus0909@cluster0.qhs1btd.mongodb.net/glimmr?retryWrites=true&w=majority&appName=Cluster0
```

### 2. JWT Configuration
```
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
```

### 3. Fast2SMS (REQUIRED for OTP login)
```
FAST2SMS_API_KEY=MX917LlNbrVUytu36KSeTcZdOD4205WkIvqRJmYazFogPhfHxs
```
**Important:** Without this key, OTP login will fail with "Failed to send OTP"

### 4. SMTP Configuration (for email OTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=glimmr05@gmail.com
SMTP_PASS=zyhuhhauvafowdyr
MAIL_FROM=glimmr05@gmail.com
ADMIN_EMAIL=glimmr05@gmail.com
```

### 5. OTP Settings
```
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_INTERVAL_SECONDS=60
OTP_LOCK_DURATION_MINUTES=10
```

### 6. Server Configuration
```
PORT=5002
AUTO_FIX_EMAIL_INDEX=true
NODE_ENV=production
```

## Steps to Deploy on Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select the repository: `ayushsoni05/Glimmr-Jewellry-E-Commerce-Platform`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. **Add Environment Variables**
   - Go to your web service → Environment
   - Click "Add Environment Variable"
   - Add ALL the variables listed above
   - **Critical:** Make sure `FAST2SMS_API_KEY` is set correctly

4. **Configure Build Settings**
   - Node Version: 18.x or higher
   - Auto-Deploy: Yes (for main branch)

5. **Deploy**
   - Click "Manual Deploy" or wait for auto-deploy
   - Monitor logs for any errors

## Verifying Deployment

After deployment, test these endpoints:

1. **Health Check**
   ```
   GET https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/health
   ```

2. **Test OTP Request**
   ```
   POST https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/auth/request-otp-login
   {
     "phone": "9876543210"
   }
   ```

## Common Issues

### "Failed to send OTP"
- **Cause:** `FAST2SMS_API_KEY` not configured on Render
- **Solution:** Add the environment variable in Render dashboard

### CORS errors from Vercel
- **Cause:** Frontend URL not whitelisted
- **Solution:** Already configured in `server.js` to allow Vercel domains

### Email OTP not working
- **Cause:** SMTP credentials not configured
- **Solution:** Add all SMTP_* environment variables

### MongoDB connection issues
- **Cause:** MongoDB URI not set or incorrect
- **Solution:** Verify `MONGO_URI` in Render environment variables

## Monitoring

Check logs in Render dashboard:
- Go to your web service → Logs
- Look for startup messages:
  - ✅ MongoDB Connected
  - ✅ Server running on port 5002
  - ✅ Admin user ensured successfully

## Backend URL
Your backend is deployed at:
```
https://glimmr-jewellry-e-commerce-platform-5.onrender.com
```

All API requests from frontend should use:
```
https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api
```

This is already configured in `frontend/src/api.js`
