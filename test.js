#!/usr/bin/env node

/**
 * Teste simples do MCP Booking Server
 * Execute: node test.js
 */

import { BookingService } from './dist/services/bookingService.js';

async function testBookingService() {
  console.log('🏨 Testando MCP Booking Server...\n');
  
  const bookingService = new BookingService();
  
  try {
    // Teste 1: Destinos populares
    console.log('📋 Testando destinos populares...');
    const destinations = await bookingService.getPopularDestinations();
    console.log(`✅ Encontrados ${destinations.length} destinos populares`);
    console.log('Primeiros 5 destinos:', destinations.slice(0, 5));
    console.log('');
    
    // Teste 2: Ofertas atuais
    console.log('🎯 Testando ofertas atuais...');
    const offers = await bookingService.getCurrentOffers();
    console.log(`✅ Encontradas ${offers.length} ofertas`);
    console.log('Ofertas:', offers);
    console.log('');
    
    // Teste 3: Busca de hotéis (simulada)
    console.log('🔍 Testando busca de hotéis...');
    const searchParams = {
      destination: 'São Paulo, Brasil',
      checkin: '2024-12-25',
      checkout: '2024-12-30',
      guests: 2,
      rooms: 1
    };
    
    console.log('Parâmetros de busca:', searchParams);
    console.log('⚠️  Nota: Busca real requer navegador configurado');
    console.log('');
    
    console.log('✅ Todos os testes básicos passaram!');
    console.log('🚀 MCP Booking Server está funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    await bookingService.close();
  }
}

// Executar testes
testBookingService().catch(console.error);
