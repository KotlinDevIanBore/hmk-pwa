# How to Register a New Account - Quick Guide 🚀

## ✅ Status: WORKING!

The OTP registration feature has been fixed and is now fully operational.

## Quick Start

### Step 1: Go to Registration Page

Open your browser and navigate to:
```
http://localhost:3000/en/auth/register
```

### Step 2: Enter Phone Number

Enter a Kenyan phone number in any of these formats:
- `0712345678`
- `+254712345678`
- `254712345678`

Click **"Next"**

### Step 3: Get Your OTP

**In Development Mode**, the OTP will appear on your screen in a blue box:

```
⚠️ DEVELOPMENT MODE - Your OTP Code:
   123456
```

**Alternative ways to get OTP:**
1. Visit the **SMS Simulator**: `http://localhost:3000/en/admin/sms-simulator`
2. Open **Browser Console** (F12) → Network tab → Look for `/api/auth/request-otp` response

### Step 4: Enter OTP

Copy the 6-digit code and paste it into the OTP field.

Click **"Verify OTP"**

### Step 5: Complete Your Profile

Fill in your details:
- **Role**: Choose PWD (Person with Disability) or Caregiver
- **First Name**: Your first name
- **Last Name**: Your last name
- **Disability Type** (if PWD): Select your disability type
- **PIN**: Create a 4-6 digit PIN
- **Confirm PIN**: Re-enter your PIN

Click **"Register"**

### Step 6: Success! 🎉

You're now registered and logged in!

## SMS Simulator Dashboard

Want to see all SMS messages (including OTPs)?

Visit: `http://localhost:3000/en/admin/sms-simulator`

Features:
- 📱 View all SMS logs
- 🔍 Search by phone number
- 🎯 Filter by status and purpose
- 🔄 Auto-refreshes every 10 seconds
- 👁️ See OTP codes highlighted for easy copying

## Example Registration

Here's a complete example:

```
Phone: 0712345678
↓
OTP: 531747 (shown on screen)
↓
Role: PWD
First Name: John
Last Name: Doe
Disability Type: Mobility
PIN: 123456
↓
✅ Registration Complete!
```

## Common Issues

### "Phone number already registered"

**Solution:** This phone number is already registered. Use the login page instead:
```
http://localhost:3000/en/auth/login
```

Or use a different phone number for testing.

### "Invalid or expired OTP"

**Solutions:**
1. Check if you entered the correct 6-digit code
2. OTP expires after 5 minutes - request a new one
3. Make sure you're using the most recent OTP (old ones are invalidated)

### "Too many OTP requests"

**Solution:** Wait 15 minutes, or restart the dev server to clear rate limits.

### OTP not showing on screen

**Solutions:**
1. Make sure you're in development mode (check terminal for `NODE_ENV=development`)
2. Use the SMS Simulator: `http://localhost:3000/en/admin/sms-simulator`
3. Check browser console (F12) → Network tab

## Testing Multiple Accounts

To test with multiple phone numbers, use different ones:
- `0712345678`
- `0723456789`
- `0734567890`
- etc.

## Cleanup Test Data

To remove test accounts from the database:

```bash
npx tsx scripts/cleanup-incomplete-registrations.ts
```

## Need Help?

1. **Check if server is running:**
   - Look for "Local: http://localhost:3000" in your terminal

2. **View server logs:**
   - Check the terminal where `npm run dev` is running
   - Errors will be displayed there

3. **Test the API directly:**
   ```bash
   npx tsx scripts/test-api-endpoints.ts
   ```

4. **Check database connection:**
   ```bash
   npx tsx scripts/test-db-connection.ts
   ```

## What's Next?

After registering, you can:
- ✅ Login with your phone number and PIN
- ✅ Complete your profile
- ✅ Book appointments
- ✅ Request services
- ✅ View resources

## Pro Tips 💡

1. **Save the OTP code** - You have 5 minutes to use it
2. **Use the SMS Simulator** - It's the easiest way to find OTPs during development
3. **Remember your PIN** - You'll need it to login later
4. **Test different scenarios** - Try registering as both PWD and Caregiver

---

**Have fun testing!** 🎉

If you encounter any issues not covered here, check `OTP_FIX_COMPLETE.md` for detailed troubleshooting.

