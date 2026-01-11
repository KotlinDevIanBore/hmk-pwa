# Backend API Guide

## 🚀 How to Run the Backend

In Next.js, the **backend API routes run automatically** when you start the development server. There's no separate backend process needed!

### Quick Start

```bash
cd /home/ian/Desktop/hmk/hmk-pwa

# Make sure your database is configured in .env.local
# Then start the server (this runs both frontend AND backend)
npm run dev
```

The server will start on **http://localhost:3000**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api/*

## 📍 Available API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Request OTP code |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/register` | Complete user registration |
| POST | `/api/auth/login` | Login with phone + PIN |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/reset-pin` | Reset PIN |

### User Management (`/api/users/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register-pwd` | Register PWD user |
| POST | `/api/users/register-caregiver` | Register caregiver |
| GET/PUT | `/api/users/profile` | Get/Update user profile |
| POST | `/api/users/change-pin` | Change user PIN |

### Appointments (`/api/appointments/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/availability` | Get available slots |
| POST | `/api/appointments/book` | Book appointment |
| POST | `/api/appointments/reschedule` | Reschedule appointment |
| GET | `/api/appointments/user` | Get user's appointments |

### Services (`/api/services/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/services/request` | Create service request |
| GET | `/api/services/request` | Get service requests |

### Devices (`/api/devices/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | Get all devices |
| GET | `/api/devices/[id]` | Get device details |

### Assessments (`/api/assessments/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assessments` | Get user assessments |
| POST | `/api/assessments` | Save assessment |

### Outreach Locations (`/api/outreach-locations/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/outreach-locations` | Get outreach locations |

### Feedback (`/api/feedback/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback` | Get feedback |

### Admin (`/api/admin/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/sms-logs` | Get SMS logs |
| POST | `/api/admin/sms-logs/mark-delivered` | Mark SMS as delivered |

### Notifications (`/api/notifications/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/register` | Register for push notifications |

## 🧪 Testing the Backend

### 1. Test if the server is running

```bash
# Check if server is responding
curl http://localhost:3000/api/devices
```

### 2. Test authentication endpoint

```bash
# Request OTP
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0712000001"}'
```

### 3. Test with authentication

```bash
# Get current user (requires session cookie)
curl http://localhost:3000/api/auth/me \
  --cookie "hmk_session=YOUR_SESSION_TOKEN"
```

### 4. Use Prisma Studio to view database

```bash
npm run prisma:studio
```

Opens at http://localhost:5555 - you can view/edit database records directly.

## 🔍 Verify Backend is Running

1. **Check server logs**: When you run `npm run dev`, you should see:
   ```
   ▲ Next.js 15.0.3
   - Local:        http://localhost:3000
   - Ready in X seconds
   ```

2. **Test a simple endpoint**:
   ```bash
   curl http://localhost:3000/api/devices
   ```
   Should return JSON with devices array.

3. **Check API route files**: All routes are in `app/api/` directory

## 📝 Development vs Production

### Development (`npm run dev`)
- Runs on http://localhost:3000
- Hot reload enabled
- Both frontend and backend run together
- API routes accessible at `/api/*`

### Production (`npm run build && npm run start`)
- Builds optimized production bundle
- Runs on port 3000 (or PORT env variable)
- Same setup - frontend and backend together

## 🛠️ Backend Architecture

- **Framework**: Next.js 15 (App Router)
- **API Routes**: `app/api/` directory
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens + session cookies
- **Validation**: Zod schemas
- **Rate Limiting**: Custom middleware

## 📚 Key Backend Files

```
app/api/
├── auth/              # Authentication endpoints
├── users/             # User management
├── appointments/      # Appointment booking
├── services/         # Service requests
├── devices/          # Device catalog
├── assessments/      # Disability assessments
├── feedback/         # User feedback
├── outreach-locations/ # Outreach locations
├── admin/            # Admin endpoints
└── notifications/    # Push notifications

lib/
├── prisma.ts         # Prisma client
├── auth.ts           # Auth utilities
├── session.ts        # Session management
└── validation.ts     # Validation schemas
```

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check `.env.local` has correct `DATABASE_URL`
- Ensure PostgreSQL is running: `systemctl status postgresql`
- Test connection: `npm run prisma:studio`

### "API route not found"
- Check file exists in `app/api/` directory
- Ensure route file exports `GET`, `POST`, etc. functions
- Restart dev server: `npm run dev`

### "Authentication failed"
- Check `JWT_SECRET` is set in `.env.local`
- Verify session cookies are being sent
- Check browser console for errors

## 🎯 Next Steps

1. **Start the server**: `npm run dev`
2. **Test endpoints**: Use curl or Postman
3. **View database**: `npm run prisma:studio`
4. **Check logs**: Watch terminal output for API calls

---

**Remember**: In Next.js, there's no separate backend server. Everything runs together when you execute `npm run dev`! 🚀
