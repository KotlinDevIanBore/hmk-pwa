# OTP Registration Issue - Complete Resolution Guide

## 🔍 Root Cause Identified

The "OTP authentication failed" error was caused by **invalid database credentials** in the Next.js application environment. While standalone scripts could connect to the database, the Next.js server could not.

### Error Message:
```
Authentication failed against database server at `localhost`, 
the provided database credentials for `postgres` are not valid.
```

## ✅ Solutions Applied

### 1. Fixed OTP Request Logic (app/api/auth/request-otp/route.ts)

**Problem:** System created temp users during OTP request, then rejected subsequent requests for the same phone number.

**Solution Applied:**
- Only reject users who have completed registration (have a PIN set)
- Reuse existing incomplete user records
- Automatically invalidate old OTPs when new ones are requested

### 2. Database Connection Issue (PRIMARY ISSUE)

**Problem:** `.env.local` file missing or has incorrect credentials.

**Solution:** Create/update `.env.local` file with correct database credentials.

## 🛠️ Step-by-Step Fix

### Step 1: Check Your PostgreSQL Setup

First, verify your PostgreSQL is running and note your credentials:

```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Check the status
# It should show "Running"
```

### Step 2: Test Database Connection

Find out your actual PostgreSQL credentials. Common defaults are:
- **Username:** `postgres`
- **Password:** The one you set during PostgreSQL installation
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `hmk_pwa`

Test the connection:

```powershell
# Try connecting with psql
psql -U postgres -h localhost -p 5432
```

If you forgot your password, you may need to reset it:
1. Locate `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\<version>\data\`)
2. Temporarily change authentication to `trust` for localhost
3. Restart PostgreSQL service
4. Connect and reset password:
   ```sql
   ALTER USER postgres PASSWORD 'your_new_password';
   ```
5. Change `pg_hba.conf` back to `md5` authentication
6. Restart PostgreSQL again

### Step 3: Create/Update .env.local File

In your project root (`D:\HMK  - PWA`), create or update `.env.local`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hmk_pwa"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6

# Rate Limiting
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MS=900000

# Security
BCRYPT_ROUNDS=10

# Session
SESSION_COOKIE_NAME="hmk_session"
SESSION_MAX_AGE=604800

# Environment
NODE_ENV="development"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

### Step 4: Ensure Database Exists

```powershell
cd "D:\HMK  - PWA"

# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE hmk_pwa;
\q
```

### Step 5: Run Database Migrations

```powershell
cd "D:\HMK  - PWA"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify it worked
npx prisma studio
# This should open a browser with your database UI
```

### Step 6: Test the Database Connection

```powershell
cd "D:\HMK  - PWA"
npx tsx scripts/test-db-connection.ts
```

Expected output:
```
🧪 Testing database connection...
✅ Database connected successfully!
📊 User count: 0
📊 OTP log count: 0
📊 SMS log count: 0
✅ All database operations successful!
```

### Step 7: Restart Development Server

```powershell
# Kill any existing server
# Find the process ID
netstat -ano | findstr ":3000"
# Kill it (replace <PID> with actual PID)
taskkill /F /PID <PID>

# Start fresh
cd "D:\HMK  - PWA"
npm run dev
```

### Step 8: Test Registration Flow

1. Open browser: `http://localhost:3000/en/auth/register`
2. Enter phone number: `0712345678`
3. Click "Next"
4. **Expected:** OTP sent successfully, OTP code displayed in console (development mode)
5. Enter the OTP
6. Complete registration

### Step 9: Verify Fix with Scripts

```powershell
# Test direct API call
npx tsx scripts/test-api-direct.ts

# Simulate OTP request
npx tsx scripts/simulate-otp-request.ts

# Check users in database
npx tsx scripts/check-users.ts
```

## 🧪 Verification Checklist

- [ ] PostgreSQL service is running
- [ ] `.env.local` file exists with correct credentials
- [ ] Database `hmk_pwa` exists
- [ ] Prisma migrations applied successfully
- [ ] `test-db-connection.ts` script passes
- [ ] Development server starts without errors
- [ ] Registration page loads successfully
- [ ] OTP request succeeds (no 500 error)
- [ ] OTP code visible in browser console (dev mode)
- [ ] Can complete full registration flow

## 🐛 Troubleshooting

### Issue: "Failed to send OTP" (500 Error)

**Causes:**
1. Database connection failed
2. Invalid DATABASE_URL in `.env.local`
3. PostgreSQL not running
4. Database doesn't exist

**Solution:**
```powershell
# Check PostgreSQL
Get-Service postgresql*

# Test connection
psql -U postgres -d hmk_pwa

# Verify .env.local
cat .env.local | findstr DATABASE_URL

# Test with script
npx tsx scripts/test-db-connection.ts
```

### Issue: "Phone number already registered"

**Cause:** User record exists with PIN set

**Solution:**
```powershell
# Clean up test users
npx tsx scripts/cleanup-incomplete-registrations.ts

# Or manually via Prisma Studio
npx prisma studio
# Delete test users
```

### Issue: Rate limit exceeded

**Cause:** Too many OTP requests in short time

**Solution:**
- Wait 15 minutes
- OR restart dev server (clears in-memory rate limits)
- OR modify RATE_LIMIT_MAX in `.env.local`

### Issue: OTP expired

**Cause:** OTP codes expire after 5 minutes

**Solution:**
- Request a new OTP (old one automatically invalidated with our fix)
- Adjust OTP_EXPIRY_MINUTES in `.env.local` if needed

## 📝 What Changed in the Code

### app/api/auth/request-otp/route.ts

1. **Check for complete registration:**
   ```typescript
   if (existingUser && existingUser.pinHash) {
     // Only reject if registration is complete
   }
   ```

2. **Reuse incomplete users:**
   ```typescript
   let tempUser = await prisma.user.findUnique({...});
   if (!tempUser) {
     tempUser = await prisma.user.create({...});
   }
   ```

3. **Invalidate old OTPs:**
   ```typescript
   await prisma.otpLog.updateMany({
     where: { phoneNumber, purpose, isUsed: false },
     data: { isUsed: true, usedAt: new Date() },
   });
   ```

## 🎯 Expected Behavior After Fix

### First Registration Attempt
1. Enter phone → ✅ Temp user created
2. OTP sent → ✅ Visible in console (dev mode)
3. Enter OTP → ✅ Phone verified
4. Complete form → ✅ Registration successful

### Registration Retry (Interrupted)
1. Enter phone → ✅ Reuses temp user
2. OTP sent → ✅ Old OTP invalidated
3. Enter new OTP → ✅ Works
4. Complete form → ✅ Success

### Already Registered User
1. Enter registered phone → ❌ Error: "Already registered. Please login instead."

## 📧 Need More Help?

If you're still experiencing issues:

1. **Check server logs:** Look at the terminal where `npm run dev` is running
2. **Check browser console:** Press F12 and look for errors
3. **Run debug endpoint:**
   ```powershell
   npx tsx scripts/test-debug-endpoint.ts
   ```
4. **Check database state:**
   ```powershell
   npx tsx scripts/check-users.ts
   ```

## 🚀 Once Fixed, You Can:

- ✅ Register new users successfully
- ✅ Retry registration if interrupted
- ✅ Request new OTP if expired
- ✅ Complete full registration flow
- ✅ Move forward with testing other features

---

**Summary:** The main issue was database authentication. The code fixes ensure retry capability, but the core problem is the `.env.local` configuration. Follow the steps above to resolve it completely.

