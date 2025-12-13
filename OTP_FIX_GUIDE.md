# OTP Registration Issue - Fixed

## Problem Summary

Users were unable to complete registration because after entering their phone number and requesting an OTP, they received an "OTP authentication failed" error.

### Root Cause

The OTP request system had a logic flaw:

1. When a user requested an OTP for registration, the system created a **temporary user record** in the database
2. If the user tried to request another OTP (e.g., after page refresh, OTP expiration, or any error), the system found the existing user record
3. The system then rejected the request with "Phone number already registered" error
4. This prevented users from completing registration

## Solution Applied

### Changes Made

#### 1. Updated OTP Request Logic (`app/api/auth/request-otp/route.ts`)

**Before:**
- Rejected ALL users with existing phone numbers during registration
- Created duplicate user records on retry

**After:**
- Only rejects users who have **completed registration** (have a PIN set)
- Reuses existing incomplete user records
- Invalidates old OTPs when requesting new ones
- Allows users to retry registration as many times as needed

**Key Changes:**

```typescript
// Now checks if registration is complete before rejecting
if (existingUser && existingUser.pinHash) {
  return NextResponse.json(
    { error: 'Phone number already registered. Please login instead.' },
    { status: 409, headers }
  );
}

// Reuses existing incomplete user records
let tempUser = await prisma.user.findUnique({
  where: { phoneNumber: formattedPhone },
});

if (!tempUser) {
  tempUser = await prisma.user.create({
    data: {
      phoneNumber: formattedPhone,
      role: 'PWD',
      phoneVerified: false,
    },
  });
}

// Invalidates old OTPs
await prisma.otpLog.updateMany({
  where: {
    phoneNumber: formattedPhone,
    purpose,
    isUsed: false,
  },
  data: {
    isUsed: true,
    usedAt: new Date(),
  },
});
```

#### 2. Registration Endpoints Already Correct

Both PWD and Caregiver registration endpoints already had the correct logic:
- They check for `existingUser.pinHash` before rejecting
- They update existing incomplete records instead of creating duplicates

### 3. Added Cleanup Scripts

Created utility scripts to help manage incomplete registrations:

- **`scripts/cleanup-incomplete-registrations.ts`**: Removes incomplete user records
- **`scripts/check-users.ts`**: Views all users and their registration status
- **`scripts/test-otp-request.ts`**: Tests OTP system for a specific phone number

## Testing the Fix

### Method 1: Using the Web Interface

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the registration page**:
   ```
   http://localhost:3000/en/auth/register
   ```

3. **Test the registration flow**:
   - Enter a valid Kenyan phone number (e.g., `0712345678`)
   - Click "Next" to request OTP
   - The system should create a temp user and send OTP
   - Check the browser console for the OTP (development mode only)
   - If you get an error, the console will show detailed error information

4. **Test retry scenario**:
   - Refresh the page (or wait for OTP to expire)
   - Enter the same phone number
   - Click "Next" again
   - This should now work without the "already registered" error
   - A new OTP will be generated

5. **Complete registration**:
   - Enter the OTP code
   - Select your role (PWD or Caregiver)
   - Fill in your details
   - Set your PIN
   - Registration should complete successfully

### Method 2: Using the Database Scripts

1. **Check current database state**:
   ```bash
   npx tsx scripts/check-users.ts
   ```

2. **Test OTP for a specific number**:
   Edit `scripts/test-otp-request.ts` to use your test phone number, then:
   ```bash
   npx tsx scripts/test-otp-request.ts
   ```

3. **Clean up incomplete registrations** (if needed):
   ```bash
   npx tsx scripts/cleanup-incomplete-registrations.ts
   ```

### Method 3: Direct API Testing

Use a tool like Postman or curl:

```bash
# Request OTP
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0712345678",
    "purpose": "registration"
  }'

# Should return:
# {
#   "success": true,
#   "message": "OTP sent successfully",
#   "expiresAt": "2024-12-13T...",
#   "otp": "123456"  // Only in development
# }

# Request OTP again (should work now!)
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0712345678",
    "purpose": "registration"
  }'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0712345678",
    "otp": "123456",
    "purpose": "registration"
  }'
```

## Expected Behavior After Fix

### Scenario 1: First-time Registration
1. User enters phone number → ✅ Temp user created, OTP sent
2. User enters OTP → ✅ Phone verified
3. User completes registration → ✅ User record updated with details and PIN

### Scenario 2: Registration Retry (Before Completing)
1. User enters phone number → ✅ Temp user created, OTP sent
2. User closes browser/refreshes page
3. User enters same phone number → ✅ Existing temp user found, new OTP sent (old OTP invalidated)
4. User enters OTP → ✅ Phone verified
5. User completes registration → ✅ Success

### Scenario 3: Already Registered User
1. User enters phone number (already registered with PIN) → ❌ Error: "Phone number already registered. Please login instead."
2. User should use login flow instead

### Scenario 4: OTP Expiration
1. User requests OTP → ✅ OTP sent (valid for 5 minutes)
2. User waits > 5 minutes
3. User requests new OTP → ✅ Old OTP invalidated, new OTP sent
4. User enters new OTP → ✅ Success

## Troubleshooting

### Issue: Still getting "already registered" error

**Solution:**
```bash
# Clean up incomplete registrations
npx tsx scripts/cleanup-incomplete-registrations.ts

# Or manually delete incomplete users from database
npx prisma studio
# Navigate to User table
# Delete users where pinHash is null
```

### Issue: Database connection error

**Solution:**
```bash
# Check database connection
npx prisma db push

# Reset database if needed (WARNING: Deletes all data)
npx prisma migrate reset
```

### Issue: OTP not showing in development

**Solution:**
Check that `NODE_ENV=development` in your `.env` file:
```env
NODE_ENV=development
```

### Issue: Rate limiting preventing OTP requests

**Solution:**
The system allows 5 OTP requests per 15 minutes. Wait 15 minutes or restart the development server to clear the rate limit cache.

## Database Schema Reference

### User Model
```prisma
model User {
  id              String   @id @default(cuid())
  phoneNumber     String   @unique
  phoneVerified   Boolean  @default(false)
  pinHash         String?  // NULL = incomplete registration
  role            UserRole
  profileComplete Boolean  @default(false)
  // ... other fields
}
```

**Registration Status Indicators:**
- `pinHash = null` → Incomplete registration (can request new OTP)
- `pinHash != null` → Complete registration (cannot register again)
- `phoneVerified = true` → OTP verified
- `profileComplete = true` → Full registration complete

## Related Files

- `app/api/auth/request-otp/route.ts` - OTP request endpoint (FIXED)
- `app/api/auth/verify-otp/route.ts` - OTP verification endpoint
- `app/api/users/register-pwd/route.ts` - PWD registration endpoint
- `app/api/users/register-caregiver/route.ts` - Caregiver registration endpoint
- `app/[locale]/auth/register/page.tsx` - Registration page component
- `lib/auth.ts` - Authentication utilities
- `prisma/schema.prisma` - Database schema

## Summary

The fix ensures that:
1. ✅ Users can retry OTP requests during registration
2. ✅ Old OTPs are automatically invalidated when new ones are requested
3. ✅ Incomplete registrations don't block future attempts
4. ✅ Completed registrations are still protected from duplicates
5. ✅ The system is more resilient to user errors and interruptions

**You should now be able to complete the registration successfully!**

