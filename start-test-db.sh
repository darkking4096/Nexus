#!/bin/bash
# Start PostgreSQL container for tests

echo "🚀 Iniciando PostgreSQL para testes..."

docker run -d \
  --name nexus-test-postgres \
  -e POSTGRES_PASSWORD=Darkking4096. \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=nexus_test \
  -p 5432:5432 \
  --rm \
  postgres:15-alpine

echo "✅ Container iniciado!"
echo "⏳ Aguardando banco ficar pronto..."
sleep 3

# Test connection
docker exec nexus-test-postgres psql -U postgres -d nexus_test -c "SELECT version();" && \
  echo "✅ Banco está pronto para testes!" || \
  echo "⚠️ Banco ainda está inicializando, aguarde mais alguns segundos..."

echo ""
echo "Para parar o banco, execute:"
echo "  docker stop nexus-test-postgres"
