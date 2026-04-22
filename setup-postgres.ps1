# PostgreSQL Setup Script for Story 8.1.2
# Execute this script in PowerShell as Administrator

$password = "Darkking4096"
$pgUser = "postgres"
$pgHost = "localhost"

Write-Host "🗄️  Creating PostgreSQL databases..." -ForegroundColor Cyan

# Create nexus_dev database
Write-Host "Creating nexus_dev..." -ForegroundColor Yellow
$env:PGPASSWORD = $password
psql -U $pgUser -h $pgHost -c "CREATE DATABASE nexus_dev;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ nexus_dev created" -ForegroundColor Green
} else {
    Write-Host "⚠️  nexus_dev (may already exist)" -ForegroundColor Yellow
}

# Create nexus_test database
Write-Host "Creating nexus_test..." -ForegroundColor Yellow
psql -U $pgUser -h $pgHost -c "CREATE DATABASE nexus_test;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ nexus_test created" -ForegroundColor Green
} else {
    Write-Host "⚠️  nexus_test (may already exist)" -ForegroundColor Yellow
}

# Verify connection
Write-Host "`n📡 Verifying connection..." -ForegroundColor Cyan
psql -U $pgUser -h $pgHost -c "SELECT 1;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Connection failed. Check PostgreSQL service." -ForegroundColor Red
}

Write-Host "`n✨ Setup complete!" -ForegroundColor Cyan
