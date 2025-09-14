#!/usr/bin/env node

/**
 * 🏨 MCP Booking Server - Cursor Config Generator
 * Gera arquivo de configuração para Cursor MCP
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do servidor
const SERVER_CONFIG = {
  name: 'mcp-booking-server-local',
  command: 'node',
  args: ['/Users/brunolucena/workspace/mcp-booking-server/dist/index.js'],
  env: {
    NODE_ENV: 'development',
    MCP_SERVER_NAME: 'booking-server',
    MCP_SERVER_VERSION: '1.0.0',
    PORT: '3001',
    LOG_LEVEL: 'debug',
    BOOKING_BASE_URL: 'https://www.booking.com',
    BOOKING_LANGUAGE: 'pt-br',
    BOOKING_CURRENCY: 'BRL',
    BROWSER_HEADLESS: 'true',
    BROWSER_TIMEOUT: '30000'
  }
};

// Configuração Docker
const DOCKER_CONFIG = {
  name: 'mcp-booking-server-docker',
  command: 'docker',
  args: [
    'run',
    '--rm',
    '-i',
    '-e', 'NODE_ENV=development',
    '-e', 'MCP_SERVER_NAME=booking-server',
    '-e', 'MCP_SERVER_VERSION=1.0.0',
    '-e', 'PORT=3001',
    '-e', 'LOG_LEVEL=debug',
    '-e', 'BOOKING_BASE_URL=https://www.booking.com',
    '-e', 'BOOKING_LANGUAGE=pt-br',
    '-e', 'BOOKING_CURRENCY=BRL',
    '-e', 'BROWSER_HEADLESS=true',
    '-e', 'BROWSER_TIMEOUT=30000',
    'mcp-booking-server:latest'
  ]
};

// Template da configuração
const CURSOR_CONFIG = {
  mcpServers: {
    [SERVER_CONFIG.name]: {
      command: SERVER_CONFIG.command,
      args: SERVER_CONFIG.args,
      env: SERVER_CONFIG.env
    },
    [DOCKER_CONFIG.name]: {
      command: DOCKER_CONFIG.command,
      args: DOCKER_CONFIG.args
    }
  }
};

function generateCursorConfig() {
  try {
    const configPath = path.join(__dirname, 'cursor-mcp-config.json');
    const configContent = JSON.stringify(CURSOR_CONFIG, null, 2);
    
    fs.writeFileSync(configPath, configContent, 'utf8');
    
    console.log('🏨 MCP Booking Server - Cursor Config Generator');
    console.log('');
    console.log('✅ Arquivo cursor-mcp-config.json gerado com sucesso!');
    console.log('');
    console.log('📋 Configurações incluídas:');
    console.log(`   • ${SERVER_CONFIG.name} (local)`);
    console.log(`   • ${DOCKER_CONFIG.name} (Docker)`);
    console.log('');
    console.log('🔧 Para usar no Cursor:');
    console.log('   1. Copie o conteúdo do cursor-mcp-config.json');
    console.log('   2. Cole no arquivo ~/.cursor/mcp.json');
    console.log('   3. Reinicie o Cursor');
    console.log('');
    console.log('📝 Variáveis de ambiente configuradas:');
    Object.entries(SERVER_CONFIG.env).forEach(([key, value]) => {
      console.log(`   • ${key}=${value}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar configuração:', error.message);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateCursorConfig();
}

export { generateCursorConfig, CURSOR_CONFIG };
