# Starting Docker PostgreSQL

## ⚠️ Port 5432 Conflict

Your system PostgreSQL is currently using port 5432. You need to stop it first.

## Quick Fix

Run these commands:

```bash
# Stop system PostgreSQL
sudo systemctl stop postgresql

# Start Docker PostgreSQL
cd /home/ian/Desktop/hmk/hmk-pwa
docker-compose up -d

# Verify it's running
docker-compose ps
```

## Alternative: Use Different Port

If you want to keep system PostgreSQL running, you can change Docker to use port 5433:

1. Edit `docker-compose.yml` and change:
   ```yaml
   ports:
     - "5433:5432"  # Changed from 5432:5432
   ```

2. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://hmk_user:hmk_password@localhost:5433/hmk_pwa"
   ```

3. Start Docker:
   ```bash
   docker-compose up -d
   ```

## After Starting Docker

Once Docker PostgreSQL is running:

```bash
# Test Prisma connection
npx prisma db pull

# Run migrations
npx prisma migrate dev

# Start your app
npm run dev
```
