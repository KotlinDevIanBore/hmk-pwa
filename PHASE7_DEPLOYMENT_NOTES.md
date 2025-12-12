# Phase 7 Deployment Notes

## ✅ Pre-Deployment Checklist

### Database Migration Required

Before deploying Phase 7, you **MUST** run the database migration:

```bash
# Development
npx prisma migrate dev --name add_appointment_booking_features

# Production
npx prisma migrate deploy
```

This migration will:
- Add `AppointmentLocationType` enum
- Add new fields to `Appointment` table
- Create `AppointmentConfig` table
- Add foreign key relationships
- Add indexes for performance

### Prisma Client Regeneration

After migration, regenerate Prisma Client:

```bash
npx prisma generate
```

### Seed Data Update

The seed script has been updated. If you need to re-seed:

```bash
npm run prisma:seed
```

**Note:** The seed script now creates appointments with the new schema structure.

---

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Connect to your database and run:
npx prisma migrate deploy
```

### 2. Verify Schema
```bash
# Check that all tables exist:
npx prisma studio
```

### 3. Test Appointment Booking
1. Navigate to `/dashboard/appointments/book`
2. Test Resource Center booking (Tuesday/Thursday)
3. Test Outreach booking (weekdays)
4. Verify SMS confirmations are sent
5. Check SMS simulator dashboard

### 4. Verify API Routes
Test all API endpoints:
- `GET /api/appointments/availability`
- `POST /api/appointments/book`
- `PUT /api/appointments/reschedule`
- `GET /api/outreach-locations`

---

## ⚠️ Breaking Changes

### Database Schema
- `Appointment.locationType` is now **required**
- Existing appointments in database will need `locationType` set

### API Changes
- `/api/appointments/book` now requires `locationType` field
- Response includes `serviceFee` and `ageGroup` fields

---

## 🔧 Configuration

### Service Fee (Resource Center)
The service fee is currently hardcoded to KES 500 in `lib/appointments.ts`:

```typescript
export function getResourceCenterServiceFee(): number {
  return 500; // KES 500
}
```

To make it configurable:
1. Add to environment variables
2. Update the function to read from env
3. Add to admin configuration UI (Phase 13)

### Slot Allocation
Default slot allocation is in `lib/appointments.ts`:

```typescript
export function getResourceCenterSlotAllocation() {
  return {
    totalSlots: 15,
    slotsUnder15: 6,
    slotsOver15: 9,
  };
}
```

To override for specific dates, use the `AppointmentConfig` model.

---

## 📝 Environment Variables

No new environment variables required for Phase 7. Existing variables:
- `DATABASE_URL` - Already required
- `JWT_SECRET` - Already required
- `OTP_EXPIRY_MINUTES` - Already required

---

## 🐛 Troubleshooting

### Issue: Migration fails with "column does not exist"
**Solution:** Ensure you're running the migration on the correct database and that previous migrations have been applied.

### Issue: "locationType does not exist" error
**Solution:** 
1. Check that migration was run successfully
2. Regenerate Prisma Client: `npx prisma generate`
3. Restart the development server

### Issue: Slots not showing for Resource Center
**Solution:**
1. Ensure the selected date is Tuesday or Thursday
2. Check that user has age or dateOfBirth set
3. Verify appointments are not fully booked

### Issue: SMS not being sent
**Solution:**
1. Check SMS logs in database: `npx prisma studio`
2. Verify user has phone number
3. Check SMS simulator dashboard at `/admin/sms-simulator`

---

## 📊 Post-Deployment Verification

### Checklist
- [ ] Database migration completed successfully
- [ ] Prisma Client regenerated
- [ ] Appointment booking page loads
- [ ] Resource Center booking works (Tuesday/Thursday)
- [ ] Outreach booking works (weekdays)
- [ ] Service fee dialog shows for Resource Center
- [ ] SMS confirmations are sent
- [ ] SMS visible in simulator dashboard
- [ ] Reschedule functionality works
- [ ] All unit tests pass (111/111)
- [ ] No TypeScript errors
- [ ] No linting errors

---

## 🔄 Rollback Plan

If issues occur after deployment:

1. **Rollback Migration:**
   ```bash
   # Manually revert the migration
   # Restore previous schema.prisma
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

2. **Revert Code:**
   ```bash
   git revert <commit-hash>
   npm install
   npx prisma generate
   ```

---

## 📈 Monitoring

After deployment, monitor:
- Appointment booking success rate
- API response times
- SMS delivery success rate
- Database query performance
- Error rates in logs

---

**Last Updated:** December 12, 2024

