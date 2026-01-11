# Local Setup Instructions

## Quick Start

I've fixed the dependency issues and created a setup script. Follow these steps:

### Step 1: Fix Database Credentials

The `.env.local` file currently has placeholder database credentials. You need to update it with your actual PostgreSQL password.

**Option A: Use the automated setup script (Recommended)**
```bash
./setup-local.sh
```

This script will:
- Prompt you for your PostgreSQL credentials
- Test the database connection
- Create the database if it doesn't exist
- Update `.env.local` with correct credentials
- Run migrations
- Optionally start the dev server

**Option B: Manual setup**

1. Edit `.env.local` and update the `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/hmk_pwa"
   ```

2. Create the database (if it doesn't exist):
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE hmk_pwa;
   
   # Exit
   \q
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### Step 2: Start the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## What's Already Fixed

✅ **Dependency conflict resolved**: Installed `framer-motion@11.11.17` with `--legacy-peer-deps` to work with React 19

✅ **Prisma Client generated**: Ready to use

✅ **Environment file created**: `.env.local` exists with all required variables (you just need to update the database password)

## Troubleshooting

### "Authentication failed" error

This means your PostgreSQL password is incorrect. Try:

1. Check your PostgreSQL password:
   ```bash
   # Try connecting manually
   psql -U postgres -h localhost
   ```

2. If you forgot your password, you can reset it:
   ```bash
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'newpassword';
   ```

3. Update `.env.local` with the correct password

### "Database does not exist" error

Create it manually:
```bash
psql -U postgres -c "CREATE DATABASE hmk_pwa;"
```

### PostgreSQL not running

Start PostgreSQL:
```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# Or check status
sudo systemctl status postgresql
```

### Port 3000 already in use

Kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linter
npm run test             # Run tests

# Database
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed sample data
```

## Next Steps

Once the server is running:

1. Open http://localhost:3000
2. Try registering a new user
3. Check Prisma Studio: `npm run prisma:studio` (opens at http://localhost:5555)
