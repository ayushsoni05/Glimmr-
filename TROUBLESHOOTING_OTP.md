# Troubleshooting OTP Login Issues

## Problem: "Failed to send OTP" Error

This error occurs when the backend cannot send OTP via SMS or email. Follow these steps to diagnose and fix:

### Step 1: Check Environment Variables on Render

1. **Login to Render Dashboard**: https://dashboard.render.com/
2. **Navigate to your backend service**: `glimmr-jewellry-e-commerce-platform-5`
3. **Go to Environment tab**
4. **Verify these variables are set:**

#### Critical for Phone OTP:
```
FAST2SMS_API_KEY=MX917LlNbrVUytu36KSeTcZdOD4205WkIvqRJmYazFogPhfHxs
```

#### Critical for Email OTP:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=glimmr05@gmail.com
SMTP_PASS=zyhuhhauvafowdyr
MAIL_FROM=glimmr05@gmail.com
```

### Step 2: Check Render Logs

1. **Go to Logs tab** in your Render service
2. **Look for error messages** when OTP request fails:
   - `❌ [FAST2SMS] API key not configured` → Add FAST2SMS_API_KEY
   - `❌ [FAST2SMS] Failed to send OTP` → Check API key validity
   - `SMTP credentials not configured` → Add SMTP variables

### Step 3: Verify API Key is Valid

1. **Go to Fast2SMS Dashboard**: https://www.fast2sms.com/dashboard
2. **Check your API key** under Dev API section
3. **Verify balance** - Free accounts get ₹50 credit (~50 SMS)
4. **If key expired**, generate new one and update on Render

### Step 4: Test Backend Directly

Use a tool like Postman or curl to test the backend:

```bash
# Test OTP request with phone
curl -X POST https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/auth/request-otp-login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Test OTP request with email
curl -X POST https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/auth/request-otp-login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response:
```json
{
  "message": "OTP sent to your phone. Enter it to login."
}
```

### Step 5: Redeploy After Adding Variables

After adding/updating environment variables on Render:

1. **Go to Manual Deploy** section
2. **Click "Deploy latest commit"**
3. **Wait for deployment to complete**
4. **Check logs** to verify startup messages

### Step 6: Frontend Configuration Check

Verify frontend is using correct backend URL:

**File:** `frontend/src/api.js`
```javascript
const API_BASE_URL = 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api';
```

## Common Error Messages and Solutions

### Error: "SMS service not configured"
**Cause:** FAST2SMS_API_KEY missing in Render environment
**Solution:** Add FAST2SMS_API_KEY in Render Environment tab

### Error: "Invalid phone number"
**Cause:** Phone number format incorrect
**Solution:** Use 10-digit Indian number without +91 (e.g., 9876543210)

### Error: "Failed to send OTP. Please try again"
**Cause:** Fast2SMS API error or rate limit
**Solution:** 
- Check Fast2SMS balance
- Check rate limits (10 SMS/day for free tier)
- Verify API key is active

### Error: "CORS error" from browser
**Cause:** Backend not allowing requests from Vercel
**Solution:** Already fixed in server.js - redeploy backend

### Error: "Unable to send OTP. Please try again"
**Cause:** Network timeout or Fast2SMS API down
**Solution:** 
- Wait a few minutes and retry
- Use email OTP as alternative
- Check Fast2SMS status page

## Alternative: Use Email OTP

If phone OTP continues to fail, users can login with email OTP:

1. **Switch to email** in OTP login screen
2. **Enter email address**
3. **Receive OTP via email** (uses Gmail SMTP)

## Verify Deployment Checklist

- [ ] All environment variables added to Render
- [ ] FAST2SMS_API_KEY is correct and active
- [ ] SMTP credentials configured for email backup
- [ ] Backend redeployed after adding variables
- [ ] Logs show "✅ MongoDB Connected"
- [ ] Logs show "Server running on port 5002"
- [ ] No error messages about missing API keys
- [ ] Frontend api.js uses correct backend URL
- [ ] CORS configured to allow Vercel domain

## Still Not Working?

1. **Check Fast2SMS account balance**: https://www.fast2sms.com/dashboard/wallet
2. **Regenerate API key** and update on Render
3. **Try email OTP** as alternative
4. **Contact Fast2SMS support** if API not working
5. **Check Render logs** for detailed error messages

## Support

If issues persist:
1. Copy exact error message from browser console
2. Copy relevant lines from Render logs
3. Verify all environment variables are set
4. Check Fast2SMS dashboard for delivery status
