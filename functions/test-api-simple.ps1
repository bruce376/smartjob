# Test API endpoints
Write-Host "Testing SmartJob API..." -ForegroundColor Cyan

# Test 1: Backend status
Write-Host ""
Write-Host "1. Testing backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing
    Write-Host "[SUCCESS] Backend is running!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "[FAILED] Backend is not running!" -ForegroundColor Red
    Write-Host "Please start with: node server.js" -ForegroundColor Yellow
    exit 1
}

# Test 2: Login
Write-Host ""
Write-Host "2. Testing login endpoint..." -ForegroundColor Yellow
$loginBody = @{
    email = "jobseeker@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[SUCCESS] Login successful!" -ForegroundColor Green
    Write-Host "User: $($data.user.name)" -ForegroundColor Gray
    Write-Host "Role: $($data.user.role)" -ForegroundColor Gray
    Write-Host "Token: $($data.token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "[FAILED] Login failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 3: Get jobs
Write-Host ""
Write-Host "3. Testing jobs endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/jobs" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "[SUCCESS] Jobs endpoint working!" -ForegroundColor Green
    Write-Host "Total jobs: $($data.total)" -ForegroundColor Gray
    Write-Host "Jobs returned: $($data.items.Count)" -ForegroundColor Gray
} catch {
    Write-Host "[FAILED] Jobs endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "API testing complete!" -ForegroundColor Green
Write-Host ""
