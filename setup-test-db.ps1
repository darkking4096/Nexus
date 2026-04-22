# PowerShell script to setup PostgreSQL for tests
# Run as: powershell -ExecutionPolicy Bypass -File setup-test-db.ps1

Write-Host "🚀 Configurando PostgreSQL para testes..." -ForegroundColor Green

# Find PostgreSQL installation
$postgresVersions = @("17", "16", "15", "14")
$psqlPath = $null

foreach ($version in $postgresVersions) {
    $path = "C:\Program Files\PostgreSQL\$version\bin\psql.exe"
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "✅ PostgreSQL $version encontrado" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL não encontrado em Program Files" -ForegroundColor Red
    Write-Host "Verifique se PostgreSQL está instalado" -ForegroundColor Yellow
    exit 1
}

# Start PostgreSQL service
Write-Host "`n⏳ Iniciando serviço PostgreSQL..." -ForegroundColor Yellow
Start-Service -Name "postgresql-*" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Create test database
Write-Host "📊 Criando banco de dados nexus_test..." -ForegroundColor Yellow
& $psqlPath -U postgres -c "CREATE DATABASE nexus_test;" 2>$null

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    Write-Host "✅ Banco de testes pronto!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Erro ao criar banco. Talvez já exista." -ForegroundColor Yellow
}

Write-Host "`n✅ Configuração concluída!" -ForegroundColor Green
Write-Host "Próximo passo: npm test" -ForegroundColor Cyan
