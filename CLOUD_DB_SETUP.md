# Quick Cloud Database Setup (5 Minutes)

## Using Neon (Recommended - Easiest)

### Step 1: Create Account
1. Go to https://neon.tech
2. Click "Sign up" (can use GitHub)
3. Create a new project named "HMK-PWA"

### Step 2: Get Connection String
1. After project creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname
   ```
2. Copy this entire string

### Step 3: Update .env File
1. Open your `.env` file in the project
2. Replace the DATABASE_URL line with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```
3. Save the file

### Step 4: Run Migrations
```powershell
cd "D:\HMK  - PWA"
npm run prisma:migrate
```

### Done! ✅
Your database is now configured and ready to use.

## Alternative: Supabase

### Step 1: Create Account
1. Go to https://supabase.com
2. Create a new project

### Step 2: Get Connection String
1. Go to Project Settings → Database
2. Find "Connection string" → "URI"
3. Copy the connection string (replace [YOUR-PASSWORD] with your database password)

### Step 3: Update .env
Same as Neon - paste your connection string into DATABASE_URL

## Free Tier Limits
- **Neon**: 0.5 GB storage, 3 projects
- **Supabase**: 500 MB database, unlimited API requests
- **Railway**: $5 free credit monthly

All are MORE than enough for development and testing!

