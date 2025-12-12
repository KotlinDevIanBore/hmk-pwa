# HMK PWA Setup Instructions

This document provides step-by-step instructions to set up and run the HMK PWA project.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v18.17.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

## Step 1: Install Node.js

### Windows:
1. Download Node.js installer from https://nodejs.org/
2. Run the installer and follow the prompts
3. Restart your terminal/PowerShell
4. Verify: `node --version` and `npm --version`

### macOS:
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

### Linux:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify
node --version
npm --version
```

## Step 2: Install PostgreSQL

### Windows:
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer, set password for postgres user (remember this!)
3. Default port: 5432
4. Verify by opening pgAdmin or running: `psql --version`

### macOS:
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14

# Verify
psql --version
```

### Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

## Step 3: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database
CREATE DATABASE hmk_pwa;

# Create user (optional, for better security)
CREATE USER hmk_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hmk_pwa TO hmk_user;

# Exit psql
\q
```

## Step 4: Install Project Dependencies

Navigate to the project directory and install dependencies:

```bash
cd "D:\HMK  - PWA"

# Install dependencies
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Prisma
- next-intl
- shadcn/ui components
- Testing libraries (Vitest, Playwright)
- And all other dependencies

## Step 5: Configure Environment Variables

Create a `.env.local` file (it should already exist with default values):

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/hmk_pwa?schema=public"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="HMK PWA"

# Session Secret (change in production)
SESSION_SECRET="dev-secret-key-change-in-production"

# Feature Flags
NEXT_PUBLIC_ENABLE_SMS="false"
NEXT_PUBLIC_ENABLE_USSD="false"
```

**Important:** Replace `your_password` with your PostgreSQL password.

## Step 6: Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate

# When prompted, enter a migration name like: "initial_setup"
```

## Step 7: Seed the Database

```bash
# Populate database with sample data
npm run prisma:seed
```

This will create:
- Admin users (admin@hmk.org, support@hmk.org)
- Sample PWD users
- Sample caregiver
- Mobility devices catalog
- Outreach locations
- Sample appointments and service requests

## Step 8: Run Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:3000

## Step 9: Verify Installation

1. Open browser to http://localhost:3000/en
2. You should see the HMK PWA homepage
3. Test accessibility controls (top-right corner)
4. Test language switcher (English/Swahili)
5. Try navigating with keyboard (Tab key)

## Step 10: Run Tests

### Unit Tests (Vitest)
```bash
npm test
```

### E2E Tests (Playwright)
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

## Database Management

### View Database with Prisma Studio
```bash
npm run prisma:studio
```
Opens a web interface at http://localhost:5555 to view and edit database records.

### Reset Database (Warning: Deletes all data!)
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

## Common Issues and Solutions

### Issue: "psql is not recognized"
**Solution:** Add PostgreSQL bin directory to PATH environment variable.

Windows: `C:\Program Files\PostgreSQL\14\bin`

### Issue: "Cannot connect to database"
**Solution:** 
1. Check PostgreSQL service is running
2. Verify DATABASE_URL in .env.local
3. Test connection: `psql -U postgres -d hmk_pwa`

### Issue: "Port 3000 already in use"
**Solution:** 
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Module not found" errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: Prisma Client errors
**Solution:**
```bash
npm run prisma:generate
```

## Development Workflow

1. **Start development server:** `npm run dev`
2. **Make code changes** - Hot reload is enabled
3. **Run tests:** `npm test`
4. **Check linting:** `npm run lint`
5. **View database:** `npm run prisma:studio`
6. **Commit changes:** Follow conventional commits format

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Additional Tools

### ESLint
```bash
npm run lint
```

### TypeScript Type Checking
```bash
npx tsc --noEmit
```

## Next Steps

After successful setup:

1. Review the development plan: `HMK_PWA_Development_Plan.md`
2. Check `.cursorrules` for coding standards
3. Read `PROJECT_SUMMARY.md` for project overview
4. Explore the codebase structure
5. Start implementing Phase 2 features

## Getting Help

- Review documentation in `/docs` folder (when created)
- Check `QUICK_START.md` for quick reference
- Review Prisma schema: `prisma/schema.prisma`
- Check translations: `messages/en.json` and `messages/sw.json`

## Admin Login Credentials (Development)

After seeding the database:
- **Email:** admin@hmk.org
- **Password:** admin123 (⚠️ Change in production!)

## Sample User Credentials (Development)

PWD User:
- **Phone:** +254712345678 or 0712345678
- **PIN:** 1234

Caregiver:
- **Phone:** +254734567890 or 0734567890
- **PIN:** 1234

---

**Note:** These instructions are for development environment only. Production deployment requires additional security configurations.


