@echo off
REM Start PostgreSQL container for tests

echo 🚀 Iniciando PostgreSQL para testes...

docker run -d ^
  --name nexus-test-postgres ^
  -e POSTGRES_PASSWORD=Darkking4096. ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_DB=nexus_test ^
  -p 5432:5432 ^
  --rm ^
  postgres:15-alpine

echo ✅ Container iniciado!
echo ⏳ Aguardando banco ficar pronto...
timeout /t 3 /nobreak

echo.
echo Para parar o banco, execute:
echo   docker stop nexus-test-postgres
echo.
