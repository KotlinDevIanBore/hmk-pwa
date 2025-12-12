# Phase 4: User Registration - Quick Reference Guide

## Quick Start

### Registration Forms
```tsx
// PWD Registration
import { PWDRegistrationForm } from '@/components/forms/PWDRegistrationForm';

<PWDRegistrationForm 
  phoneNumber="+254712345678"
  onSuccess={() => router.push('/dashboard')}
/>

// Caregiver Registration
import { CaregiverRegistrationForm } from '@/components/forms/CaregiverRegistrationForm';

<CaregiverRegistrationForm 
  phoneNumber="+254713456789"
  onSuccess={() => router.push('/dashboard')}
/>
```

### Validation Utilities
```typescript
import {
  validatePhoneNumber,
  normalizePhoneNumber,
  validateIdNumber,
  validateAge,
  pwdRegistrationSchema,
} from '@/lib/validation';

// Phone validation
if (validatePhoneNumber('0712345678')) {
  const normalized = normalizePhoneNumber('0712345678'); // "+254712345678"
}

// ID validation
if (validateIdNumber('NATIONAL_ID', '12345678')) {
  // Valid national ID
}

// Zod schema validation
const result = pwdRegistrationSchema.safeParse(data);
if (result.success) {
  // Data is valid
}
```

## API Endpoints

### Register PWD
```bash
POST /api/users/register-pwd
Content-Type: application/json

{
  "phoneNumber": "0712345678",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "MALE",
  "county": "Nairobi",
  "idType": "NATIONAL_ID",
  "idNumber": "12345678",
  "disabilityType": "MOBILITY",
  "pin": "123456",
  "confirmPin": "123456"
}
```

### Register Caregiver
```bash
POST /api/users/register-caregiver
Content-Type: application/json

{
  "phoneNumber": "0713456789",
  "firstName": "Jane",
  "lastName": "Smith",
  "gender": "FEMALE",
  "county": "Nairobi",
  "idType": "NATIONAL_ID",
  "idNumber": "87654321",
  "pin": "123456",
  "confirmPin": "123456",
  "registeringForBeneficiary": true,
  "beneficiary": {
    "firstName": "Mike",
    "lastName": "Smith",
    "gender": "MALE",
    "relationship": "CHILD",
    "disabilityType": "VISUAL"
  }
}
```

### Get Profile
```bash
GET /api/users/profile
Authorization: (session cookie)
```

### Update Profile
```bash
PUT /api/users/profile
Content-Type: application/json

{
  "firstName": "John",
  "email": "newemail@example.com",
  "county": "Mombasa"
}
```

### Change PIN
```bash
POST /api/users/change-pin
Content-Type: application/json

{
  "currentPin": "123456",
  "newPin": "654321",
  "confirmNewPin": "654321"
}
```

## Validation Rules

### Phone Numbers
- Format: `0712345678`, `+254712345678`, or `254712345678`
- Valid prefixes: `07XX`, `01XX`
- Normalized to: `+254XXXXXXXXX`

### ID Numbers
| Type | Format | Example |
|------|--------|---------|
| National ID | 8 digits | `12345678` |
| Passport | 1-2 letters + 6-7 digits | `A1234567` |
| Birth Certificate | 7-10 alphanumeric | `ABC1234567` |
| NCPWD Card | 8-12 alphanumeric | `NCPWD123456` |

### Other Fields
- **PIN**: 4-6 digits only
- **Age**: 0-120 years
- **Name**: 2-50 characters, letters/spaces/hyphens/apostrophes
- **Email**: Valid format (optional)

## Database Schema

### User Model Fields
```prisma
model User {
  // Registration fields
  phoneNumber       String    @unique
  email             String?
  role              UserRole
  firstName         String?
  lastName          String?
  age               Int?
  dateOfBirth       DateTime?
  gender            Gender?
  county            String?
  subCounty         String?
  ward              String?
  village           String?
  idType            IdType?
  idNumber          String?
  disabilityType    DisabilityType?
  pinHash           String?
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum IdType {
  NATIONAL_ID
  PASSPORT
  BIRTH_CERTIFICATE
  NCPWD
}

enum Relationship {
  PARENT
  CHILD
  SPOUSE
  SIBLING
  GUARDIAN
  OTHER
}
```

## Profile Pages

### View Profile
```
/profile
```
Displays all user information, beneficiaries, and caregivers.

### Edit Profile
```
/profile/edit
```
Form to update user information.

### Change PIN
```
/profile/change-pin
```
Form to change user's PIN.

## Testing

### Run All Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Specific test file
npm run test -- validation.test.ts
npm run test:e2e -- registration.spec.ts
```

### Test Coverage
```bash
npm run test -- --coverage
```

## Common Tasks

### Add New Validation Rule
1. Add function to `lib/validation.ts`
2. Add to appropriate Zod schema
3. Write unit test in `tests/unit/validation.test.ts`
4. Update `getIdValidationMessage()` if needed

### Add New ID Type
1. Update `IdType` enum in `prisma/schema.prisma`
2. Add validation function in `lib/validation.ts`
3. Update `validateIdNumber()` switch statement
4. Add validation message to `getIdValidationMessage()`
5. Update form select options
6. Run migration: `npx prisma migrate dev`

### Add Translation
1. Add key to `messages/en.json`
2. Add corresponding key to `messages/sw.json`
3. Use in component: `const t = useTranslations(); t('key')`

### Customize Registration Flow
1. Modify form components in `components/forms/`
2. Update validation schema in `lib/validation.ts`
3. Update API route in `app/api/users/register-*/route.ts`
4. Update E2E tests in `tests/e2e/registration.spec.ts`

## Troubleshooting

### "Phone number already registered"
- User exists with same phone number
- Check `User.phoneNumber` in database
- Use different phone number or implement account recovery

### "Invalid ID number format"
- ID doesn't match format for selected type
- Check `validateIdNumber()` function
- See validation rules table above

### "PINs do not match"
- PIN and confirmPin fields differ
- Ensure both fields have same value

### Migration Error
- Ensure DATABASE_URL is set in `.env`
- Run `npx prisma generate` first
- Then run `npx prisma migrate dev`

### Validation Not Working
- Check Zod schema in `lib/validation.ts`
- Verify API route uses `.safeParse()`
- Check error handling in API route

## Security Checklist

- [x] PIN hashing with bcrypt
- [x] Session management
- [x] Duplicate prevention
- [x] Server-side validation
- [x] SQL injection prevention (Prisma)
- [x] CSRF protection (Next.js)
- [x] Rate limiting support
- [x] Secure password fields (type="password")
- [x] HTTPS enforcement (production)

## Accessibility Checklist

- [x] ARIA labels on all inputs
- [x] Error messages with role="alert"
- [x] Keyboard navigation
- [x] Focus indicators
- [x] Screen reader support
- [x] High contrast support
- [x] Mobile friendly (touch targets)
- [x] Form validation feedback

## Files Reference

```
Phase 4 Files:
├── lib/validation.ts                         # Validation utilities
├── app/api/users/
│   ├── register-pwd/route.ts                # PWD registration API
│   ├── register-caregiver/route.ts          # Caregiver registration API
│   ├── profile/route.ts                     # Profile management API
│   └── change-pin/route.ts                  # Change PIN API
├── components/forms/
│   ├── PWDRegistrationForm.tsx              # PWD form component
│   └── CaregiverRegistrationForm.tsx        # Caregiver form component
├── app/[locale]/profile/
│   ├── page.tsx                             # Profile view
│   ├── edit/page.tsx                        # Profile edit
│   └── change-pin/page.tsx                  # Change PIN
├── tests/
│   ├── unit/validation.test.ts              # Unit tests
│   └── e2e/registration.spec.ts             # E2E tests
├── messages/
│   ├── en.json                              # English translations
│   └── sw.json                              # Swahili translations
└── prisma/schema.prisma                      # Database schema
```

## Environment Variables

```env
# Required for database operations
DATABASE_URL="postgresql://user:password@localhost:5432/hmk_pwa"

# Optional
NODE_ENV="development"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio

# Testing
npm run test                   # Run unit tests
npm run test:e2e              # Run E2E tests
npm run test:ui               # Open Vitest UI

# Linting
npm run lint                   # Run ESLint
```

## Support

For issues or questions:
1. Check `PHASE4_COMPLETION_SUMMARY.md` for detailed documentation
2. Review test files for usage examples
3. Check validation error messages
4. Verify database schema is up to date

---

**Quick Reference v1.0** | Phase 4 | December 2025

