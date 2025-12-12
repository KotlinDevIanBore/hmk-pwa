# Phase 3 Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env.local` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hmk_pwa"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

See `ENV_VARIABLES.md` for complete configuration.

### 3. Setup Database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access the Application
- **User Login:** http://localhost:3000/en/auth/login
- **User Register:** http://localhost:3000/en/auth/register
- **SMS Simulator:** http://localhost:3000/en/admin/sms-simulator

---

## 📁 Phase 3 File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── request-otp/route.ts      # Generate and send OTP
│   │   ├── verify-otp/route.ts       # Validate OTP
│   │   ├── login/route.ts            # Phone + PIN login
│   │   ├── register/route.ts         # Complete registration
│   │   ├── reset-pin/route.ts        # PIN reset
│   │   ├── logout/route.ts           # Destroy session
│   │   └── me/route.ts               # Get current user
│   └── admin/
│       └── sms-logs/
│           ├── route.ts              # Fetch SMS logs
│           └── mark-delivered/route.ts # Update SMS status
│
└── [locale]/
    ├── auth/
    │   ├── login/page.tsx            # Login page
    │   ├── register/page.tsx         # Registration (multi-step)
    │   └── reset-pin/page.tsx        # PIN reset (multi-step)
    └── admin/
        └── sms-simulator/page.tsx    # SMS dashboard

lib/
├── auth.ts                           # Authentication utilities
├── session.ts                        # Session management
└── rate-limit.ts                     # Rate limiting

tests/
├── unit/
│   ├── auth.test.ts                  # Auth utilities tests
│   └── rate-limit.test.ts            # Rate limiting tests
└── e2e/
    └── authentication.spec.ts        # E2E auth flow tests

messages/
├── en.json                           # English translations (enhanced)
└── sw.json                           # Swahili translations (enhanced)

Documentation/
├── ENV_VARIABLES.md                  # Environment configuration
├── PHASE_ERRORS_TRACKING.md          # Error tracking
├── PHASE3_COMPLETION_SUMMARY.md      # Complete phase summary
└── PHASE3_QUICK_REFERENCE.md         # This file
```

---

## 🔑 API Routes Reference

### Authentication Endpoints

#### POST /api/auth/request-otp
Request an OTP code for verification.

**Body:**
```json
{
  "phoneNumber": "0712345678",
  "purpose": "registration" | "login" | "pin_reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2024-12-12T10:05:00Z",
  "otp": "123456" // Only in development
}
```

**Rate Limit:** 5 requests per 15 minutes

---

#### POST /api/auth/verify-otp
Verify an OTP code.

**Body:**
```json
{
  "phoneNumber": "0712345678",
  "otp": "123456",
  "purpose": "registration" | "login" | "pin_reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "userId": "clx...abc"
}
```

**Rate Limit:** 3 requests per 5 minutes

---

#### POST /api/auth/login
Login with phone and PIN.

**Body:**
```json
{
  "phoneNumber": "0712345678",
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "clx...abc",
    "phoneNumber": "+254712345678",
    "role": "PWD",
    "firstName": "John",
    "lastName": "Doe",
    "profileComplete": false
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

#### POST /api/auth/register
Complete user registration.

**Body:**
```json
{
  "userId": "clx...abc",
  "pin": "1234",
  "confirmPin": "1234",
  "role": "PWD" | "CAREGIVER",
  "firstName": "John",
  "lastName": "Doe",
  "disabilityType": "MOBILITY" // Optional, for PWDs only
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "user": { /* user object */ }
}
```

---

#### POST /api/auth/reset-pin
Reset user PIN.

**Body:**
```json
{
  "phoneNumber": "0712345678",
  "userId": "clx...abc",
  "newPin": "5678",
  "confirmPin": "5678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN reset successfully"
}
```

**Rate Limit:** 3 requests per 15 minutes

---

#### POST /api/auth/logout
Logout and destroy session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /api/auth/me
Get current authenticated user.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "clx...abc",
    "phoneNumber": "+254712345678",
    "role": "PWD",
    "firstName": "John",
    "lastName": "Doe",
    // ... more fields
  }
}
```

---

### Admin Endpoints

#### GET /api/admin/sms-logs
Fetch SMS logs for simulator.

**Response:**
```json
{
  "success": true,
  "smsLogs": [
    {
      "id": "clx...abc",
      "phoneNumber": "+254712345678",
      "message": "Your HMK verification code is: 123456...",
      "purpose": "otp",
      "status": "sent",
      "createdAt": "2024-12-12T10:00:00Z",
      "deliveredAt": null,
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

---

#### POST /api/admin/sms-logs/mark-delivered
Mark SMS as delivered.

**Body:**
```json
{
  "id": "clx...abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS marked as delivered"
}
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```

### Test Coverage
- **Unit Tests:** 30+ tests
- **E2E Tests:** 20+ tests
- **Files Tested:** Authentication utilities, rate limiting, forms, flows

---

## 🔐 Authentication Flow Examples

### User Registration Flow

1. **Request OTP**
   ```
   POST /api/auth/request-otp
   { phoneNumber: "0712345678", purpose: "registration" }
   ```

2. **Verify OTP**
   ```
   POST /api/auth/verify-otp
   { phoneNumber: "0712345678", otp: "123456", purpose: "registration" }
   → Returns userId
   ```

3. **Complete Registration**
   ```
   POST /api/auth/register
   {
     userId: "clx...abc",
     pin: "1234",
     confirmPin: "1234",
     role: "PWD",
     firstName: "John",
     lastName: "Doe",
     disabilityType: "MOBILITY"
   }
   → Creates session automatically
   ```

---

### User Login Flow

1. **Login**
   ```
   POST /api/auth/login
   { phoneNumber: "0712345678", pin: "1234" }
   → Creates session automatically
   ```

2. **Access Protected Resources**
   ```
   GET /api/auth/me
   → Returns user data if authenticated
   ```

---

### PIN Reset Flow

1. **Request OTP**
   ```
   POST /api/auth/request-otp
   { phoneNumber: "0712345678", purpose: "pin_reset" }
   ```

2. **Verify OTP**
   ```
   POST /api/auth/verify-otp
   { phoneNumber: "0712345678", otp: "123456", purpose: "pin_reset" }
   → Returns userId
   ```

3. **Reset PIN**
   ```
   POST /api/auth/reset-pin
   {
     phoneNumber: "0712345678",
     userId: "clx...abc",
     newPin: "5678",
     confirmPin: "5678"
   }
   ```

---

## 🛠️ Utility Functions

### Phone Number Utilities

```typescript
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/auth';

// Validate phone number
validatePhoneNumber('0712345678'); // true
validatePhoneNumber('123'); // false

// Format to standard +254 format
formatPhoneNumber('0712345678'); // '+254712345678'
formatPhoneNumber('+254712345678'); // '+254712345678'
```

### PIN Utilities

```typescript
import { validatePin, hashPin, verifyPin } from '@/lib/auth';

// Validate PIN format
validatePin('1234'); // true
validatePin('123'); // false (too short)

// Hash PIN
const hash = await hashPin('1234');

// Verify PIN
const isValid = await verifyPin('1234', hash); // true
```

### OTP Utilities

```typescript
import { generateOTP, getOTPExpiryDate } from '@/lib/auth';

// Generate 6-digit OTP
const otp = generateOTP(); // '123456'

// Get expiry date (5 minutes from now)
const expiryDate = getOTPExpiryDate();
```

### Session Management

```typescript
import { createSession, getSession, destroySession } from '@/lib/session';

// Create session (in API route)
await createSession(userId, phoneNumber, role);

// Get current session
const session = await getSession();
if (session) {
  console.log(session.userId, session.phoneNumber, session.role);
}

// Destroy session
await destroySession();
```

### Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/rate-limit';

// Check rate limit
const result = checkRateLimit('user-identifier', {
  max: 5,
  windowMs: 15 * 60 * 1000
});

if (!result.success) {
  // Rate limit exceeded
  return Response.json({ error: 'Too many requests' }, { status: 429 });
}
```

---

## 🌍 Translation Keys

### Authentication Keys
```typescript
// English: messages/en.json
// Swahili: messages/sw.json

t('auth.login')              // "Login" / "Ingia"
t('auth.register')           // "Register" / "Jisajili"
t('auth.phoneNumber')        // "Phone Number" / "Nambari ya Simu"
t('auth.pin')                // "PIN" / "PIN"
t('auth.otp')                // "OTP Code" / "Msimbo wa OTP"
t('auth.verifyOtp')          // "Verify OTP" / "Thibitisha OTP"
t('auth.createPin')          // "Create PIN" / "Unda PIN"
t('auth.confirmPin')         // "Confirm PIN" / "Thibitisha PIN"
t('auth.forgotPin')          // "Forgot PIN?" / "Umesahau PIN?"
t('auth.resetPin')           // "Reset PIN" / "Weka PIN Mpya"
t('auth.loginSuccess')       // "Login successful" / "Umeingia kikamilifu"
t('auth.registrationSuccess') // "Registration successful" / "Usajili umefanikiwa"
```

---

## 💡 Development Tips

### Testing OTP Flow
1. In development mode, OTP is returned in the response
2. Use SMS Simulator dashboard to view all OTPs
3. Default OTP expiry: 5 minutes
4. Default OTP length: 6 digits

### Testing Rate Limiting
- Limits reset after window expires
- Use different phone numbers to test independently
- Rate limits are in-memory (reset on server restart)

### Session Management
- Sessions stored in HTTP-only cookies
- Default expiry: 7 days
- Automatic session creation on login/register
- Manual logout destroys session

### Error Handling
- All API routes return consistent error format
- Client-side validation before API calls
- Toast notifications for user feedback
- ARIA live regions for screen reader announcements

---

## 📝 Common Tasks

### Add New Authentication Endpoint
1. Create route file in `app/api/auth/[endpoint]/route.ts`
2. Add rate limiting
3. Add input validation with Zod
4. Implement logic
5. Add tests in `tests/unit/` or `tests/e2e/`

### Add New Translation
1. Add key to `messages/en.json`
2. Add corresponding key to `messages/sw.json`
3. Use in component with `t('key')`

### Customize Rate Limits
Edit individual API route:
```typescript
const rateLimitResult = checkRateLimit(identifier, {
  max: 10,           // Custom max requests
  windowMs: 60000   // Custom window (1 minute)
});
```

Or edit defaults in environment:
```env
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env.local`
- Run `npm run prisma:generate`

### "JWT secret not configured"
- Add JWT_SECRET to `.env.local`
- Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### "Rate limit exceeded"
- Wait for the reset time
- Or adjust rate limits in environment variables
- Or restart server (in-memory limits reset)

### "OTP expired"
- Request new OTP
- Check OTP_EXPIRY_MINUTES environment variable
- Default is 5 minutes

### "Phone number already registered"
- Use different phone number
- Or test login flow instead
- Check database for existing users

---

## 📚 Documentation

- **Complete Summary:** `PHASE3_COMPLETION_SUMMARY.md`
- **Environment Setup:** `ENV_VARIABLES.md`
- **Error Tracking:** `PHASE_ERRORS_TRACKING.md`
- **Quick Reference:** This file
- **Project Plan:** `HMK_PWA_Development_Plan.md`

---

**Last Updated:** December 12, 2024  
**Phase:** 3 - User Authentication System  
**Status:** Complete ✅

