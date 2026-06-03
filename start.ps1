Write-Host "🚀 Billing Pro - Starting Development Environment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Docker
$dockerCheck = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Docker is not running. Please start Docker Desktop first." -ForegroundColor Yellow
    Write-Host "   Database and Redis will not be available." -ForegroundColor Yellow
} else {
    Write-Host "✅ Docker is running" -ForegroundColor Green
    
    # Start PostgreSQL + Redis
    Write-Host "📦 Starting PostgreSQL & Redis..." -ForegroundColor Cyan
    docker compose up -d
    Write-Host "✅ Database services started" -ForegroundColor Green
    
    # Wait for DB
    Start-Sleep -Seconds 3
}

Write-Host ""

# 2. Backend
Write-Host "🖥️  Setting up Backend..." -ForegroundColor Cyan
Set-Location backend

# Generate Prisma
Write-Host "   📄 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
Write-Host "   ✅ Prisma client generated" -ForegroundColor Green

# Push schema to DB
Write-Host "   📄 Pushing schema to database..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss
Write-Host "   ✅ Schema pushed" -ForegroundColor Green

# Seed
Write-Host "   🌱 Seeding database..." -ForegroundColor Cyan
npx ts-node src/prisma/seed.ts
Write-Host "   ✅ Database seeded" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit -Command cd `"$PWD`"; npm run start:dev"
Set-Location ..

Write-Host ""

# 3. Frontend
Write-Host "🌐 Setting up Frontend..." -ForegroundColor Cyan
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit -Command cd `"$PWD`"; npm run dev"
Set-Location ..

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🚀 Billing Pro is starting!" -ForegroundColor Green
Write-Host "   📡 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   📡 Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "   🔑 Login:    admin / admin123" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
