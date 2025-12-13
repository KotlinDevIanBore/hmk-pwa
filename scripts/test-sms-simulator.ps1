# Test SMS Simulator API
Write-Host "Testing SMS Simulator API..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/sms-logs" `
        -Method GET `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response (first 500 chars):" -ForegroundColor Green
    $content = $response.Content
    if ($content.Length -gt 500) {
        Write-Host $content.Substring(0, 500) + "..."
    } else {
        Write-Host $content
    }
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error:" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host $reader.ReadToEnd()
    } catch {
        Write-Host $_.Exception.Message
    }
}

