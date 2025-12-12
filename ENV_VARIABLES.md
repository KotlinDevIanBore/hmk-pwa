# Environment Variables Configuration

This file documents all required environment variables for the HMK PWA application.

## Required Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/hmk_pwa"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
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

## Variable Descriptions

### Database
- `DATABASE_URL`: PostgreSQL connection string

### JWT (JSON Web Tokens)
- `JWT_SECRET`: Secret key for signing tokens (use a strong random string)
- `JWT_EXPIRES_IN`: Token expiration time (e.g., '7d', '24h')

### OTP (One-Time Password)
- `OTP_EXPIRY_MINUTES`: How long OTP codes remain valid (default: 5)
- `OTP_LENGTH`: Number of digits in OTP code (default: 6)

### Rate Limiting
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 5)
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: 900000 = 15 min)

### Security
- `BCRYPT_ROUNDS`: Salt rounds for password hashing (default: 10)

### Session Management
- `SESSION_COOKIE_NAME`: Name of the session cookie
- `SESSION_MAX_AGE`: Session duration in seconds (default: 604800 = 7 days)

### Application
- `NODE_ENV`: Environment mode (development/production)
- `NEXT_PUBLIC_APP_URL`: Base URL of the application

## Production Security Notes

1. **JWT_SECRET**: Generate a strong random string (at least 32 characters)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Database**: Use secure credentials and connection pooling
3. **BCRYPT_ROUNDS**: Consider increasing to 12 for production
4. **Rate Limiting**: Adjust based on expected traffic patterns

## Optional Variables (Future Enhancement)

```env
# SMS Integration
SMS_PROVIDER="africastalking"
SMS_API_KEY="your-api-key"
SMS_SENDER_ID="HMK"

# Monitoring
SENTRY_DSN="your-sentry-dsn"

# Analytics
ANALYTICS_ID="your-analytics-id"
```

