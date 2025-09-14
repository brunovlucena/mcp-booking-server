#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { BookingService, HotelSearchParams, BookingDetails } from './services/bookingService.js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

class BookingMCPServer {
  private server: Server;
  private bookingService: BookingService;

  constructor() {
    this.server = new Server(
      {
        name: process.env.MCP_SERVER_NAME || 'booking-server',
        version: process.env.MCP_SERVER_VERSION || '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.bookingService = new BookingService();
    this.setupHandlers();
  }

  private setupHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_hotels',
            description: 'Buscar hotéis em um destino específico com datas de check-in e check-out',
            inputSchema: {
              type: 'object',
              properties: {
                destination: {
                  type: 'string',
                  description: 'Destino da viagem (ex: São Paulo, Rio de Janeiro, Paris)',
                },
                checkin: {
                  type: 'string',
                  description: 'Data de check-in no formato YYYY-MM-DD',
                },
                checkout: {
                  type: 'string',
                  description: 'Data de check-out no formato YYYY-MM-DD',
                },
                guests: {
                  type: 'number',
                  description: 'Número de hóspedes',
                  default: 2,
                },
                rooms: {
                  type: 'number',
                  description: 'Número de quartos',
                  default: 1,
                },
                children: {
                  type: 'number',
                  description: 'Número de crianças',
                  default: 0,
                },
                childrenAges: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Idades das crianças',
                },
              },
              required: ['destination', 'checkin', 'checkout'],
            },
          },
          {
            name: 'get_hotel_details',
            description: 'Obter detalhes completos de um hotel específico',
            inputSchema: {
              type: 'object',
              properties: {
                hotelUrl: {
                  type: 'string',
                  description: 'URL do hotel no Booking.com',
                },
              },
              required: ['hotelUrl'],
            },
          },
          {
            name: 'make_reservation',
            description: 'Fazer uma reserva em um hotel (simulação)',
            inputSchema: {
              type: 'object',
              properties: {
                hotelUrl: {
                  type: 'string',
                  description: 'URL do hotel no Booking.com',
                },
                hotelName: {
                  type: 'string',
                  description: 'Nome do hotel',
                },
                checkin: {
                  type: 'string',
                  description: 'Data de check-in no formato YYYY-MM-DD',
                },
                checkout: {
                  type: 'string',
                  description: 'Data de check-out no formato YYYY-MM-DD',
                },
                guests: {
                  type: 'number',
                  description: 'Número de hóspedes',
                },
                rooms: {
                  type: 'number',
                  description: 'Número de quartos',
                },
                totalPrice: {
                  type: 'string',
                  description: 'Preço total da reserva',
                },
              },
              required: ['hotelUrl', 'hotelName', 'checkin', 'checkout', 'guests', 'rooms', 'totalPrice'],
            },
          },
          {
            name: 'get_popular_destinations',
            description: 'Obter lista de destinos populares',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_current_offers',
            description: 'Obter ofertas atuais e promoções',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'search_hotels_by_price_range',
            description: 'Buscar hotéis dentro de uma faixa de preço específica',
            inputSchema: {
              type: 'object',
              properties: {
                destination: {
                  type: 'string',
                  description: 'Destino da viagem',
                },
                checkin: {
                  type: 'string',
                  description: 'Data de check-in no formato YYYY-MM-DD',
                },
                checkout: {
                  type: 'string',
                  description: 'Data de check-out no formato YYYY-MM-DD',
                },
                minPrice: {
                  type: 'number',
                  description: 'Preço mínimo por noite',
                },
                maxPrice: {
                  type: 'number',
                  description: 'Preço máximo por noite',
                },
                guests: {
                  type: 'number',
                  description: 'Número de hóspedes',
                  default: 2,
                },
                rooms: {
                  type: 'number',
                  description: 'Número de quartos',
                  default: 1,
                },
              },
              required: ['destination', 'checkin', 'checkout', 'minPrice', 'maxPrice'],
            },
          },
          {
            name: 'search_hotels_by_rating',
            description: 'Buscar hotéis com classificação mínima',
            inputSchema: {
              type: 'object',
              properties: {
                destination: {
                  type: 'string',
                  description: 'Destino da viagem',
                },
                checkin: {
                  type: 'string',
                  description: 'Data de check-in no formato YYYY-MM-DD',
                },
                checkout: {
                  type: 'string',
                  description: 'Data de check-out no formato YYYY-MM-DD',
                },
                minRating: {
                  type: 'number',
                  description: 'Classificação mínima (1-10)',
                  minimum: 1,
                  maximum: 10,
                },
                guests: {
                  type: 'number',
                  description: 'Número de hóspedes',
                  default: 2,
                },
                rooms: {
                  type: 'number',
                  description: 'Número de quartos',
                  default: 1,
                },
              },
              required: ['destination', 'checkin', 'checkout', 'minRating'],
            },
          },
          {
            name: 'complete_checkout',
            description: 'Processo completo de checkout: busca hotéis, seleciona o melhor e faz a reserva automaticamente',
            inputSchema: {
              type: 'object',
              properties: {
                destination: {
                  type: 'string',
                  description: 'Destino da viagem (ex: Fernando de Noronha, São Paulo)',
                },
                checkin: {
                  type: 'string',
                  description: 'Data de check-in no formato YYYY-MM-DD',
                },
                checkout: {
                  type: 'string',
                  description: 'Data de check-out no formato YYYY-MM-DD',
                },
                guests: {
                  type: 'number',
                  description: 'Número de hóspedes',
                  default: 1,
                },
                rooms: {
                  type: 'number',
                  description: 'Número de quartos',
                  default: 1,
                },
                children: {
                  type: 'number',
                  description: 'Número de crianças',
                  default: 0,
                },
                childrenAges: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Idades das crianças',
                },
              },
              required: ['destination', 'checkin', 'checkout'],
            },
          },
        ],
      };
    });

    // Executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Type guard para verificar se args existe
      if (!args) {
        throw new Error('Argumentos não fornecidos');
      }

      try {
        switch (name) {
          case 'search_hotels':
            const searchParams: HotelSearchParams = {
              destination: String(args.destination),
              checkin: String(args.checkin),
              checkout: String(args.checkout),
              guests: Number(args.guests) || 2,
              rooms: Number(args.rooms) || 1,
              children: Number(args.children) || 0,
              childrenAges: Array.isArray(args.childrenAges) ? args.childrenAges.map(Number) : []
            };
            const hotels = await this.bookingService.searchHotels(searchParams);
            return {
              content: [
                {
                  type: 'text',
                  text: `Encontrados ${hotels.length} hotéis em ${String(args.destination)}:\n\n` +
                        hotels.map((hotel, index) => 
                          `${index + 1}. ${hotel.name}\n` +
                          `   Preço: ${hotel.price}\n` +
                          `   Classificação: ${hotel.rating}/10\n` +
                          `   Localização: ${hotel.location}\n` +
                          `   URL: ${hotel.url}\n`
                        ).join('\n')
                }
              ]
            };

          case 'get_hotel_details':
            const details = await this.bookingService.getHotelDetails(String(args.hotelUrl));
            return {
              content: [
                {
                  type: 'text',
                  text: `Detalhes do Hotel:\n\n` +
                        `Nome: ${details.name}\n` +
                        `Classificação: ${details.rating}/10\n` +
                        `Endereço: ${details.address}\n` +
                        `Descrição: ${details.description}\n` +
                        `Comodidades: ${details.amenities.join(', ')}\n`
                }
              ]
            };

          case 'make_reservation':
            const bookingDetails: BookingDetails = {
              hotelName: String(args.hotelName),
              checkin: String(args.checkin),
              checkout: String(args.checkout),
              guests: Number(args.guests),
              rooms: Number(args.rooms),
              totalPrice: String(args.totalPrice)
            };
            const reservation = await this.bookingService.makeReservation(String(args.hotelUrl), bookingDetails);
            return {
              content: [
                {
                  type: 'text',
                  text: `Reserva ${reservation.success ? 'realizada' : 'falhou'}!\n\n` +
                        `Hotel: ${String(args.hotelName)}\n` +
                        `Check-in: ${String(args.checkin)}\n` +
                        `Check-out: ${String(args.checkout)}\n` +
                        `Hóspedes: ${Number(args.guests)}\n` +
                        `Quartos: ${Number(args.rooms)}\n` +
                        `Preço Total: ${String(args.totalPrice)}\n` +
                        `Código de Confirmação: ${reservation.confirmationCode}\n` +
                        `Mensagem: ${reservation.message}\n`
                }
              ]
            };

          case 'get_popular_destinations':
            const destinations = await this.bookingService.getPopularDestinations();
            return {
              content: [
                {
                  type: 'text',
                  text: `Destinos Populares:\n\n` +
                        destinations.map((dest, index) => `${index + 1}. ${dest}`).join('\n')
                }
              ]
            };

          case 'get_current_offers':
            const offers = await this.bookingService.getCurrentOffers();
            return {
              content: [
                {
                  type: 'text',
                  text: `Ofertas Atuais:\n\n` +
                        offers.map((offer, index) => 
                          `${index + 1}. ${offer.destination}\n` +
                          `   Desconto: ${offer.discount}\n` +
                          `   Válido até: ${offer.validUntil}\n` +
                          `   Descrição: ${offer.description}\n`
                        ).join('\n')
                }
              ]
            };

          case 'search_hotels_by_price_range':
            const priceSearchParams: HotelSearchParams = {
              destination: String(args.destination),
              checkin: String(args.checkin),
              checkout: String(args.checkout),
              guests: Number(args.guests) || 2,
              rooms: Number(args.rooms) || 1
            };
            const priceHotels = await this.bookingService.searchHotels(priceSearchParams);
            const filteredByPrice = priceHotels.filter(hotel => {
              const price = parseFloat(hotel.price.replace(/[^\d,]/g, '').replace(',', '.'));
              return price >= Number(args.minPrice) && price <= Number(args.maxPrice);
            });
            return {
              content: [
                {
                  type: 'text',
                  text: `Hotéis na faixa de preço R$ ${Number(args.minPrice)} - R$ ${Number(args.maxPrice)}:\n\n` +
                        filteredByPrice.map((hotel, index) => 
                          `${index + 1}. ${hotel.name}\n` +
                          `   Preço: ${hotel.price}\n` +
                          `   Classificação: ${hotel.rating}/10\n` +
                          `   Localização: ${hotel.location}\n`
                        ).join('\n')
                }
              ]
            };

          case 'search_hotels_by_rating':
            const ratingSearchParams: HotelSearchParams = {
              destination: String(args.destination),
              checkin: String(args.checkin),
              checkout: String(args.checkout),
              guests: Number(args.guests) || 2,
              rooms: Number(args.rooms) || 1
            };
            const ratingHotels = await this.bookingService.searchHotels(ratingSearchParams);
            const filteredByRating = ratingHotels.filter(hotel => hotel.rating >= Number(args.minRating));
            return {
              content: [
                {
                  type: 'text',
                  text: `Hotéis com classificação ${Number(args.minRating)}+ estrelas:\n\n` +
                        filteredByRating.map((hotel, index) => 
                          `${index + 1}. ${hotel.name}\n` +
                          `   Preço: ${hotel.price}\n` +
                          `   Classificação: ${hotel.rating}/10\n` +
                          `   Localização: ${hotel.location}\n`
                        ).join('\n')
                }
              ]
            };

          case 'complete_checkout':
            const checkoutParams: HotelSearchParams = {
              destination: String(args.destination),
              checkin: String(args.checkin),
              checkout: String(args.checkout),
              guests: Number(args.guests) || 1,
              rooms: Number(args.rooms) || 1,
              children: Number(args.children) || 0,
              childrenAges: Array.isArray(args.childrenAges) ? args.childrenAges.map(Number) : []
            };
            const checkoutResult = await this.bookingService.completeCheckout(checkoutParams);
            
            if (checkoutResult.success) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `🎉 CHECKOUT COMPLETO!\n\n` +
                          `✅ Reserva realizada com sucesso!\n\n` +
                          `🏨 Hotel: ${checkoutResult.hotel.name}\n` +
                          `💰 Preço Total: ${checkoutResult.booking.totalPrice}\n` +
                          `📅 Check-in: ${checkoutResult.booking.checkin}\n` +
                          `📅 Check-out: ${checkoutResult.booking.checkout}\n` +
                          `👤 Hóspedes: ${checkoutResult.booking.guests}\n` +
                          `🛏️  Quartos: ${checkoutResult.booking.rooms}\n` +
                          `🔢 Código de Confirmação: ${checkoutResult.booking.confirmationCode}\n` +
                          `📍 Localização: ${checkoutResult.hotel.location}\n` +
                          `⭐ Classificação: ${checkoutResult.hotel.rating}/10\n\n` +
                          `📧 Detalhes da reserva foram enviados por email.\n` +
                          `🔗 Link do hotel: ${checkoutResult.hotel.url}\n\n` +
                          `💡 Dicas importantes:\n` +
                          `• Confirme a reserva diretamente com o hotel\n` +
                          `• Verifique as políticas de cancelamento\n` +
                          `• Leve o código de confirmação no check-in\n`
                  }
                ]
              };
            } else {
              let message = `❌ Checkout não pôde ser completado.\n\n`;
              message += `📋 Status: ${checkoutResult.message}\n\n`;
              
              if (checkoutResult.alternativeHotels && checkoutResult.alternativeHotels.length > 0) {
                message += `🏨 Hotéis alternativos encontrados:\n\n`;
                checkoutResult.alternativeHotels.forEach((hotel: any, index: number) => {
                  message += `${index + 1}. ${hotel.name}\n`;
                  message += `   💰 Preço: ${hotel.price}\n`;
                  message += `   ⭐ Classificação: ${hotel.rating}/10\n`;
                  message += `   🔗 URL: ${hotel.url}\n\n`;
                });
              }
              
              message += `💡 Recomendações:\n`;
              message += `• Tente datas diferentes\n`;
              message += `• Entre em contato diretamente com as pousadas locais\n`;
              message += `• Use sites especializados em Fernando de Noronha\n`;
              
              return {
                content: [
                  {
                    type: 'text',
                    text: message
                  }
                ]
              };
            }

          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro ao executar ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Booking Server rodando...');
  }

  async close() {
    await this.bookingService.close();
  }
}

// Iniciar o servidor
const server = new BookingMCPServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('Encerrando servidor...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Encerrando servidor...');
  await server.close();
  process.exit(0);
});

server.run().catch(console.error);
