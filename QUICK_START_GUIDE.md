# HMK PWA - Quick Start Guide

This guide will help you get the HMK PWA up and running in minutes!

## 📋 Prerequisites

Before running the setup scripts, ensure you have:

1. **Node.js** (v18.17.0 or higher)
   ```bash
   node --version
   ```

2. **PostgreSQL** (v12 or higher)
   - Download: https://www.postgresql.org/download/
   - Ensure PostgreSQL is running
   - Know your database credentials

3. **Git** (for cloning the repository)
   ```bash
   git --version
   ```

## 🚀 Automated Setup (Recommended)

We've created automated setup scripts for your convenience!

### Windows Users

**Option 1: Double-click method** (Easiest)
1. Navigate to the `scripts` folder
2. Double-click `quick-start.bat`
3. Follow the prompts

**Option 2: PowerShell method**
```powershell
# Open PowerShell in the project root
cd "D:\HMK  - PWA"

# Run the setup script
.\scripts\setup.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Mac/Linux Users

```bash
# Make the script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

## 🎯 What the Setup Script Does

The automated setup script will:

1. ✅ Check if `.env.local` exists (or create a new one)
2. ✅ Generate a secure JWT secret automatically
3. ✅ Prompt you for database configuration
4. ✅ Install all npm dependencies
5. ✅ Generate Prisma Client
6. ✅ Test database connection
7. ✅ Run database migrations
8. ✅ Optionally seed sample data
9. ✅ Run the test suite
10. ✅ Start the development server

**Total time:** ~5-10 minutes (depending on your internet speed)

## 📝 Setup Script Prompts

During setup, you'll be asked for:

### Database Configuration
- **Host**: Usually `localhost` for local development
- **Port**: Default is `5432`
- **Username**: Default is `postgres`
- **Password**: Your PostgreSQL password
- **Database name**: Suggested `hmk_pwa`

### Setup Options
- **Run migrations?** (Y/n) - Creates all database tables
- **Seed database?** (y/N) - Adds sample data for testing
- **Run tests?** (Y/n) - Verifies everything works
- **Start dev server?** (Y/n) - Launches the app

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create .env.local

Generate a JWT secret:
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Mac/Linux
openssl rand -base64 32
```

Create `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hmk_pwa"
JWT_SECRET="your-generated-secret-here"
JWT_EXPIRES_IN="7d"
OTP_EXPIRY_MINUTES="5"
RATE_LIMIT_MAX="5"
RATE_LIMIT_WINDOW_MS="900000"
BCRYPT_ROUNDS="10"
NODE_ENV="development"
```

### Step 3: Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed data
npm run prisma:seed
```

### Step 4: Verify Setup
```bash
# Run tests
npm run test

# Run linter
npm run lint
```

### Step 5: Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 🗄️ PostgreSQL Setup Tips

### Windows
1. Download PostgreSQL installer from postgresql.org
2. During installation, remember your postgres password
3. PostgreSQL service starts automatically

### Mac (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb hmk_pwa
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb hmk_pwa
```

### Create Database (if needed)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hmk_pwa;

# Exit
\q
```

## ✅ Verify Everything Works

After setup, verify:

1. **Environment Variables**
   ```bash
   # Check .env.local exists
   ls -la .env.local  # Mac/Linux
   dir .env.local     # Windows
   ```

2. **Database Connection**
   ```bash
   npm run prisma:studio
   ```
   Opens Prisma Studio at http://localhost:5555

3. **Tests**
   ```bash
   npm run test
   ```
   Should see: ✅ 83/83 tests passing

4. **Linter**
   ```bash
   npm run lint
   ```
   Should see: ✅ No ESLint warnings or errors

5. **Development Server**
   ```bash
   npm run dev
   ```
   Opens at http://localhost:3000

## 🎨 First Time Using the App

After setup, try these features:

1. **Change Language** - Top right corner (EN/SW)
2. **Accessibility Controls** - Settings icon in header
3. **Register as PWD** - Go to Registration → Self-register
4. **Register as Caregiver** - Go to Registration → Caregiver
5. **SMS Simulator** - View OTPs at /en/admin/sms-simulator

### Test Accounts (if you seeded the database)
```
Phone: 0712000001
PIN: 1234
Role: PWD

Phone: 0712000002
PIN: 1234
Role: CAREGIVER
```

## 🐛 Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check your DATABASE_URL in .env.local
- Verify database credentials
- Check if database exists: `psql -U postgres -l`

### "JWT_SECRET is not defined"
- Ensure .env.local exists in project root
- Check JWT_SECRET is set in .env.local
- Restart the dev server

### "Prisma Client not generated"
```bash
npm run prisma:generate
```

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json  # Mac/Linux
# or
rmdir /s node_modules && del package-lock.json  # Windows

npm install
```

### "Port 3000 already in use"
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Setup script won't run (Windows PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 Useful Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
```

### Database
```bash
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI
npm run prisma:seed      # Seed sample data
```

### Database Migrations
```bash
# Create a new migration
npx prisma migrate dev --name description_of_changes

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy
```

## 🔄 Updating the App

When you pull new changes:

```bash
# Pull latest changes
git pull

# Install any new dependencies
npm install

# Run new migrations
npm run prisma:migrate

# Regenerate Prisma Client
npm run prisma:generate

# Run tests to verify
npm run test
```

## 🆘 Need Help?

1. **Check documentation:**
   - `DEPLOYMENT_READINESS.md` - Deployment guide
   - `PHASE_ERRORS_TRACKING.md` - Known issues
   - `ENV_VARIABLES.md` - Environment variables

2. **Run diagnostics:**
   ```bash
   # Check Node version
   node --version
   
   # Check npm version
   npm --version
   
   # Check PostgreSQL
   psql --version
   
   # Test database connection
   npm run prisma:studio
   ```

3. **Review logs:**
   - Development server logs in terminal
   - Browser console (F12)
   - Database logs in PostgreSQL

## 🎉 Next Steps

Once everything is running:

1. **Explore the app** - Try all the features
2. **Read the documentation** - Understand the architecture
3. **Run E2E tests** - `npm run test:e2e`
4. **Review Phase 4 Summary** - See `PHASE4_COMPLETION_SUMMARY.md`
5. **Check deployment readiness** - See `DEPLOYMENT_READINESS.md`

---

**Happy coding! 🚀**

If you encounter any issues not covered here, please document them in `PHASE_ERRORS_TRACKING.md`.

