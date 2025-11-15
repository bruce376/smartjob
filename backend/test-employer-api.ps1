# Test employer applications API
Write-Host "Testing Employer Applications API..." -ForegroundColor Cyan
Write-Host ""

# First, login as employer to get token
Write-Host "1. Logging in as employer..." -ForegroundColor Yellow
$loginBody = @{
    email = "employer@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "[SUCCESS] Logged in as employer" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "[FAILED] Could not login" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

# Test applications endpoint
Write-Host "2. Fetching applications..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = $token
        "Content-Type" = "application/json"
    }
    
    $appsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/applications/employer" -Method GET -Headers $headers -UseBasicParsing
    $applications = $appsResponse.Content | ConvertFrom-Json
    
    Write-Host "[SUCCESS] Applications endpoint working!" -ForegroundColor Green
    Write-Host "Total applications: $($applications.Count)" -ForegroundColor Gray
    Write-Host ""
    
    if ($applications.Count -gt 0) {
        Write-Host "Applications:" -ForegroundColor Cyan
        foreach ($app in $applications) {
            Write-Host "  - Applicant: $($app.applicant.name) ($($app.applicant.email))" -ForegroundColor White
            Write-Host "    Job: $($app.job.title)" -ForegroundColor Gray
            Write-Host "    Status: $($app.status)" -ForegroundColor Gray
            Write-Host "    Applied: $($app.createdAt)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "[WARNING] No applications returned from API!" -ForegroundColor Yellow
        Write-Host "But database shows 1 application exists." -ForegroundColor Yellow
        Write-Host "This means there's a problem with the API query." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "[FAILED] Could not fetch applications" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Green
