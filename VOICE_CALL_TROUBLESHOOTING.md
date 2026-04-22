# Voice Call Connection Issues - Troubleshooting Guide

## 🔴 Critical Issues Found

### Issue 1: Incorrect VAPI Configuration
Your `.env` file has conflicting/incorrect VAPI settings:

```
NEXT_PUBLIC_VAPI_API_KEY="c18209c1-5067-4eaf-9377-2365ccacc90f"  ❌ Wrong format
NEXT_PUBLIC_VAPI_TOKEN="3a883949-46e6-4eda-afd2-8161efdd373a"    ❌ Wrong format
NEXT_PUBLIC_VAPI_ASSISTANT_ID="c18209c1-5067-4eaf-9377-2365ccacc90f"  ❌ Duplicate of API key
```

**What should happen:**
- `NEXT_PUBLIC_VAPI_API_KEY` should start with **`pub_`** (public browser key) - NOT a UUID
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID` should be your actual assistant ID from VAPI dashboard (different value)
- Only one token is needed - they're mixing different credential types

### Issue 2: Function Tool URLs Not Configured
In `VAPI_CONFIGURATION.md`, the function tools reference:
```
"url": "https://YOUR_DOMAIN.com/api/vapi/get-available-doctors"
```

This placeholder hasn't been replaced with your actual deployment domain. VAPI can't call your backend without the correct URLs.

### Issue 3: Environment Variable Priority
In `src/components/Voice Agent/VapiWidget.tsx` (line ~43):
```typescript
const token = process.env.NEXT_PUBLIC_VAPI_TOKEN || process.env.NEXT_PUBLIC_VAPI_API_KEY;
```
It tries `VAPI_TOKEN` first (which is incorrect UUID format), causing initialization to fail silently.

---

## ✅ How to Fix

### Step 1: Get Correct Credentials from VAPI Dashboard
1. Login to [https://vapi.ai](https://vapi.ai)
2. Go to **Settings** → **API Keys**
3. Copy your **Public Key** (starts with `pub_`)
4. Go to **Assistants**
5. Click your assistant and copy the **Assistant ID**

### Step 2: Update `.env`
Replace these lines in your `.env`:

```env
# Replace with your ACTUAL credentials from VAPI dashboard
NEXT_PUBLIC_VAPI_API_KEY="pub_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Public key from VAPI Settings
NEXT_PUBLIC_VAPI_ASSISTANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Real assistant ID
```

**Delete this line if it exists:**
```env
NEXT_PUBLIC_VAPI_TOKEN="3a883949-46e6-4eda-afd2-8161efdd373a"  # Remove this - it's wrong
```

### Step 3: Configure VAPI Assistant Function Tools
1. In VAPI Dashboard, open your assistant
2. Go to **Functions** tab
3. For each function tool (get_available_doctors, get_available_slots, book_appointment):
   - **Update the URL to your actual domain:**
     ```
     https://your-domain.com/api/vapi/get-available-doctors
     https://your-domain.com/api/vapi/get-available-slots
     https://your-domain.com/api/vapi/book-appointment
     ```
   - Examples:
     - If deployed: Use your production URL
     - If local testing: Use ngrok or tunnel URL (e.g., `https://abc123.ngrok.io`)

### Step 4: Fix VapiWidget Component
Update `src/components/Voice Agent/VapiWidget.tsx` line 43:

**Change from:**
```typescript
const token = process.env.NEXT_PUBLIC_VAPI_TOKEN || process.env.NEXT_PUBLIC_VAPI_API_KEY;
```

**Change to:**
```typescript
const token = process.env.NEXT_PUBLIC_VAPI_API_KEY;
```

### Step 5: Deploy/Restart
- If using local development: Restart your Next.js dev server (`npm run dev`)
- If deployed: Rebuild and redeploy with new environment variables

---

## 🧪 Testing Checklist

After making changes:

- [ ] Check browser console for errors (F12 → Console tab)
- [ ] Verify these logs appear without `null` values:
  ```
  [Vapi] Initializing with key: pub_...
  ```
- [ ] Click "Start JARVIS" button
- [ ] Should see "Listening & Ready" status
- [ ] Try asking: "Hello, I need to book a doctor appointment"
- [ ] Monitor Network tab (F12 → Network) for API calls to `/api/vapi/*`
  - Should see 200 responses, not 4xx/5xx errors

---

## 🐛 Common Error Messages & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| "Vapi token is missing" | API key not set or empty | Check `.env` has `NEXT_PUBLIC_VAPI_API_KEY` with value |
| "The API key does not start with 'pub_'" | Using wrong credential type | Get Public Key from VAPI Settings (not Server Key) |
| "Connection failed" | Can't reach VAPI servers or wrong assistant ID | Verify VAPI credentials are correct |
| "404 on API call" | Function tool URL is wrong or unreachable | Update URLs in VAPI dashboard with correct domain |
| Takes long time then hangs | Backend API endpoints not configured | Set function tool URLs in VAPI assistant settings |

---

## 🚀 Local Testing with Tunneling

If testing locally, use ngrok to expose your dev server:

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Create tunnel
ngrok http 3000
# Get URL like: https://abc123.ngrok.io
```

Then update VAPI function URLs to:
```
https://abc123.ngrok.io/api/vapi/get-available-doctors
https://abc123.ngrok.io/api/vapi/get-available-slots
https://abc123.ngrok.io/api/vapi/book-appointment
```

---

## 📋 Verification

After all fixes, test by:
1. Opening /voice page
2. Clicking "Start JARVIS"
3. Saying "Show me available cardiologists"
4. VAPI should immediately call your backend and respond with doctor list
5. No more hanging/timeouts

If still experiencing issues, check:
- Browser console for errors (F12)
- Server logs for API errors
- VAPI dashboard logs for function call failures
