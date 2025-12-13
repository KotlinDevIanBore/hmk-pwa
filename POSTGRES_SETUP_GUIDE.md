# PostgreSQL Installation Guide for Windows

## Quick Install Steps

### 1. Download PostgreSQL
- Go to: https://www.postgresql.org/download/windows/
- Download the latest version (15.x or 16.x recommended)
- Or use direct link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### 2. Run the Installer
1. Double-click the downloaded installer
2. Click "Next" through the setup wizard
3. **IMPORTANT**: Remember the password you set for the `postgres` user
4. Keep the default port: **5432**
5. Install all components (PostgreSQL Server, pgAdmin, Command Line Tools)
6. Complete the installation

### 3. Verify Installation
After installation, PostgreSQL should start automatically as a Windows service.

Open PowerShell and run:
```powershell
# Add psql to PATH (if not already)
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Test psql
psql --version
```

### 4. Create the HMK Database

Open **pgAdmin** (installed with PostgreSQL) or use psql:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Enter your postgres password when prompted

# Then in the psql prompt:
CREATE DATABASE hmk_pwa;

# List databases to verify
\l

# Exit
\q
```

### 5. Update .env File

After creating the database, update your `.env` file with your password:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hmk_pwa"
```

## Estimated Time
- Download: 2-5 minutes
- Installation: 5-10 minutes
- Setup: 2 minutes
- **Total: ~15-20 minutes**

