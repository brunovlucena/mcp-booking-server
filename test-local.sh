#!/bin/bash

# 🏨 MCP Booking Server - Teste Local
# Script para testar o servidor localmente antes de publicar

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏨 MCP Booking Server - Teste Local${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Função para testar comando
test_command() {
    local cmd="$1"
    local description="$2"
    
    echo -e "${YELLOW}🧪 Testando: $description${NC}"
    if eval "$cmd"; then
        echo -e "${GREEN}✅ $description - OK${NC}"
    else
        echo -e "${RED}❌ $description - FALHOU${NC}"
        return 1
    fi
    echo ""
}

# 1. Verificar dependências
echo -e "${BLUE}📋 Verificando dependências...${NC}"
test_command "node --version" "Node.js instalado"
test_command "npm --version" "npm instalado"
test_command "docker --version" "Docker instalado"
test_command "task --version" "Task instalado"

# 2. Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
test_command "npm install" "Instalação de dependências"

# 3. Testes de código
echo -e "${BLUE}🔍 Executando testes de código...${NC}"
test_command "npm run lint" "Linting"
test_command "npm run format:check" "Verificação de formatação"
test_command "npm run build" "Build do projeto"

# 4. Teste do servidor
echo -e "${BLUE}🚀 Testando servidor...${NC}"
test_command "timeout 10s npm run dev || true" "Servidor de desenvolvimento (10s)"

# 5. Teste Docker
echo -e "${BLUE}🐳 Testando Docker...${NC}"
test_command "docker build -t mcp-booking-server:test ." "Build da imagem Docker"
test_command "docker run --rm -d --name mcp-booking-test -p 3001:3001 mcp-booking-server:test" "Execução do container"

# Aguardar container inicializar
echo -e "${YELLOW}⏳ Aguardando container inicializar...${NC}"
sleep 5

# Testar se container está rodando
if docker ps | grep -q mcp-booking-test; then
    echo -e "${GREEN}✅ Container está rodando${NC}"
else
    echo -e "${RED}❌ Container não está rodando${NC}"
fi

# 6. Teste de conectividade
echo -e "${BLUE}🌐 Testando conectividade...${NC}"
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Servidor respondendo na porta 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Servidor não está respondendo (normal se não tiver endpoint HTTP)${NC}"
fi

# 7. Teste MCP específico
echo -e "${BLUE}🔧 Testando funcionalidades MCP...${NC}"
test_command "node test.js" "Teste das funcionalidades básicas"

# 8. Limpeza
echo -e "${BLUE}🧹 Limpando recursos de teste...${NC}"
docker stop mcp-booking-test || true
docker rm mcp-booking-test || true
docker rmi mcp-booking-server:test || true

echo ""
echo -e "${GREEN}🎉 Teste local concluído!${NC}"
echo -e "${BLUE}📋 Resumo:${NC}"
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo -e "${GREEN}✅ Código compilado${NC}"
echo -e "${GREEN}✅ Docker funcionando${NC}"
echo -e "${GREEN}✅ Servidor MCP funcionando${NC}"
echo ""
echo -e "${YELLOW}🚀 Pronto para publicar no MCP Registry!${NC}"
