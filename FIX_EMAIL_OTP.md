# 🚨 URGENT: Email OTP Not Working - Environment Variables Missing

## Current Status
- ❌ **Email OTP:** NOT WORKING - SMTP credentials missing on Render
- ❓ **Phone OTP:** Unknown - Fast2SMS API key may be missing

## The Issue
The backend on Render is falling back to a "console email logger" which means emails are NOT being sent. This happens when SMTP environment variables are missing.

## 🔧 IMMEDIATE FIX (Takes 5 minutes)

### Step 1: Login to Render
Go to: **https://dashboard.render.com/**

### Step 2: Find Your Backend Service
Click on: **glimmr-jewellry-e-commerce-platform-5**

### Step 3: Add SMTP Environment Variables
Click **"Environment"** tab → **"Add Environment Variable"**

**Add these 6 variables for Email OTP:**

1. **SMTP_HOST**
   ```
   smtp.gmail.com
   ```

2. **SMTP_PORT**
   ```
   587
   ```

3. **SMTP_SECURE**
   ```
   false
   ```

4. **SMTP_USER**
   ```
   glimmr05@gmail.com
   ```

5. **SMTP_PASS**
   ```
   zyhuhhauvafowdyr
   ```

6. **MAIL_FROM**
   ```
   glimmr05@gmail.com
   ```

### Step 4: Add Fast2SMS for Phone OTP

7. **FAST2SMS_API_KEY**
   ```
   MX917LlNbrVUytu36KSeTcZdOD4205WkIvqRJmYazFogPhfHxs
   ```

### Step 5: Add Other Required Variables

8. **MONGO_URI**
   ```
   mongodb+srv://Ayush:Aabus0909@cluster0.qhs1btd.mongodb.net/glimmr?retryWrites=true&w=majority&appName=Cluster0
   ```

9. **JWT_SECRET**
   ```
   replace-with-a-strong-secret
   ```

10. **JWT_EXPIRES_IN**
    ```
    7d
    ```

11. **ADMIN_EMAIL**
    ```
    glimmr05@gmail.com
    ```

12. **OTP_EXPIRY_MINUTES**
    ```
    10
    ```

13. **OTP_MAX_ATTEMPTS**
    ```
    5
    ```

14. **OTP_RESEND_INTERVAL_SECONDS**
    ```
    60
    ```

15. **OTP_LOCK_DURATION_MINUTES**
    ```
    10
    ```

16. **PORT**
    ```
    5002
    ```

17. **AUTO_FIX_EMAIL_INDEX**
    ```
    true
    ```

18. **NODE_ENV**
    ```
    production
    ```

### Step 6: Save and Redeploy

1. Click **"Save Changes"**
2. Render will automatically trigger a redeploy
3. Wait 2-3 minutes for deployment to complete

### Step 7: Verify in Logs

1. Go to **"Logs"** tab
2. Look for these SUCCESS messages:
   ```
   ✅ MongoDB Connected
   Server running on port 5002
   Admin user ensured successfully
   ```
3. Make sure you DON'T see:
   ```
   SMTP credentials not configured ❌ BAD!
   ```

### Step 8: Test Email OTP

1. Go to your site: https://glimmr-jewellry-e-commerce-platform.vercel.app
2. Click "Login" → "OTP Login"
3. Switch to **"Email"** tab
4. Enter: `test@example.com` or your email
5. Click "Send OTP"
6. Check your email inbox for OTP

### Step 9: Test Phone OTP

1. Switch to **"Phone"** tab
2. Enter: `9876543210` (or your 10-digit Indian number)
3. Click "Send OTP"
4. You should receive SMS with OTP code

## Why This Happened

### On Render:
- Environment variables are NOT automatically copied from your `.env` file
- You must manually add each variable in the Render dashboard
- Without SMTP variables, the backend uses a "dummy" email transport that doesn't actually send emails

### The Warning Message:
When SMTP variables are missing, you see this in logs:
```
SMTP credentials not configured. Falling back to console email logger.
```

This means emails are just logged to console, NOT sent to users!

## Screenshots to Help

### Where to Add Variables:
1. Render Dashboard → Your Service → Environment Tab
2. Click "Add Environment Variable" button
3. Enter Key and Value
4. Click "Save Changes"

### What Success Looks Like:
After adding variables and redeploying, logs should show:
```
✅ MongoDB Connected
Server running on port 5002
[OTP_EMAIL] ✅ Email sent successfully
```

## Troubleshooting

### Issue: Still not working after adding variables
**Solution:** 
- Make sure you clicked "Save Changes"
- Wait for automatic redeploy to finish (2-3 minutes)
- Check logs for any error messages
- Verify variables don't have extra spaces or quotes

### Issue: Gmail blocking login attempts
**Solution:**
- The app password `zyhuhhauvafowdyr` is a Gmail App Password, not regular password
- Should work without issues
- If blocked, generate new App Password at: https://myaccount.google.com/apppasswords

### Issue: Fast2SMS not sending
**Solution:**
- Check balance: https://www.fast2sms.com/dashboard/wallet
- Free tier: ₹50 credit (about 50 SMS)
- Verify API key is correct

### Issue: Variables not saving
**Solution:**
- Try adding them one at a time
- Click "Save Changes" after each one
- Refresh page to verify they're saved

## Complete Environment Variables List

Copy this to keep as reference:

```bash
# Database
MONGO_URI=mongodb+srv://Ayush:Aabus0909@cluster0.qhs1btd.mongodb.net/glimmr?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d

# Email (SMTP) - CRITICAL for Email OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=glimmr05@gmail.com
SMTP_PASS=zyhuhhauvafowdyr
MAIL_FROM=glimmr05@gmail.com

# Admin
ADMIN_EMAIL=glimmr05@gmail.com

# SMS (Fast2SMS) - CRITICAL for Phone OTP
FAST2SMS_API_KEY=MX917LlNbrVUytu36KSeTcZdOD4205WkIvqRJmYazFogPhfHxs

# OTP Settings
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_INTERVAL_SECONDS=60
OTP_LOCK_DURATION_MINUTES=10

# Server
PORT=5002
AUTO_FIX_EMAIL_INDEX=true
NODE_ENV=production
```

## Next Steps After Fix

1. ✅ Test email OTP login
2. ✅ Test phone OTP login
3. ✅ Monitor Render logs for any errors
4. ✅ Check Fast2SMS balance if using phone OTP heavily

---

**TIME TO FIX:** 5 minutes  
**ACTION:** Go to Render NOW and add ALL environment variables above!
