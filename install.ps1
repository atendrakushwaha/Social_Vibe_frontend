#!/usr/bin/env pwsh
# SocialVibe Frontend Installation Script
# Run this script to automatically install and start the application

Write-Host "🎨 SocialVibe Frontend - Installation Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Check npm
Write-Host "📦 Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($null -eq $npmVersion) {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
Write-Host "🔧 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found, creating..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local created with default values" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Ensure backend is running on port 3000" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- README.md - Full documentation" -ForegroundColor White
Write-Host "- QUICK_START.md - Quick start guide" -ForegroundColor White
Write-Host "- COMPLETION_SUMMARY.md - What's been built" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to start development!" -ForegroundColor Green
Write-Host ""

# Ask if user wants to start dev server
$response = Read-Host "Would you like to start the development server now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    npm run dev
}
