# EMERGENCY DEBUG - Portfolio Data Fetch Fix

## 🔴 IMMEDIATE ACTIONS TAKEN

### 1. **DEBUG MODE Enabled (middleware.ts)**
```typescript
const DEBUG_MODE = true; // Set to false to enforce auth

if (DEBUG_MODE && !isAuthenticated) {
  console.log(`[Middleware] DEBUG MODE: Allowing access without session`);
}
```
✅ Middleware will NOT redirect - allows debugging data fetching

### 2. **Enhanced Data Fetch Logging (portfolio/page.tsx)**
```typescript
console.log("[Portfolio] FETCH POSITIONS CALLED");
console.log("[Portfolio] User:", user?.email);
console.log("[Portfolio] Token from localStorage:", token ? "Found" : "NOT FOUND");
console.log("[Portfolio] Request headers:", JSON.stringify(headers));
console.log("[Portfolio] Response:", { status, statusText, ok });
console.log("[Portfolio] Raw response:", text.substring(0, 500));
```

### 3. **URL Standardization (middleware.ts)**
```typescript
// Redirect /portfolio to /en/portfolio
if (pathname === "/portfolio") {
  return NextResponse.redirect(new URL("/en/portfolio", request.url));
}
```

### 4. **LocalStorage Cleanup Button**
```typescript
const clearDataAndReload = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("portfolio-data");
  window.location.reload();
};
```
✅ New "Clear Data & Reload" button on error screen

### 5. **JSON Parse Error Detection**
```typescript
try {
  data = await response.json();
} catch (parseError) {
  const text = await response.text();
  console.error("[Portfolio] JSON parse error:", text.substring(0, 500));
  setLoadError("JSON parse error. API returned HTML instead of JSON.");
}
```

---

## 🧪 DEBUG STEPS

### Step 1: Open Browser Console
```
F12 → Console tab
```

### Step 2: Look for These Logs
```
[Middleware] Current Path: /en/portfolio
[Middleware] DEBUG MODE: Allowing access without session
[Portfolio] ==========================================
[Portfolio] FETCH POSITIONS CALLED
[Portfolio] User: user@example.com
[Portfolio] Token from localStorage: Found (eyJhbGciOiJ...)
[Portfolio] Response: { status: 200, ok: true }
[Portfolio] ✅ Positions loaded: 3
```

### Step 3: If You See This (JSON Parse Error)
```
[Portfolio] ❌ JSON parse error: <!DOCTYPE html>...
```
**Problem:** API is returning HTML error page instead of JSON
**Fix:** Check /api/portfolio endpoint

### Step 4: If You See This (401 Unauthorized)
```
[Portfolio] ❌ 401 UNAUTHORIZED
[Portfolio] Token that failed: eyJhbGci...
```
**Problem:** Token invalid or expired
**Fix:** Click "Clear Data & Reload" button

### Step 5: If You See This (Network Error)
```
[Portfolio] ❌ FETCH EXCEPTION: TypeError: Failed to fetch
```
**Problem:** Server not running or network issue
**Fix:** Check terminal, restart server

---

## 🎯 QUICK FIXES

### Fix 1: Clear Everything and Restart
```javascript
// In browser console:
localStorage.clear();
fetch('/api/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: 'your@email.com', password: 'yourpassword'})}).then(r => r.json()).then(data => { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); location.reload(); });
```

### Fix 2: Check API is Running
```bash
curl http://localhost:3000/api/portfolio -H "Authorization: Bearer YOUR_TOKEN"
```

### Fix 3: Bypass Auth Completely (Emergency)
```typescript
// In middleware.ts - temporarily remove auth check:
// Comment out this block:
// if (!isAuthenticated && !DEBUG_MODE) {
//   return NextResponse.redirect(loginUrl);
// }
```

---

## 📊 EXPECTED NETWORK TAB

### Request to /api/portfolio
```
URL: http://localhost:3000/api/portfolio
Method: GET
Status: 200 OK
Request Headers:
  Authorization: Bearer eyJhbG...
  x-user-id: user_123
```

### Response
```json
[
  { "id": "1", "symbol": "AAPL", "shares": 10, "avgPrice": 150.00 }
]
```

---

## ✅ FILES MODIFIED

| File | Emergency Changes |
|------|------------------|
| `middleware.ts` | DEBUG_MODE=true, /portfolio redirect |
| `portfolio/page.tsx` | Enhanced logging, JSON error detection, clearData button |

---

## 🚨 DISABLE DEBUG MODE

When everything works, set:
```typescript
const DEBUG_MODE = false;
```

This will re-enable authentication checks.
