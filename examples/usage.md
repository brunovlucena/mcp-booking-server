# Exemplos de Uso do MCP Booking Server

## 🏨 Busca Básica de Hotéis

### Exemplo 1: Buscar hotéis em São Paulo
```json
{
  "tool": "search_hotels",
  "parameters": {
    "destination": "São Paulo, Brasil",
    "checkin": "2024-12-25",
    "checkout": "2024-12-30",
    "guests": 2,
    "rooms": 1
  }
}
```

### Exemplo 2: Buscar hotéis com crianças
```json
{
  "tool": "search_hotels",
  "parameters": {
    "destination": "Rio de Janeiro, Brasil",
    "checkin": "2024-12-25",
    "checkout": "2024-12-30",
    "guests": 2,
    "rooms": 1,
    "children": 1,
    "childrenAges": [8]
  }
}
```

## 💰 Busca por Faixa de Preço

### Exemplo 3: Hotéis entre R$ 200-500 por noite
```json
{
  "tool": "search_hotels_by_price_range",
  "parameters": {
    "destination": "Brasília, Brasil",
    "checkin": "2024-12-25",
    "checkout": "2024-12-30",
    "minPrice": 200,
    "maxPrice": 500,
    "guests": 2,
    "rooms": 1
  }
}
```

## ⭐ Busca por Classificação

### Exemplo 4: Hotéis com 8+ estrelas
```json
{
  "tool": "search_hotels_by_rating",
  "parameters": {
    "destination": "Paris, França",
    "checkin": "2024-12-25",
    "checkout": "2024-12-30",
    "minRating": 8,
    "guests": 2,
    "rooms": 1
  }
}
```

## 🏨 Detalhes de Hotel

### Exemplo 5: Obter detalhes de um hotel específico
```json
{
  "tool": "get_hotel_details",
  "parameters": {
    "hotelUrl": "https://www.booking.com/hotel/br/example-hotel.html"
  }
}
```

## 📋 Destinos e Ofertas

### Exemplo 6: Listar destinos populares
```json
{
  "tool": "get_popular_destinations",
  "parameters": {}
}
```

### Exemplo 7: Ver ofertas atuais
```json
{
  "tool": "get_current_offers",
  "parameters": {}
}
```

## 🎯 Reserva (Simulação)

### Exemplo 8: Fazer uma reserva
```json
{
  "tool": "make_reservation",
  "parameters": {
    "hotelUrl": "https://www.booking.com/hotel/br/example-hotel.html",
    "hotelName": "Hotel Exemplo",
    "checkin": "2024-12-25",
    "checkout": "2024-12-30",
    "guests": 2,
    "rooms": 1,
    "totalPrice": "R$ 1.200,00"
  }
}
```

## 🔄 Fluxo Completo de Uso

### 1. Buscar hotéis
```bash
# Primeiro, busque hotéis no destino desejado
mcp call search_hotels --destination "São Paulo, Brasil" --checkin "2024-12-25" --checkout "2024-12-30"
```

### 2. Obter detalhes de um hotel específico
```bash
# Use a URL retornada na busca anterior
mcp call get_hotel_details --hotelUrl "https://www.booking.com/hotel/br/hotel-exemplo.html"
```

### 3. Fazer reserva (simulação)
```bash
# Simule uma reserva
mcp call make_reservation --hotelUrl "https://www.booking.com/hotel/br/hotel-exemplo.html" --hotelName "Hotel Exemplo" --checkin "2024-12-25" --checkout "2024-12-30" --guests 2 --rooms 1 --totalPrice "R$ 1.200,00"
```

## 🎨 Casos de Uso Avançados

### Viagem de Negócios
```json
{
  "tool": "search_hotels_by_rating",
  "parameters": {
    "destination": "São Paulo, Brasil",
    "checkin": "2024-12-25",
    "checkout": "2024-12-27",
    "minRating": 7,
    "guests": 1,
    "rooms": 1
  }
}
```

### Viagem em Família
```json
{
  "tool": "search_hotels",
  "parameters": {
    "destination": "Disney World, Orlando",
    "checkin": "2024-12-25",
    "checkout": "2024-12-30",
    "guests": 4,
    "rooms": 2,
    "children": 2,
    "childrenAges": [8, 12]
  }
}
```

### Viagem Romântica
```json
{
  "tool": "search_hotels_by_price_range",
  "parameters": {
    "destination": "Paris, França",
    "checkin": "2024-12-25",
    "checkout": "2024-12-30",
    "minPrice": 300,
    "maxPrice": 800,
    "guests": 2,
    "rooms": 1
  }
}
```

## 📊 Monitoramento e Logs

O servidor gera logs detalhados para monitoramento:

```bash
# Iniciar com logs detalhados
LOG_LEVEL=debug npm run dev
```

## 🚨 Tratamento de Erros

O sistema trata automaticamente:
- Timeouts de rede
- Sites indisponíveis
- Dados malformados
- Rate limiting

## 🔧 Configurações Avançadas

### Personalizar User Agent
```env
BROWSER_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
```

### Configurar Timeout
```env
BROWSER_TIMEOUT=60000
```

### Rate Limiting
```env
RATE_LIMIT_REQUESTS=5
RATE_LIMIT_WINDOW=60000
```
