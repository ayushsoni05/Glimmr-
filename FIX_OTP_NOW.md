# 🚨 IMMEDIATE ACTION REQUIRED: Fix OTP Login

## The Problem
"Failed to send OTP" error when users try to login via OTP on your deployed site.

## Root Cause
The `FAST2SMS_API_KEY` environment variable is **NOT configured** on your Render backend deployment.

## ✅ Solution (5-minute fix)

### Step 1: Login to Render
1. Go to: https://dashboard.render.com/
2. Find your backend service: `glimmr-jewellry-e-commerce-platform-5`
3. Click on it to open

### Step 2: Add Environment Variables (CRITICAL)
1. Click on **"Environment"** tab in the left sidebar
2. Click **"Add Environment Variable"** button
3. Add these variables ONE BY ONE:

#### For Phone OTP (SMS):
- **Key:** `FAST2SMS_API_KEY`
- **Value:** `MX917LlNbrVUytu36KSeTcZdOD4205WkIvqRJmYazFogPhfHxs`

#### For Email OTP (REQUIRED - Currently Missing):
- **Key:** `SMTP_HOST`
- **Value:** `smtp.gmail.com`

- **Key:** `SMTP_PORT`
- **Value:** `587`

- **Key:** `SMTP_SECURE`
- **Value:** `false`

- **Key:** `SMTP_USER`
- **Value:** `glimmr05@gmail.com`

- **Key:** `SMTP_PASS`
- **Value:** `zyhuhhauvafowdyr`

- **Key:** `MAIL_FROM`
- **Value:** `glimmr05@gmail.com`

4. Click **"Save Changes"** after adding each one

### Step 3: Add Other Required Variables
While you're there, make sure these are also configured:

```
MONGO_URI=mongodb+srv://Ayush:Aabus0909@cluster0.qhs1btd.mongodb.net/glimmr?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=glimmr05@gmail.com
SMTP_PASS=zyhuhhauvafowdyr
MAIL_FROM=glimmr05@gmail.com
ADMIN_EMAIL=glimmr05@gmail.com
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_INTERVAL_SECONDS=60
OTP_LOCK_DURATION_MINUTES=10
PORT=5002
AUTO_FIX_EMAIL_INDEX=true
NODE_ENV=production
```

### Step 4: Redeploy
1. After adding variables, Render will automatically redeploy
2. **OR** Go to "Manual Deploy" → Click "Deploy latest commit"
3. Wait 2-3 minutes for deployment to complete

### Step 5: Verify It Works
1. Go to your deployed frontend: https://glimmr-jewellry-e-commerce-platform.vercel.app
2. Click "Login" → "OTP Login"
3. Enter a phone number (e.g., 9876543210)
4. Click "Send OTP"
5. You should receive OTP via SMS

## What I Fixed in Code

### 1. Backend CORS Configuration ([server.js](backend/server.js))
Updated to allow requests from Vercel:
```javascript
const corsOptions = {
  origin: [
    'https://glimmr-jewellry-e-commerce-platform.vercel.app',
    /\.vercel\.app$/,  // All Vercel preview deployments
  ],
  credentials: true
};
```

### 2. Frontend API URL ([frontend/src/api.js](frontend/src/api.js))
Now hardcoded to use your Render backend:
```javascript
const API_BASE_URL = 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api';
```

### 3. Better Error Messages ([backend/utils/fast2sms.js](backend/utils/fast2sms.js))
Added helpful error messages when API key is missing.

### 4. Documentation
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Complete deployment guide
- [TROUBLESHOOTING_OTP.md](TROUBLESHOOTING_OTP.md) - Detailed troubleshooting steps

## All Changes Pushed to GitHub ✅

Your repository is updated with all fixes. After you add the environment variables on Render and redeploy, OTP login will work immediately.

## Quick Test Commands

Test backend directly with curl:
```bash
# Test health
curl https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/health

# Test OTP request
curl -X POST https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/auth/request-otp-login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

## Important Notes

1. **Fast2SMS Free Tier**: You have ₹50 credit (~50 SMS). Monitor usage at https://www.fast2sms.com/dashboard
2. **Rate Limits**: Free tier = 10 SMS/day. Upgrade if needed for production.
3. **Email OTP Alternative**: Users can also use email OTP if SMS fails.
4. **Security**: Never commit `.env` files with real credentials to public repos (already in `.gitignore`).

## Need Help?

Check these files:
1. [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Full deployment guide
2. [TROUBLESHOOTING_OTP.md](TROUBLESHOOTING_OTP.md) - Troubleshooting steps
3. Render logs at: https://dashboard.render.com/web/your-service-id/logs

---

**Next Step:** Go to Render dashboard NOW and add `FAST2SMS_API_KEY` environment variable!
