# OTP Development Guide for HMK PWA

## Overview
The HMK PWA uses a simulated SMS system for OTP (One-Time Password) verification during development. Real SMS sending will be implemented in production.

## How OTP Works in Development

### 1. OTP Display Methods

When you request an OTP during registration or PIN reset, you have **3 ways** to view it:

#### Method 1: On-Screen Display (Recommended)
- After entering your phone number and clicking "Next"
- The OTP will be displayed directly on the page in a blue box
- Example: "⚠️ DEVELOPMENT MODE - Your OTP Code: 123456"

#### Method 2: SMS Simulator Dashboard
- Navigate to: `http://localhost:3000/en/admin/sms-simulator`
- View all sent SMS messages and their OTP codes
- Auto-refreshes every 10 seconds
- Filter by phone number, status, or purpose

#### Method 3: API Response (for debugging)
- Open browser Developer Tools (F12)
- Go to Network tab
- Look for the `/api/auth/request-otp` request
- The response will include an `otp` field in development mode

### 2. Registration Flow

1. **Enter Phone Number**
   - Go to `/en/auth/register`
   - Enter a valid Kenyan phone number (e.g., `0712345678`)
   - Click "Next"

2. **View OTP**
   - OTP appears in a blue box on the page
   - Or check the SMS Simulator dashboard

3. **Enter OTP**
   - Copy the 6-digit code
   - Enter it in the OTP field
   - Click "Verify OTP"

4. **Complete Registration**
   - Fill in your details (name, role, etc.)
   - Set your PIN
   - Click "Register"

### 3. Login Flow

For existing users:
1. Go to `/en/auth/login`
2. Enter phone number and PIN
3. Click "Login"

No OTP needed for login if you already have an account!

### 4. Reset PIN Flow

1. Go to `/en/auth/reset-pin` or click "Forgot PIN?" on login page
2. Enter your phone number
3. View OTP (same 3 methods as registration)
4. Enter OTP to verify
5. Set new PIN

## Troubleshooting

### "Failed to send OTP" Error

**Possible Causes:**
1. Database connection issue
2. Phone number format invalid
3. Rate limiting (too many requests)

**Solutions:**

#### Check Database Connection
```bash
cd "D:\HMK  - PWA"
npx prisma studio
```
If Prisma Studio opens, your database is connected.

#### Verify Environment Variables
Create a `.env.local` file with:
```
DATABASE_URL="your_neon_database_url"
NODE_ENV="development"
```

#### Check Server Logs
Look at the terminal where `npm run dev` is running for error messages.

#### Use SMS Simulator
Even if the OTP request fails, check the SMS Simulator dashboard:
- http://localhost:3000/en/admin/sms-simulator
- If the SMS was logged to the database, it will appear here

### Phone Number Format

Valid formats for Kenyan numbers:
- `0712345678` (local format)
- `+254712345678` (international format)
- `254712345678` (without +)

Must start with 07 or 01 for mobile numbers.

### Rate Limiting

If you see "Too many OTP requests":
- Wait 5-10 minutes before trying again
- Or use a different phone number for testing

## Testing with Multiple Accounts

### Test Phone Numbers
You can use any valid Kenyan phone format:
- `0712345678` - PWD account
- `0723456789` - Caregiver account
- `0734567890` - Another test account

### Clearing Test Data
```bash
# Reset database (WARNING: Deletes all data!)
cd "D:\HMK  - PWA"
npx prisma migrate reset
```

## Quick Access Links

### Development URLs
- Landing Page: http://localhost:3000
- Login: http://localhost:3000/en/auth/login
- Register: http://localhost:3000/en/auth/register
- Reset PIN: http://localhost:3000/en/auth/reset-pin
- SMS Simulator: http://localhost:3000/en/admin/sms-simulator

### Useful Commands
```bash
# Start development server
npm run dev

# View database
npx prisma studio

# Check database status
npx prisma db push

# View logs
# (Check the terminal where npm run dev is running)
```

## Production Note

In production, this system will be replaced with:
- Real SMS gateway integration (e.g., Africa's Talking, Twilio)
- Proper OTP delivery via SMS
- No on-screen OTP display
- SMS logs for audit purposes only

## Need Help?

If you're still having issues:
1. Check the terminal running `npm run dev` for errors
2. Open browser DevTools (F12) > Console tab
3. Check Network tab for failed API requests
4. Verify database connection with `npx prisma studio`
5. Try the SMS Simulator dashboard directly

## Common Error Messages

### "Phone number already registered"
- This phone number already has an account
- Use the login page instead, or try a different phone number

### "User not found with this phone number"
- When resetting PIN, this means no account exists with that number
- Register a new account instead

### "Invalid phone number format"
- Check that your number starts with 07 or 01
- Use 10 digits (without country code) or full international format

### "OTP expired"
- OTPs are valid for 5 minutes
- Request a new OTP

### "Invalid OTP"
- Double-check the code from the SMS Simulator
- Make sure you're using the most recent OTP
- OTP might have expired (5 minutes)

## Summary

🎯 **Quick Start:**
1. Go to http://localhost:3000/en/auth/register
2. Enter phone: `0712345678`
3. Click "Next"
4. **OTP will appear on screen in blue box**
5. Enter the OTP
6. Complete registration

📱 **Alternative:** Check http://localhost:3000/en/admin/sms-simulator anytime to see all OTPs

✅ **You're all set!** The OTP system works—it just doesn't send real SMS in development mode.

