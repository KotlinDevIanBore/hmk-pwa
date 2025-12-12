# HMK PWA - Quick Setup Script (Windows PowerShell)
# This script automates the initial setup process

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HMK PWA - Quick Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate JWT secret
function Generate-JwtSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "✅ Keeping existing .env.local file" -ForegroundColor Green
        $skipEnv = $true
    } else {
        $skipEnv = $false
    }
} else {
    $skipEnv = $false
}

# Create .env.local if needed
if (-not $skipEnv) {
    Write-Host ""
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Cyan
    Write-Host ""
    
    # Get database configuration
    Write-Host "Database Configuration:" -ForegroundColor Yellow
    $dbHost = Read-Host "Database host (default: localhost)"
    if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
    
    $dbPort = Read-Host "Database port (default: 5432)"
    if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
    
    $dbUser = Read-Host "Database username (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }
    
    $dbPassword = Read-Host "Database password" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
    )
    
    $dbName = Read-Host "Database name (default: hmk_pwa)"
    if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "hmk_pwa" }
    
    # Generate JWT secret
    Write-Host ""
    Write-Host "🔐 Generating JWT secret..." -ForegroundColor Cyan
    $jwtSecret = Generate-JwtSecret
    
    # Create DATABASE_URL
    $databaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}"
    
    # Create .env.local content
    $envContent = @"
# Database Configuration
DATABASE_URL="$databaseUrl"

# JWT Configuration
JWT_SECRET="$jwtSecret"
JWT_EXPIRES_IN="7d"

# OTP Configuration
OTP_EXPIRY_MINUTES="5"

# Rate Limiting
RATE_LIMIT_MAX="5"
RATE_LIMIT_WINDOW_MS="900000"

# Security
BCRYPT_ROUNDS="10"

# Environment
NODE_ENV="development"
"@
    
    # Write to file
    Set-Content -Path ".env.local" -Value $envContent
    Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Generate Prisma Client
Write-Host ""
Write-Host "🔨 Generating Prisma Client..." -ForegroundColor Cyan
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated!" -ForegroundColor Green

# Test database connection
Write-Host ""
Write-Host "🔌 Testing database connection..." -ForegroundColor Cyan
$testConnection = Read-Host "Do you want to test the database connection? (Y/n)"
if ($testConnection -ne "n" -and $testConnection -ne "N") {
    try {
        # Try to run a simple Prisma command to test connection
        $output = npx prisma db execute --stdin --schema prisma/schema.prisma <<< "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database connection successful!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Could not connect to database" -ForegroundColor Yellow
            Write-Host "Please ensure PostgreSQL is running and credentials are correct" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test database connection" -ForegroundColor Yellow
        Write-Host "Please ensure PostgreSQL is running" -ForegroundColor Yellow
    }
}

# Run migrations
Write-Host ""
Write-Host "🗄️  Database Migrations" -ForegroundColor Cyan
$runMigrations = Read-Host "Do you want to run database migrations now? (Y/n)"
if ($runMigrations -ne "n" -and $runMigrations -ne "N") {
    Write-Host "Running migrations..."
    npm run prisma:migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations completed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Migration failed - you can run 'npm run prisma:migrate' manually later" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped migrations - run 'npm run prisma:migrate' when ready" -ForegroundColor Yellow
}

# Seed database
Write-Host ""
Write-Host "🌱 Database Seeding" -ForegroundColor Cyan
$runSeed = Read-Host "Do you want to seed the database with sample data? (y/N)"
if ($runSeed -eq "y" -or $runSeed -eq "Y") {
    Write-Host "Seeding database..."
    npm run prisma:seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Seeding failed - you can run 'npm run prisma:seed' manually later" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped seeding" -ForegroundColor Yellow
}

# Run tests
Write-Host ""
Write-Host "🧪 Running Tests" -ForegroundColor Cyan
$runTests = Read-Host "Do you want to run the test suite? (Y/n)"
if ($runTests -ne "n" -and $runTests -ne "N") {
    Write-Host "Running unit tests..."
    npm run test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All tests passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some tests failed - check the output above" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped tests" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review your .env.local file" -ForegroundColor White
Write-Host "2. Start the development server: npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "- npm run dev          Start development server" -ForegroundColor White
Write-Host "- npm run build        Build for production" -ForegroundColor White
Write-Host "- npm run test         Run unit tests" -ForegroundColor White
Write-Host "- npm run test:e2e     Run E2E tests" -ForegroundColor White
Write-Host "- npm run lint         Run linter" -ForegroundColor White
Write-Host "- npm run prisma:studio Open Prisma Studio (database GUI)" -ForegroundColor White
Write-Host ""

# Ask to start dev server
$startDev = Read-Host "Do you want to start the development server now? (Y/n)"
if ($startDev -ne "n" -and $startDev -ne "N") {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Run 'npm run dev' when you're ready to start!" -ForegroundColor Green
    Write-Host ""
}

