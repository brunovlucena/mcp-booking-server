# 🏨 MCP Booking Server - Makefile
# Facilita o desenvolvimento e uso do servidor

.PHONY: help install build start dev test clean lint format

# Cores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## 📋 Mostra esta ajuda
	@echo "$(GREEN)🏨 MCP Booking Server$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponíveis:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## 📦 Instala as dependências
	@echo "$(GREEN)📦 Instalando dependências...$(NC)"
	npm install

build: ## 🔨 Compila o projeto TypeScript
	@echo "$(GREEN)🔨 Compilando projeto...$(NC)"
	npm run build

start: build ## 🚀 Inicia o servidor (produção)
	@echo "$(GREEN)🚀 Iniciando servidor...$(NC)"
	npm start

dev: ## 🔧 Inicia o servidor em modo desenvolvimento
	@echo "$(GREEN)🔧 Iniciando em modo desenvolvimento...$(NC)"
	npm run dev

watch: ## 👀 Inicia o servidor com watch mode
	@echo "$(GREEN)👀 Iniciando com watch mode...$(NC)"
	npm run watch

test: build ## 🧪 Executa os testes do servidor
	@echo "$(GREEN)🧪 Executando testes...$(NC)"
	npm test

setup: install ## 🛠️ Configura o projeto (instala + setup inicial)
	@echo "$(GREEN)🛠️ Configurando projeto...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)📝 Criando arquivo .env...$(NC)"; \
		cp env.example .env; \
		echo "$(GREEN)✅ Arquivo .env criado! Edite com suas configurações.$(NC)"; \
	fi
	@echo "$(GREEN)✅ Projeto configurado!$(NC)"

clean: ## 🧹 Limpa arquivos compilados
	@echo "$(GREEN)🧹 Limpando arquivos compilados...$(NC)"
	rm -rf dist/
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

lint: ## 🔍 Executa o linter
	@echo "$(GREEN)🔍 Executando linter...$(NC)"
	npm run lint

format: ## 🎨 Formata o código
	@echo "$(GREEN)🎨 Formatando código...$(NC)"
	npm run format

# Comandos de desenvolvimento
dev-setup: setup build ## 🛠️ Setup completo para desenvolvimento
	@echo "$(GREEN)✅ Setup de desenvolvimento concluído!$(NC)"
	@echo "$(YELLOW)💡 Use 'make dev' para iniciar em modo desenvolvimento$(NC)"

# Comandos de produção
prod-setup: setup build ## 🚀 Setup completo para produção
	@echo "$(GREEN)✅ Setup de produção concluído!$(NC)"
	@echo "$(YELLOW)💡 Use 'make start' para iniciar em produção$(NC)"

# Comandos Docker
docker-build: ## 🐳 Build da imagem Docker
	@echo "$(GREEN)🐳 Building imagem Docker...$(NC)"
	docker build -t mcp-booking-server:latest .

docker-build-dev: ## 🐳 Build da imagem Docker de desenvolvimento
	@echo "$(GREEN)🐳 Building imagem Docker de desenvolvimento...$(NC)"
	docker build -f Dockerfile.dev -t mcp-booking-server:dev .

docker-run: docker-build ## 🐳 Executa o container Docker
	@echo "$(GREEN)🐳 Executando container Docker...$(NC)"
	docker run -p 3001:3001 --name mcp-booking-server mcp-booking-server:latest

docker-run-dev: docker-build-dev ## 🐳 Executa o container Docker em modo desenvolvimento
	@echo "$(GREEN)🐳 Executando container Docker em modo desenvolvimento...$(NC)"
	docker run -p 3001:3001 --name mcp-booking-server-dev mcp-booking-server:dev

docker-stop: ## 🐳 Para os containers Docker
	@echo "$(GREEN)🐳 Parando containers Docker...$(NC)"
	docker stop mcp-booking-server mcp-booking-server-dev || true
	docker rm mcp-booking-server mcp-booking-server-dev || true

docker-logs: ## 🐳 Mostra logs dos containers Docker
	@echo "$(GREEN)🐳 Mostrando logs...$(NC)"
	docker logs -f mcp-booking-server

docker-clean: ## 🐳 Limpa imagens e containers Docker
	@echo "$(GREEN)🐳 Limpando Docker...$(NC)"
	docker stop mcp-booking-server mcp-booking-server-dev || true
	docker rm mcp-booking-server mcp-booking-server-dev || true
	docker rmi mcp-booking-server:latest mcp-booking-server:dev || true

docker-compose-up: ## 🐳 Inicia com docker-compose
	@echo "$(GREEN)🐳 Iniciando com docker-compose...$(NC)"
	docker-compose up -d

docker-compose-down: ## 🐳 Para com docker-compose
	@echo "$(GREEN)🐳 Parando com docker-compose...$(NC)"
	docker-compose down

docker-compose-logs: ## 🐳 Mostra logs do docker-compose
	@echo "$(GREEN)🐳 Mostrando logs do docker-compose...$(NC)"
	docker-compose logs -f

# Comandos de teste
test-search: build ## 🔍 Testa busca de hotéis
	@echo "$(GREEN)🔍 Testando busca de hotéis...$(NC)"
	@echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_hotels","arguments":{"destination":"São Paulo","checkin":"2024-12-25","checkout":"2024-12-30","guests":2,"rooms":1}}}}' | node dist/index.js

test-destinations: build ## 🌍 Testa destinos populares
	@echo "$(GREEN)🌍 Testando destinos populares...$(NC)"
	@echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_popular_destinations","arguments":{}}}}' | node dist/index.js

test-offers: build ## 🎯 Testa ofertas atuais
	@echo "$(GREEN)🎯 Testando ofertas atuais...$(NC)"
	@echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_current_offers","arguments":{}}}}' | node dist/index.js

# Comandos de Cursor MCP
generate-cursor-config: ## 🎯 Gera configuração para Cursor MCP
	@echo "$(GREEN)🎯 Gerando configuração para Cursor MCP...$(NC)"
	npm run generate-cursor-config

cursor-setup: build generate-cursor-config ## 🛠️ Setup completo para Cursor MCP
	@echo "$(GREEN)✅ Setup para Cursor MCP concluído!$(NC)"
	@echo "$(YELLOW)💡 Use o arquivo cursor-mcp-config.json no Cursor$(NC)"

# Comandos de monitoramento
logs: ## 📋 Mostra logs do servidor
	@echo "$(GREEN)📋 Logs do servidor:$(NC)"
	@echo "$(YELLOW)💡 Use Ctrl+C para sair$(NC)"
	tail -f /dev/null

# Comandos de ajuda
examples: ## 📚 Mostra exemplos de uso
	@echo "$(GREEN)📚 Exemplos de uso do MCP Booking Server:$(NC)"
	@echo ""
	@echo "$(YELLOW)1. Buscar hotéis:$(NC)"
	@echo '   {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_hotels","arguments":{"destination":"São Paulo","checkin":"2024-12-25","checkout":"2024-12-30","guests":2,"rooms":1}}}}'
	@echo ""
	@echo "$(YELLOW)2. Buscar por faixa de preço:$(NC)"
	@echo '   {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_hotels_by_price_range","arguments":{"destination":"Rio de Janeiro","checkin":"2024-12-25","checkout":"2024-12-30","minPrice":200,"maxPrice":500}}}}'
	@echo ""
	@echo "$(YELLOW)3. Buscar por classificação:$(NC)"
	@echo '   {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_hotels_by_rating","arguments":{"destination":"Paris","checkin":"2024-12-25","checkout":"2024-12-30","minRating":8}}}}'
	@echo ""
	@echo "$(YELLOW)4. Destinos populares:$(NC)"
	@echo '   {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_popular_destinations","arguments":{}}}}'
	@echo ""
	@echo "$(YELLOW)5. Ofertas atuais:$(NC)"
	@echo '   {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_current_offers","arguments":{}}}}'
	@echo ""
	@echo "$(YELLOW)6. Fazer reserva (simulação):$(NC)"
	@echo '   {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"make_reservation","arguments":{"hotelUrl":"https://www.booking.com/hotel/br/example.html","hotelName":"Hotel Exemplo","checkin":"2024-12-25","checkout":"2024-12-30","guests":2,"rooms":1,"totalPrice":"R$ 1.200,00"}}}}'

# Comando padrão
.DEFAULT_GOAL := help
