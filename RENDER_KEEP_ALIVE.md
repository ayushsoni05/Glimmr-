# Fixing Slow OTP on Render Free Tier

## The Problem
Render's free tier **spins down your backend after 15 minutes of inactivity**. When a user tries to login:
- Backend needs to "wake up" first
- This takes 30-60 seconds
- Your OTP request times out

## ✅ Solutions Implemented

### 1. Backend Keep-Alive Service (Automatic)
I've added a self-ping mechanism that keeps the backend awake:
- Pings itself every 14 minutes
- Prevents Render from spinning down
- **No action needed** - works automatically in production

File: `backend/utils/keepAlive.js`

### 2. Extended Timeout (60 seconds)
Changed API timeout from 30s to 60s to handle cold starts.

### 3. Retry Logic
Automatically retries failed OTP requests once.

## 🚀 Better Solutions (Recommended)

### Option A: Use a Free Cron Service (5 minutes setup)
Use a free service to ping your backend every 14 minutes:

#### 1. **UptimeRobot** (Recommended - Free)
1. Go to: https://uptimerobot.com/
2. Sign up (free account)
3. Create New Monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Glimmr Backend Keep-Alive
   - **URL:** `https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/health`
   - **Monitoring Interval:** 5 minutes (on free plan)
4. Click "Create Monitor"

**Result:** Backend stays awake 24/7, OTP works instantly! ⚡

#### 2. **Cron-Job.org** (Alternative - Free)
1. Go to: https://cron-job.org/
2. Sign up (free)
3. Create new cron job:
   - **Title:** Glimmr Keep-Alive
   - **URL:** `https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api/health`
   - **Schedule:** Every 10 minutes
4. Save

### Option B: Upgrade Render (Costs $7/month)
1. Go to Render Dashboard
2. Upgrade to **Starter Plan ($7/month)**
3. Benefits:
   - ✅ No cold starts
   - ✅ Instant response
   - ✅ Better performance
   - ✅ More resources

### Option C: Use Built-in Keep-Alive (Already Done)
The backend now pings itself every 14 minutes automatically when `NODE_ENV=production` is set on Render.

**Make sure this environment variable is set on Render:**
```
NODE_ENV=production
```

## 📊 Comparison

| Solution | Cost | Speed | Setup Time |
|----------|------|-------|------------|
| **UptimeRobot** | Free | Instant | 5 min |
| **Built-in Keep-Alive** | Free | Instant | 0 min (done) |
| **Render Starter Plan** | $7/mo | Instant | 2 min |
| **Current (No fix)** | Free | 30-60s first request | - |

## ✅ Immediate Action: Set NODE_ENV

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Select your service:** `glimmr-jewellry-e-commerce-platform-5`
3. **Environment tab**
4. **Add variable:**
   - Key: `NODE_ENV`
   - Value: `production`
5. **Save** → Backend redeploys
6. **Check logs** for: `[SERVER] Starting keep-alive service for production...`

## 🎯 Best Recommended Setup

**Use BOTH for maximum reliability:**

1. ✅ Set `NODE_ENV=production` on Render (self-ping)
2. ✅ Set up UptimeRobot (external ping as backup)

**Result:** Backend stays awake 24/7, OTP works in 2-3 seconds! 🚀

## Testing After Setup

After deploying:
1. Wait 20 minutes (let backend "sleep")
2. Try OTP login
3. Should work in 2-3 seconds (not 30-60 seconds)

## Logs to Verify

Check Render logs for these messages:
```
[SERVER] Starting keep-alive service for production...
[KEEP_ALIVE] Starting keep-alive service...
[KEEP_ALIVE] Will ping https://... every 14 minutes
[KEEP_ALIVE] ✅ Ping successful (234ms) - Backend is awake
```

## If Still Slow After 24 Hours

Then upgrade to Render Starter Plan ($7/month) for guaranteed instant response.
