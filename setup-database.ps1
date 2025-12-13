# HMK PWA Database Setup Script
# Run this after PostgreSQL is installed

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HMK PWA Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add PostgreSQL to PATH for this session
$pgPath = "C:\Program Files\PostgreSQL\16\bin"
if (Test-Path $pgPath) {
    $env:Path += ";$pgPath"
    Write-Host "✓ PostgreSQL found at: $pgPath" -ForegroundColor Green
} else {
    $pgPath = "C:\Program Files\PostgreSQL\15\bin"
    if (Test-Path $pgPath) {
        $env:Path += ";$pgPath"
        Write-Host "✓ PostgreSQL found at: $pgPath" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL not found. Please check installation." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Creating database 'hmk_pwa'..." -ForegroundColor Cyan

# Set password environment variable
$env:PGPASSWORD = $PostgresPassword

# Create database
$createDbCmd = "CREATE DATABASE hmk_pwa;"
$result = $createDbCmd | psql -U postgres -h localhost -p 5432 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database 'hmk_pwa' created successfully!" -ForegroundColor Green
} else {
    if ($result -match "already exists") {
        Write-Host "✓ Database 'hmk_pwa' already exists" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
}

Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Cyan

# Read existing .env file
$envContent = Get-Content .env -Raw

# Update DATABASE_URL
$newDatabaseUrl = "DATABASE_URL=`"postgresql://postgres:$PostgresPassword@localhost:5432/hmk_pwa`""
$envContent = $envContent -replace 'DATABASE_URL="postgresql://[^"]*"', $newDatabaseUrl

# Write back to .env
$envContent | Set-Content .env -NoNewline

# Also update .env.local
if (Test-Path .env.local) {
    $envLocalContent = Get-Content .env.local -Raw
    $envLocalContent = $envLocalContent -replace 'DATABASE_URL="postgresql://[^"]*"', $newDatabaseUrl
    $envLocalContent | Set-Content .env.local -NoNewline
}

Write-Host "✓ Environment files updated" -ForegroundColor Green

Write-Host ""
Write-Host "Testing database connection..." -ForegroundColor Cyan

# Test connection
$testQuery = "SELECT version();"
$testResult = $testQuery | psql -U postgres -h localhost -p 5432 -d hmk_pwa 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database connection successful!" -ForegroundColor Green
} else {
    Write-Host "✗ Database connection failed" -ForegroundColor Red
    Write-Host $testResult
    exit 1
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Database Setup Complete! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. npm run prisma:migrate    (Run database migrations)" -ForegroundColor White
Write-Host "2. npm run prisma:seed       (Optional: Add sample data)" -ForegroundColor White
Write-Host "3. npm run dev               (Start development server)" -ForegroundColor White
Write-Host ""

