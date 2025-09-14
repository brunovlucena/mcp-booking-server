#!/bin/bash

# MCP Booking Server - Script de Instalação
# Desenvolvido por Bruno Lucena

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏨 MCP Booking Server - Instalação${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo -e "${YELLOW}📥 Instale Node.js em: https://nodejs.org/${NC}"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versão 18+ necessária!${NC}"
    echo -e "${YELLOW}📥 Versão atual: $(node --version)${NC}"
    echo -e "${YELLOW}📥 Atualize em: https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) encontrado${NC}"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) encontrado${NC}"
echo ""

# Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências instaladas com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

# Compilar projeto
echo -e "${BLUE}🔨 Compilando projeto...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Projeto compilado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao compilar projeto${NC}"
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Criando arquivo .env...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado!${NC}"
    echo -e "${YELLOW}⚠️  Edite o arquivo .env com suas configurações${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Instalação concluída com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo -e "${YELLOW}1.${NC} Edite o arquivo .env com suas configurações"
echo -e "${YELLOW}2.${NC} Execute: ${GREEN}make start${NC} para iniciar o servidor"
echo -e "${YELLOW}3.${NC} Execute: ${GREEN}make dev${NC} para modo desenvolvimento"
echo -e "${YELLOW}4.${NC} Execute: ${GREEN}make help${NC} para ver todos os comandos"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo -e "${YELLOW}•${NC} README.md - Documentação completa"
echo -e "${YELLOW}•${NC} examples/usage.md - Exemplos de uso"
echo -e "${YELLOW}•${NC} mcp-config.json - Configuração do MCP client"
echo ""
echo -e "${GREEN}🚀 MCP Booking Server pronto para uso!${NC}"
