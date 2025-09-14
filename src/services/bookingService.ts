import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface HotelSearchParams {
  destination: string;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;
  children?: number;
  childrenAges?: number[];
}

export interface HotelResult {
  name: string;
  price: string;
  rating: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  url: string;
  availability: boolean;
}

export interface BookingDetails {
  hotelName: string;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;
  totalPrice: string;
  confirmationCode?: string;
}

export class BookingService {
  private baseUrl: string;
  private language: string;
  private currency: string;
  private browser: puppeteer.Browser | null = null;

  constructor() {
    this.baseUrl = process.env.BOOKING_BASE_URL || 'https://www.booking.com';
    this.language = process.env.BOOKING_LANGUAGE || 'pt-br';
    this.currency = process.env.BOOKING_CURRENCY || 'BRL';
  }

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.BROWSER_HEADLESS === 'true',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async searchHotels(params: HotelSearchParams): Promise<HotelResult[]> {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      // Configurar user agent
      await page.setUserAgent(process.env.BROWSER_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // Construir URL de busca
      const searchUrl = this.buildSearchUrl(params);
      console.log(`Buscando hotéis: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000')
      });

      // Aguardar carregamento dos resultados
      await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 });

      // Extrair dados dos hotéis
      const hotels = await page.evaluate(() => {
        const hotelElements = document.querySelectorAll('[data-testid="property-card"]');
        const results: any[] = [];

        hotelElements.forEach((element) => {
          try {
            const nameElement = element.querySelector('[data-testid="title"]');
            const priceElement = element.querySelector('[data-testid="price-and-discounted-price"]');
            const ratingElement = element.querySelector('[data-testid="review-score"]');
            const locationElement = element.querySelector('[data-testid="address"]');
            const imageElement = element.querySelector('img');
            const linkElement = element.querySelector('a');

            if (nameElement && priceElement) {
              results.push({
                name: nameElement.textContent?.trim() || '',
                price: priceElement.textContent?.trim() || '',
                rating: ratingElement ? parseFloat(ratingElement.textContent?.trim() || '0') : 0,
                location: locationElement?.textContent?.trim() || '',
                imageUrl: imageElement?.src || '',
                url: linkElement?.href || '',
                availability: true,
                amenities: []
              });
            }
          } catch (error) {
            console.error('Erro ao extrair dados do hotel:', error);
          }
        });

        return results;
      });

      await page.close();
      return hotels;

    } catch (error) {
      console.error('Erro na busca de hotéis:', error);
      throw new Error(`Erro na busca de hotéis: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildSearchUrl(params: HotelSearchParams): string {
    const url = new URL('/searchresults.html', this.baseUrl);
    
    // Parâmetros de busca
    url.searchParams.set('ss', params.destination);
    url.searchParams.set('checkin', params.checkin);
    url.searchParams.set('checkout', params.checkout);
    url.searchParams.set('group_adults', params.guests.toString());
    url.searchParams.set('no_rooms', params.rooms.toString());
    
    if (params.children && params.children > 0) {
      url.searchParams.set('group_children', params.children.toString());
      if (params.childrenAges && params.childrenAges.length > 0) {
        url.searchParams.set('age', params.childrenAges.join(','));
      }
    }
    
    // Configurações de idioma e moeda
    url.searchParams.set('selected_currency', this.currency);
    url.searchParams.set('lang', this.language);
    
    return url.toString();
  }

  async getHotelDetails(hotelUrl: string): Promise<any> {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent(process.env.BROWSER_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      await page.goto(hotelUrl, { 
        waitUntil: 'networkidle2',
        timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000')
      });

      const details = await page.evaluate(() => {
        const nameElement = document.querySelector('h2[data-testid="hp-hotel-name"]');
        const descriptionElement = document.querySelector('[data-testid="property-description"]');
        const amenitiesElements = document.querySelectorAll('[data-testid="facility-highlight"]');
        const ratingElement = document.querySelector('[data-testid="review-score-badge"]');
        const addressElement = document.querySelector('[data-testid="address"]');

        return {
          name: nameElement?.textContent?.trim() || '',
          description: descriptionElement?.textContent?.trim() || '',
          rating: ratingElement ? parseFloat(ratingElement.textContent?.trim() || '0') : 0,
          address: addressElement?.textContent?.trim() || '',
          amenities: Array.from(amenitiesElements).map(el => el.textContent?.trim()).filter(Boolean)
        };
      });

      await page.close();
      return details;

    } catch (error) {
      console.error('Erro ao obter detalhes do hotel:', error);
      throw new Error(`Erro ao obter detalhes do hotel: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async makeReservation(hotelUrl: string, bookingDetails: BookingDetails): Promise<any> {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent(process.env.BROWSER_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // Navegar para a página do hotel
      await page.goto(hotelUrl, { 
        waitUntil: 'networkidle2',
        timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000')
      });

      // Simular processo de reserva (simplificado)
      // Nota: Este é um exemplo básico. O processo real seria mais complexo
      const reservationResult = await page.evaluate((details) => {
        // Aqui seria implementada a lógica de preenchimento do formulário
        // e submissão da reserva
        return {
          success: true,
          confirmationCode: `BK${Date.now()}`,
          message: 'Reserva simulada - implementação completa requer integração com APIs do Booking.com'
        };
      }, bookingDetails);

      await page.close();
      return reservationResult;

    } catch (error) {
      console.error('Erro ao fazer reserva:', error);
      throw new Error(`Erro ao fazer reserva: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPopularDestinations(): Promise<string[]> {
    return [
      'São Paulo, Brasil',
      'Rio de Janeiro, Brasil',
      'Brasília, Brasil',
      'Salvador, Brasil',
      'Fortaleza, Brasil',
      'Belo Horizonte, Brasil',
      'Manaus, Brasil',
      'Curitiba, Brasil',
      'Recife, Brasil',
      'Porto Alegre, Brasil',
      'Nova York, Estados Unidos',
      'Londres, Reino Unido',
      'Paris, França',
      'Barcelona, Espanha',
      'Roma, Itália',
      'Amsterdam, Holanda',
      'Berlim, Alemanha',
      'Madrid, Espanha',
      'Viena, Áustria',
      'Praga, República Tcheca'
    ];
  }

  async getCurrentOffers(): Promise<any[]> {
    // Simular ofertas atuais
    return [
      {
        destination: 'São Paulo, Brasil',
        discount: '20% OFF',
        validUntil: '2024-12-31',
        description: 'Hotéis em São Paulo com desconto especial'
      },
      {
        destination: 'Rio de Janeiro, Brasil',
        discount: '15% OFF',
        validUntil: '2024-12-31',
        description: 'Pacotes para o Rio de Janeiro'
      },
      {
        destination: 'Barcelona, Espanha',
        discount: '25% OFF',
        validUntil: '2024-12-31',
        description: 'Europa com desconto especial'
      }
    ];
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
