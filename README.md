# MCP Booking Server 🏨✈️

Um servidor MCP (Model Context Protocol) para fazer reservas e buscar hotéis no Booking.com automaticamente.

## 🚀 Funcionalidades

- **Busca de Hotéis**: Pesquisar hotéis por destino, datas e critérios específicos
- **Detalhes de Hotéis**: Obter informações completas sobre acomodações
- **Sistema de Reservas**: Simular reservas (implementação completa requer integração com APIs)
- **Filtros Avançados**: Buscar por faixa de preço, classificação, etc.
- **Destinos Populares**: Lista de destinos mais procurados
- **Ofertas Atuais**: Promoções e descontos disponíveis

## 🛠️ Instalação

1. **Clone o repositório**:
```bash
cd /Users/brunolucena/workspace/mcp-booking-server
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Compile o projeto**:
```bash
npm run build
```

## 🎯 Uso

### Iniciar o servidor:
```bash
npm start
```

### Modo desenvolvimento:
```bash
npm run dev
```

### Modo watch (desenvolvimento):
```bash
npm run watch
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Configurações do MCP Booking Server
MCP_SERVER_NAME=booking-server
MCP_SERVER_VERSION=1.0.0

# Configurações do Booking.com
BOOKING_BASE_URL=https://www.booking.com
BOOKING_LANGUAGE=pt-br
BOOKING_CURRENCY=BRL

# Configurações do navegador (Puppeteer)
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=30000
BROWSER_USER_AGENT=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36

# Configurações de autenticação (opcional)
BOOKING_USERNAME=your_username_here
BOOKING_PASSWORD=your_password_here

# Configurações do servidor
PORT=3001
LOG_LEVEL=info

# Configurações de rate limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60000
```

## 🛠️ Ferramentas Disponíveis

### 1. `search_hotels`
Buscar hotéis em um destino específico.

**Parâmetros:**
- `destination` (obrigatório): Destino da viagem
- `checkin` (obrigatório): Data de check-in (YYYY-MM-DD)
- `checkout` (obrigatório): Data de check-out (YYYY-MM-DD)
- `guests` (opcional): Número de hóspedes (padrão: 2)
- `rooms` (opcional): Número de quartos (padrão: 1)
- `children` (opcional): Número de crianças (padrão: 0)
- `childrenAges` (opcional): Idades das crianças

**Exemplo:**
```json
{
  "destination": "São Paulo, Brasil",
  "checkin": "2024-12-25",
  "checkout": "2024-12-30",
  "guests": 2,
  "rooms": 1
}
```

### 2. `get_hotel_details`
Obter detalhes completos de um hotel.

**Parâmetros:**
- `hotelUrl` (obrigatório): URL do hotel no Booking.com

### 3. `make_reservation`
Fazer uma reserva (simulação).

**Parâmetros:**
- `hotelUrl` (obrigatório): URL do hotel
- `hotelName` (obrigatório): Nome do hotel
- `checkin` (obrigatório): Data de check-in
- `checkout` (obrigatório): Data de check-out
- `guests` (obrigatório): Número de hóspedes
- `rooms` (obrigatório): Número de quartos
- `totalPrice` (obrigatório): Preço total

### 4. `get_popular_destinations`
Obter lista de destinos populares.

### 5. `get_current_offers`
Obter ofertas atuais e promoções.

### 6. `search_hotels_by_price_range`
Buscar hotéis dentro de uma faixa de preço.

**Parâmetros:**
- `destination` (obrigatório): Destino
- `checkin` (obrigatório): Data de check-in
- `checkout` (obrigatório): Data de check-out
- `minPrice` (obrigatório): Preço mínimo
- `maxPrice` (obrigatório): Preço máximo
- `guests` (opcional): Número de hóspedes
- `rooms` (opcional): Número de quartos

### 7. `search_hotels_by_rating`
Buscar hotéis com classificação mínima.

**Parâmetros:**
- `destination` (obrigatório): Destino
- `checkin` (obrigatório): Data de check-in
- `checkout` (obrigatório): Data de check-out
- `minRating` (obrigatório): Classificação mínima (1-10)
- `guests` (opcional): Número de hóspedes
- `rooms` (opcional): Número de quartos

## 🔍 Exemplos de Uso

### Buscar hotéis em São Paulo:
```bash
# Via MCP client
mcp call search_hotels --destination "São Paulo, Brasil" --checkin "2024-12-25" --checkout "2024-12-30"
```

### Buscar hotéis por faixa de preço:
```bash
mcp call search_hotels_by_price_range --destination "Rio de Janeiro" --checkin "2024-12-25" --checkout "2024-12-30" --minPrice 200 --maxPrice 500
```

### Buscar hotéis com classificação alta:
```bash
mcp call search_hotels_by_rating --destination "Paris, França" --checkin "2024-12-25" --checkout "2024-12-30" --minRating 8
```

## ⚠️ Avisos Importantes

1. **Simulação de Reservas**: O sistema atual simula reservas. Para implementação real, seria necessário integração com APIs oficiais do Booking.com.

2. **Rate Limiting**: O sistema implementa rate limiting para evitar bloqueios.

3. **Web Scraping**: O sistema usa web scraping com Puppeteer. Respeite os termos de uso do Booking.com.

4. **Dados Sensíveis**: Nunca commite credenciais reais no código.

## 🛡️ Segurança

- Use variáveis de ambiente para credenciais
- Implemente rate limiting adequado
- Respeite os termos de uso do Booking.com
- Monitore o uso para evitar bloqueios

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido por [Bruno Lucena](https://github.com/brunovlucena)** 🚀
