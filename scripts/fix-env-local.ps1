# Fix .env.local file with correct database credentials
Write-Host "Fixing .env.local file..." -ForegroundColor Cyan
Write-Host ""

$envPath = ".env"
$envLocalPath = ".env.local"

# Read DATABASE_URL from .env
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'DATABASE_URL="(.+?)"') {
        $databaseUrl = $matches[1]
        Write-Host "Found DATABASE_URL in .env" -ForegroundColor Green
        Write-Host "   $databaseUrl" -ForegroundColor Gray
        Write-Host ""
        
        # Check if .env.local exists
        if (Test-Path $envLocalPath) {
            $envLocalContent = Get-Content $envLocalPath -Raw
            
            # Check if DATABASE_URL exists in .env.local
            if ($envLocalContent -match 'DATABASE_URL=') {
                Write-Host "DATABASE_URL found in .env.local - updating it..." -ForegroundColor Yellow
                $envLocalContent = $envLocalContent -replace 'DATABASE_URL=".+?"', "DATABASE_URL=`"$databaseUrl`""
                $envLocalContent = $envLocalContent -replace "DATABASE_URL='.+?'", "DATABASE_URL=`"$databaseUrl`""
                $envLocalContent = $envLocalContent -replace 'DATABASE_URL=[^\r\n]+', "DATABASE_URL=`"$databaseUrl`""
            } else {
                Write-Host "Adding DATABASE_URL to .env.local..." -ForegroundColor Yellow
                if (-not $envLocalContent.EndsWith("`n")) {
                    $envLocalContent += "`n"
                }
                $envLocalContent += "DATABASE_URL=`"$databaseUrl`"`n"
            }
            
            # Write back
            Set-Content -Path $envLocalPath -Value $envLocalContent -NoNewline
            Write-Host "Updated .env.local" -ForegroundColor Green
        } else {
            Write-Host "Creating .env.local..." -ForegroundColor Yellow
            $content = "DATABASE_URL=`"$databaseUrl`"`nJWT_SECRET=`"your-super-secret-jwt-key-change-this-in-production`"`nNODE_ENV=`"development`"`nOTP_LENGTH=`"6`"`nOTP_EXPIRY_MINUTES=`"5`"`n"
            Set-Content -Path $envLocalPath -Value $content
            Write-Host "Created .env.local" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Done! Now restart your dev server:" -ForegroundColor Green
        Write-Host "   1. Stop the current server (Ctrl+C)" -ForegroundColor Gray
        Write-Host "   2. Run: npm run dev" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "Could not find DATABASE_URL in .env" -ForegroundColor Red
    }
} else {
    Write-Host ".env file not found" -ForegroundColor Red
}
