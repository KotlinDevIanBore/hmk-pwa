# Fix Database Connection Script for HMK PWA
# This script helps diagnose and fix database connection issues

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "HMK PWA - Database Connection Fix Script" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PostgreSQL Service
Write-Host "Step 1: Checking PostgreSQL service..." -ForegroundColor Yellow
Write-Host ""

$postgresService = Get-Service postgresql* -ErrorAction SilentlyContinue

if ($postgresService) {
    Write-Host "  PostgreSQL Service Found: $($postgresService.DisplayName)" -ForegroundColor Green
    Write-Host "  Status: $($postgresService.Status)" -ForegroundColor $(if ($postgresService.Status -eq "Running") { "Green" } else { "Red" })
    
    if ($postgresService.Status -ne "Running") {
        Write-Host ""
        Write-Host "  WARNING: PostgreSQL is not running!" -ForegroundColor Red
        $start = Read-Host "  Would you like to start it? (Y/N)"
        if ($start -eq "Y" -or $start -eq "y") {
            Start-Service $postgresService.Name
            Write-Host "  PostgreSQL started successfully!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ERROR: PostgreSQL service not found!" -ForegroundColor Red
    Write-Host "  Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "  Visit: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Step 2: Check for .env.local file
Write-Host "Step 2: Checking .env.local file..." -ForegroundColor Yellow
Write-Host ""

$envFile = ".env.local"
$envExists = Test-Path $envFile

if ($envExists) {
    Write-Host "  .env.local file found!" -ForegroundColor Green
    
    # Check if DATABASE_URL exists
    $content = Get-Content $envFile -Raw
    if ($content -match "DATABASE_URL") {
        Write-Host "  DATABASE_URL is configured" -ForegroundColor Green
        
        # Extract and display (masked)
        $dbUrl = ($content -split "`n" | Where-Object { $_ -match "DATABASE_URL" }) -split "=" | Select-Object -Last 1
        $maskedUrl = $dbUrl -replace "://[^:]+:([^@]+)@", "://postgres:****@"
        Write-Host "  Current: $maskedUrl" -ForegroundColor Cyan
    } else {
        Write-Host "  WARNING: DATABASE_URL not found in .env.local" -ForegroundColor Red
        $envExists = $false
    }
} 

if (-not $envExists) {
    Write-Host "  .env.local file missing or incomplete!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  I'll help you create it..." -ForegroundColor Yellow
    Write-Host ""
    
    $dbPassword = Read-Host "  Enter your PostgreSQL password (default: postgres)" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
    )
    
    if ([string]::IsNullOrWhiteSpace($dbPasswordPlain)) {
        $dbPasswordPlain = "postgres"
    }
    
    # Generate JWT secret
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    $envContent = @"
# Database Configuration
DATABASE_URL="postgresql://postgres:$dbPasswordPlain@localhost:5432/hmk_pwa"

# JWT Configuration
JWT_SECRET="$jwtSecret"
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
"@
    
    Set-Content -Path $envFile -Value $envContent
    Write-Host "  .env.local file created successfully!" -ForegroundColor Green
}

Write-Host ""

# Step 3: Test Database Connection
Write-Host "Step 3: Testing database connection..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Running test script..." -ForegroundColor Cyan
$testResult = npx tsx scripts/test-db-connection.ts 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Database connection successful!" -ForegroundColor Green
} else {
    Write-Host "  Database connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Wrong password in DATABASE_URL" -ForegroundColor Gray
    Write-Host "  2. Database 'hmk_pwa' doesn't exist" -ForegroundColor Gray
    Write-Host "  3. PostgreSQL not accepting connections" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Try creating the database:" -ForegroundColor Cyan
    Write-Host "    psql -U postgres -c `"CREATE DATABASE hmk_pwa;`"" -ForegroundColor Gray
    Write-Host ""
    
    $createDb = Read-Host "  Would you like me to try creating the database? (Y/N)"
    if ($createDb -eq "Y" -or $createDb -eq "y") {
        Write-Host "  Creating database..." -ForegroundColor Cyan
        $psqlPath = "C:\Program Files\PostgreSQL\*\bin\psql.exe"
        $psqlExe = (Get-Item $psqlPath -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
        
        if ($psqlExe) {
            & $psqlExe -U postgres -c "CREATE DATABASE hmk_pwa;"
            Write-Host "  Database created! Running test again..." -ForegroundColor Green
            npx tsx scripts/test-db-connection.ts
        } else {
            Write-Host "  Could not find psql.exe" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Step 4: Run Prisma Migrations
Write-Host "Step 4: Running Prisma migrations..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "  Pushing schema to database..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Migrations completed successfully!" -ForegroundColor Green
} else {
    Write-Host "  Migrations failed!" -ForegroundColor Red
}

Write-Host ""

# Step 5: Final Verification
Write-Host "Step 5: Final verification..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Checking user count..." -ForegroundColor Cyan
npx tsx scripts/check-users.ts

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 79) -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 79) -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start the dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Open: http://localhost:3000/en/auth/register" -ForegroundColor White
Write-Host "  3. Test the registration flow" -ForegroundColor White
Write-Host ""
Write-Host "For detailed troubleshooting, see: OTP_ISSUE_RESOLUTION.md" -ForegroundColor Cyan
Write-Host ""

