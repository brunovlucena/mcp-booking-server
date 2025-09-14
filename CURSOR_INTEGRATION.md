# 🏨 MCP Booking Server - Integração com Cursor

Este guia mostra como conectar o MCP Booking Server ao Cursor para usar as funcionalidades de reserva de hotéis diretamente no editor.

## 🚀 Setup Rápido

### 1. Preparar o servidor
```bash
# Navegar para o diretório do projeto
cd /Users/brunolucena/workspace/mcp-booking-server

# Instalar dependências e compilar
task setup
task build

# Testar se está funcionando
task test-cursor
```

### 2. Configurar no Cursor

1. **Abrir Cursor**
2. **Ir para Settings** (Cmd+,)
3. **Procurar por "MCP"** nas configurações
4. **Adicionar servidor MCP** com a configuração:

```json
{
  "mcpServers": {
    "booking-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/Users/brunolucena/workspace/mcp-booking-server",
      "env": {
        "NODE_ENV": "development",
        "MCP_SERVER_NAME": "booking-server",
        "MCP_SERVER_VERSION": "1.0.0",
        "BOOKING_BASE_URL": "https://www.booking.com",
        "BOOKING_LANGUAGE": "pt-br",
        "BOOKING_CURRENCY": "BRL",
        "BROWSER_HEADLESS": "true",
        "BROWSER_TIMEOUT": "30000",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

5. **Reiniciar Cursor**

## 🛠️ Comandos Disponíveis

Após configurar, você pode usar estes comandos no Cursor:

### 🔍 Busca de Hotéis
- **`search_hotels`** - Buscar hotéis por destino e datas
- **`search_hotels_by_price_range`** - Buscar por faixa de preço
- **`search_hotels_by_rating`** - Buscar por classificação

### 🏨 Detalhes e Reservas
- **`get_hotel_details`** - Obter detalhes de um hotel
- **`make_reservation`** - Fazer reserva (simulação)

### 📋 Informações Gerais
- **`get_popular_destinations`** - Listar destinos populares
- **`get_current_offers`** - Ver ofertas atuais

## 📝 Exemplos de Uso

### Buscar hotéis em São Paulo
```
search_hotels destination="São Paulo, Brasil" checkin="2024-12-25" checkout="2024-12-30" guests=2 rooms=1
```

### Buscar hotéis por preço
```
search_hotels_by_price_range destination="Rio de Janeiro" checkin="2024-12-25" checkout="2024-12-30" minPrice=200 maxPrice=500
```

### Buscar hotéis com classificação alta
```
search_hotels_by_rating destination="Paris, França" checkin="2024-12-25" checkout="2024-12-30" minRating=8
```

### Ver destinos populares
```
get_popular_destinations
```

### Ver ofertas atuais
```
get_current_offers
```

## 🔧 Troubleshooting

### Servidor não conecta
```bash
# Verificar se o servidor está compilado
task build

# Testar servidor manualmente
node dist/index.js
```

### Erro de permissão
```bash
# Dar permissão aos scripts
chmod +x test-local.sh
chmod +x test-cursor-connection.sh
```

### Logs de debug
```bash
# Executar com logs detalhados
LOG_LEVEL=debug node dist/index.js
```

## 🐳 Alternativa com Docker

Se preferir usar Docker:

```bash
# Build da imagem
task docker-build

# Executar container
task docker-run
```

E usar esta configuração no Cursor:
```json
{
  "mcpServers": {
    "booking-server": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp-booking-server:latest"]
    }
  }
}
```

## 📊 Monitoramento

### Ver logs do servidor
```bash
# Logs em tempo real
tail -f logs/mcp-booking-server.log
```

### Status do servidor
```bash
# Verificar se está rodando
ps aux | grep "node dist/index.js"
```

## 🎯 Próximos Passos

1. **Testar comandos** no Cursor
2. **Personalizar configurações** conforme necessário
3. **Reportar bugs** se encontrar problemas
4. **Contribuir** com melhorias

## 📞 Suporte

- **Issues**: https://github.com/brunovlucena/mcp-booking-server/issues
- **Discussions**: https://github.com/brunovlucena/mcp-booking-server/discussions

---

**Desenvolvido por [Bruno Lucena](https://github.com/brunovlucena)** 🚀
