# Pubs-tagram Environment Verification Script
# Run this to validate your development environment is properly configured

Write-Host "🔍 Pubs-tagram Environment Verification" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check Node version compatibility
Write-Host "Checking Node compatibility..." -ForegroundColor Yellow
$majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($majorVersion -ge 16) {
    Write-Host "✅ Node $majorVersion is compatible with Expo" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node $majorVersion is old. Expo requires Node 16+. Consider upgrading." -ForegroundColor Yellow
}

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules directory exists" -ForegroundColor Green
    if (Test-Path "node_modules/expo") {
        Write-Host "✅ Expo package installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Expo package not found in node_modules. Run: npm install" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "❌ node_modules not found. Run: npm install" -ForegroundColor Red
    $allGood = $false
}

# Check npx availability
Write-Host "Checking npx..." -ForegroundColor Yellow
$npxVersion = npx --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npx available: $npxVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npx not available" -ForegroundColor Red
    $allGood = $false
}

# Check Firebase config
Write-Host "Checking Firebase setup..." -ForegroundColor Yellow
if ((Test-Path ".env.local") -or (Test-Path "google-services.json") -or (Test-Path "GoogleService-Info.plist")) {
    Write-Host "✅ Firebase config files found" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Firebase config files detected (google-services.json or GoogleService-Info.plist)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ Environment is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npx expo start --clear" -ForegroundColor White
    Write-Host "2. Scan the QR code with Expo Go on your phone" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues detected. Please fix the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "For more help, see QUICK_START.md > Troubleshooting" -ForegroundColor Gray
