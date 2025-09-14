#!/bin/bash

# 🏨 MCP Booking Server - Teste de Conexão com Cursor
# Script para testar se o servidor MCP está funcionando com Cursor

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏨 MCP Booking Server - Teste de Conexão com Cursor${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# 1. Build do projeto
echo -e "${YELLOW}🔨 Compilando projeto...${NC}"
npm run build
echo -e "${GREEN}✅ Projeto compilado${NC}"
echo ""

# 2. Testar servidor MCP
echo -e "${YELLOW}🚀 Testando servidor MCP...${NC}"
echo -e "${BLUE}Iniciando servidor em background...${NC}"

# Iniciar servidor em background
node dist/index.js &
SERVER_PID=$!

# Aguardar servidor inicializar
sleep 3

echo -e "${GREEN}✅ Servidor MCP iniciado (PID: $SERVER_PID)${NC}"
echo ""

# 3. Testar comunicação MCP
echo -e "${YELLOW}🔧 Testando comunicação MCP...${NC}"

# Criar um teste simples de comunicação MCP
cat > test-mcp-communication.js << 'EOF'
const { spawn } = require('child_process');

// Iniciar o servidor MCP
const server = spawn('node', ['dist/index.js'], {
  cwd: '/Users/brunolucena/workspace/mcp-booking-server',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    MCP_SERVER_NAME: 'booking-server',
    MCP_SERVER_VERSION: '1.0.0'
  }
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString());
});

server.on('close', (code) => {
  console.log(`Servidor MCP finalizado com código: ${code}`);
  if (code === 0) {
    console.log('✅ Servidor MCP funcionando corretamente');
  } else {
    console.log('❌ Servidor MCP com problemas');
  }
});

// Enviar comando de teste MCP
setTimeout(() => {
  const testCommand = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  server.stdin.write(JSON.stringify(testCommand) + '\n');
}, 2000);

// Finalizar após 10 segundos
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 10000);
EOF

node test-mcp-communication.js

# Limpar arquivo de teste
rm -f test-mcp-communication.js

# Parar servidor
kill $SERVER_PID 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Teste de comunicação MCP concluído${NC}"
echo ""

# 4. Instruções para Cursor
echo -e "${BLUE}📋 Instruções para conectar ao Cursor:${NC}"
echo ""
echo -e "${YELLOW}1. Abra o Cursor${NC}"
echo -e "${YELLOW}2. Vá para Settings > Extensions > MCP${NC}"
echo -e "${YELLOW}3. Adicione a configuração:${NC}"
echo ""
echo -e "${GREEN}Arquivo de configuração criado: cursor-mcp-config.json${NC}"
echo ""
echo -e "${BLUE}Conteúdo para adicionar no Cursor:${NC}"
cat cursor-mcp-config.json
echo ""
echo -e "${YELLOW}4. Reinicie o Cursor${NC}"
echo -e "${YELLOW}5. Teste com comandos como:${NC}"
echo -e "   - search_hotels"
echo -e "   - get_popular_destinations"
echo -e "   - get_current_offers"
echo ""
echo -e "${GREEN}🎉 Configuração pronta para usar no Cursor!${NC}"
