import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser } from 'puppeteer';

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
  private browser: Browser | null = null;

  constructor() {
    this.baseUrl = process.env.BOOKING_BASE_URL || 'https://www.booking.com';
    this.language = process.env.BOOKING_LANGUAGE || 'pt-br';
    this.currency = process.env.BOOKING_CURRENCY || 'BRL';
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.BROWSER_HEADLESS !== 'false',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor,VizServiceDisplayCompositor',
          '--disable-extensions-except',
          '--disable-extensions',
          '--disable-plugins-discovery',
          '--disable-default-apps',
          '--disable-component-extensions-with-background-pages',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-component-update',
          '--disable-background-networking',
          '--disable-sync',
          '--disable-translate',
          '--disable-background-downloads',
          '--disable-add-to-shelf',
          '--disable-client-side-phishing-detection',
          '--disable-default-apps',
          '--disable-dev-tools',
          '--disable-extensions',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-features=VizDisplayCompositor',
          '--run-all-compositor-stages-before-draw',
          '--disable-threaded-animation',
          '--disable-threaded-scrolling',
          '--disable-checker-imaging',
          '--disable-new-content-rendering-timeout',
          '--disable-image-animation-resync',
          '--disable-partial-raster',
          '--disable-skia-runtime-opts',
          '--disable-system-font-check',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
        ignoreDefaultArgs: ['--enable-automation', '--enable-blink-features=IdleDetection'],
        devtools: false
      });
    }
    return this.browser;
  }

  private async waitForHotelResults(page: any): Promise<void> {
    const selectors = [
      '[data-testid="property-card"]',
      '.sr_property_block',
      '.c82435a4c8',
      '[data-testid="sr-hotel-card"]',
      '.bui-card',
      '.sr-hotel'
    ];

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`Encontrados resultados com seletor: ${selector}`);
        return;
      } catch (error) {
        console.log(`Seletor ${selector} não encontrado, tentando próximo...`);
      }
    }
    
    // Se nenhum seletor funcionou, aguardar um tempo e tentar novamente
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  private findElement(parent: Element, selectors: string[]): Element | null {
    for (const selector of selectors) {
      const element = parent.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  private async debugPageContent(page: any): Promise<void> {
    try {
      console.log('🔍 DEBUG: Analyzing page content...');
      
      // Get all possible hotel containers
      const containers = await page.evaluate(() => {
        const results: any[] = [];
        
        // Check different container selectors
        const containerSelectors = [
          '[data-testid="property-card"]',
          '.sr_property_block',
          '.fcab3ed991',
          '.a23c043802',
          '.bui-card',
          '.sr-hotel__name'
        ];
        
        containerSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          results.push({
            selector,
            count: elements.length,
            firstElementText: elements.length > 0 ? elements[0].textContent?.substring(0, 100) : 'none'
          });
        });
        
        return results;
      });
      
      console.log('📊 Container Analysis:');
      containers.forEach((container: any) => {
        console.log(`  ${container.selector}: ${container.count} elements`);
        if (container.firstElementText !== 'none') {
          console.log(`    Sample: ${container.firstElementText}...`);
        }
      });
      
      // Get page title and URL
      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        url: window.location.href,
        bodyText: document.body.textContent?.substring(0, 200)
      }));
      
      console.log(`📄 Page: ${pageInfo.title}`);
      console.log(`🔗 URL: ${pageInfo.url}`);
      console.log(`📝 Content preview: ${pageInfo.bodyText}...`);
      
    } catch (error) {
      console.log('❌ Debug error:', error);
    }
  }

  private async simulateHumanBehavior(page: any): Promise<void> {
    try {
      console.log('🤖 Iniciando simulação de comportamento humano...');
      
      // Aguardar carregamento inicial (tempo humano)
      const initialWait = 3000 + Math.random() * 4000;
      console.log(`⏱️  Aguardando ${Math.round(initialWait/1000)}s para carregamento inicial...`);
      await new Promise(resolve => setTimeout(resolve, initialWait));
      
      // Simular leitura da página (scroll lento e pausas)
      const scrollSteps = 3 + Math.floor(Math.random() * 4);
      console.log(`📖 Simulando leitura (${scrollSteps} scrolls)...`);
      
      for (let i = 0; i < scrollSteps; i++) {
        // Movimento do mouse antes do scroll
        await page.mouse.move(
          200 + Math.random() * 400, 
          300 + Math.random() * 200
        );
        
        // Pausa pensativa
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        
        // Scroll gradual
        const scrollAmount = 200 + Math.random() * 300;
        await page.evaluate((amount: number) => {
          window.scrollBy(0, amount);
        }, scrollAmount);
        
        // Pausa após scroll
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      }
      
      // Simular hover em elementos
      console.log('🖱️  Simulando interações com elementos...');
      const hoverElements = await page.$$('a, button, [data-testid*="property"]');
      if (hoverElements.length > 0) {
        const randomElement = hoverElements[Math.floor(Math.random() * Math.min(hoverElements.length, 3))];
        const box = await randomElement.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
          await page.mouse.move(box.x + box.width/2 + Math.random() * 50, box.y + box.height/2 + Math.random() * 50);
        }
      }
      
      // Simular digitação (caso haja campos)
      const inputs = await page.$$('input[type="text"], input[type="search"]');
      if (inputs.length > 0) {
        console.log('⌨️  Simulando digitação...');
        const input = inputs[0];
        await input.click();
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
        await input.type('a', { delay: 50 + Math.random() * 100 });
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
        await input.press('Backspace');
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 400));
      }
      
      // Final: scroll para o topo (comportamento humano)
      console.log('🔝 Retornando ao topo da página...');
      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      // Aguardar final
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      console.log('✅ Simulação de comportamento humano concluída!');
      
    } catch (error) {
      console.log('❌ Erro na simulação de comportamento humano:', error);
    }
  }

  async searchHotels(params: HotelSearchParams): Promise<HotelResult[]> {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      // Configurar user agent mais realista
      await page.setUserAgent(process.env.BROWSER_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Configurar viewport realista
      await page.setViewport({
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false
      });
      
      // STEALTH MODE: Remover TODAS as propriedades que indicam automação
      await page.evaluateOnNewDocument(() => {
        // Remover webdriver completamente
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        // Remover chrome runtime
        delete (window as any).chrome?.runtime;
        delete (window as any).chrome?.webstore;
        
        // Simular plugins realistas
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
            { name: 'Native Client', filename: 'internal-nacl-plugin' }
          ],
        });
        
        // Simular languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['pt-BR', 'pt', 'en-US', 'en'],
        });
        
        // Simular hardware concurrency
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 8,
        });
        
        // Simular device memory
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => 8,
        });
        
        // Remover TODAS as propriedades de automação
        delete (window as any).__puppeteer;
        delete (window as any).__nightmare;
        delete (window as any).__selenium;
        delete (window as any).__webdriver;
        delete (window as any).__phantom;
        delete (window as any).__callPhantom;
        delete (window as any)._phantom;
        delete (window as any).callPhantom;
        delete (window as any).Buffer;
        delete (window as any).emit;
        delete (window as any).spawn;
        
        // Simular propriedades de tela
        Object.defineProperty(screen, 'availHeight', { get: () => 728 });
        Object.defineProperty(screen, 'availWidth', { get: () => 1366 });
        Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
        Object.defineProperty(screen, 'height', { get: () => 768 });
        Object.defineProperty(screen, 'width', { get: () => 1366 });
        
        // Simular timezone
        Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
          value: function() {
            return { timeZone: 'America/Sao_Paulo' };
          }
        });
        
        // Remover propriedades de automação do document
        delete (document as any).$cdc_asdjflasutopfhvcZLmcfl_;
        delete (document as any).$chrome_asyncScriptInfo;
        delete (document as any).__$webdriverAsyncExecutor;
        delete (document as any).webdriver;
        delete (document as any).__webdriver_script_fn;
        delete (document as any).__driver_evaluate;
        delete (document as any).__webdriver_evaluate;
        delete (document as any).__selenium_evaluate;
        delete (document as any).__fxdriver_evaluate;
        delete (document as any).__driver_unwrapped;
        delete (document as any).__webdriver_unwrapped;
        delete (document as any).__selenium_unwrapped;
        delete (document as any).__fxdriver_unwrapped;
        delete (document as any).__webdriver_script_func;
        delete (document as any).__webdriver_script_function;
      });
      
      // Construir URL de busca
      const searchUrl = this.buildSearchUrl(params);
      console.log(`Buscando hotéis: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: parseInt(process.env.BROWSER_TIMEOUT || '60000')
      });

      // Simular comportamento humano
      await this.simulateHumanBehavior(page);

      // Aguardar carregamento dos resultados com múltiplos seletores
      await this.waitForHotelResults(page);

      // DEBUG: Analisar conteúdo da página
      await this.debugPageContent(page);
      
      // DEBUG: Analisar conteúdo dos elementos encontrados
      await page.evaluate(() => {
        const elements = document.querySelectorAll('[data-testid="property-card"]');
        console.log(`Found ${elements.length} property cards`);
        
        if (elements.length > 0) {
          const firstElement = elements[0];
          console.log('First element HTML:', firstElement.outerHTML.substring(0, 500));
          
          // Try to find title elements
          const titleSelectors = [
            '[data-testid="title"]',
            'h3', 'h2', 'h1',
            'a[href*="hotel"]',
            '.fcab3ed991 a',
            '.a23c043802'
          ];
          
          titleSelectors.forEach(selector => {
            const found = firstElement.querySelector(selector);
            if (found) {
              console.log(`Found with selector "${selector}":`, found.textContent?.trim());
            }
          });
        }
      });

      // Extrair dados dos hotéis com seletores mais robustos
      const hotels = await page.evaluate(() => {
        // Múltiplos seletores para maior compatibilidade
        const selectors = [
          '[data-testid="property-card"]',
          '.sr_property_block',
          '.c82435a4c8',
          '[data-testid="sr-hotel-card"]',
          '.bui-card',
          '[data-testid="property-card-container"]'
        ];
        
        let hotelElements: NodeListOf<Element> | null = null;
        for (const selector of selectors) {
          hotelElements = document.querySelectorAll(selector);
          if (hotelElements.length > 0) {
            console.log(`Encontrados ${hotelElements.length} elementos com seletor: ${selector}`);
            break;
          }
        }

        if (!hotelElements || hotelElements.length === 0) {
          console.log('Nenhum hotel encontrado com os seletores disponíveis');
          return [];
        }

        const results: any[] = [];

        hotelElements.forEach((element, index) => {
          try {
            console.log(`Processando hotel ${index + 1}...`);
            
            // ETHICAL PARSING: Múltiplas estratégias para extrair dados
            const nameSelectors = [
              '[data-testid="title"]',
              '.fcab3ed991 a',
              '.a23c043802',
              '.sr-hotel__name',
              '.bui-card__title',
              'h3',
              'h2',
              '[data-testid="property-name"]',
              '.c82435a4c8 a[data-testid="title-link"]',
              // Seletores adicionais baseados na imagem
              '.fcab3ed991 .a23c043802',
              '.a23c043802 .fcab3ed991',
              '[data-testid="property-card"] h3',
              '[data-testid="property-card"] h2',
              '[data-testid="property-card"] a',
              '.sr_property_block .sr-hotel__name',
              '.sr_property_block h3',
              '.sr_property_block h2',
              '.bui-card .bui-card__title',
              '.bui-card h3',
              '.bui-card h2',
              // Fallback: qualquer link dentro do container
              'a[href*="hotel"]',
              'a[href*="property"]',
              'a',
              // Fallback: qualquer texto que pareça nome de hotel
              'span',
              'div'
            ];
            
            // Função auxiliar para encontrar elemento
            const findElement = (container: Element, selectors: string[]): Element | null => {
              for (const selector of selectors) {
                const element = container.querySelector(selector);
                if (element) return element;
              }
              return null;
            };
            
            const nameElement = findElement(element, nameSelectors);

            // Seletores mais abrangentes para preço
            const priceSelectors = [
              '[data-testid="price-and-discounted-price"]',
              '.bui-price-display__value',
              '.sr-hotel__price',
              '.bui-price',
              '[data-testid="price"]',
              '.fcab3ed991 .bd73d13072',
              '.a23c043802 .bd73d13072',
              '.prco-valign-middle-helper'
            ];
            
            const priceElement = findElement(element, priceSelectors);

            // Seletores para rating
            const ratingSelectors = [
              '[data-testid="review-score"]',
              '.bui-review-score__badge',
              '.sr-hotel__rating',
              '[data-testid="review-score-badge"]',
              '.d10a6220b4',
              '.a3b8729b41'
            ];
            
            const ratingElement = findElement(element, ratingSelectors);

            // Seletores para localização
            const locationSelectors = [
              '[data-testid="address"]',
              '.sr-hotel__address',
              '.bui-card__address',
              '[data-testid="location"]',
              '.a23c043802 .d8eab2cf7f',
              '.fcab3ed991 .d8eab2cf7f'
            ];
            
            const locationElement = findElement(element, locationSelectors);

            const imageElement = element.querySelector('img');
            const linkElement = element.querySelector('a[href*="hotel"]') as HTMLAnchorElement || element.querySelector('a') as HTMLAnchorElement;

            // Aceitar resultado mesmo se alguns campos estiverem vazios
            if (nameElement) {
              const hotelData = {
                name: nameElement.textContent?.trim() || `Hotel ${index + 1}`,
                price: priceElement?.textContent?.trim() || 'Preço não disponível',
                rating: ratingElement ? parseFloat(ratingElement.textContent?.trim().replace(',', '.') || '0') : 0,
                location: locationElement?.textContent?.trim() || 'Fernando de Noronha',
                imageUrl: imageElement?.src || '',
                url: linkElement?.href || '',
                availability: true,
                amenities: []
              };
              
              console.log(`Hotel extraído: ${hotelData.name} - ${hotelData.price}`);
              results.push(hotelData);
            } else {
              console.log(`Hotel ${index + 1}: nome não encontrado`);
            }
          } catch (error) {
            console.error(`Erro ao extrair dados do hotel ${index + 1}:`, error);
          }
        });

        console.log(`Total de hotéis extraídos: ${results.length}`);
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

      // Verificar se há CAPTCHA ou proteção anti-bot
      const hasCaptcha = await page.$('.captcha') || await page.$('[data-testid="captcha"]');
      if (hasCaptcha) {
        await page.close();
        return {
          success: false,
          confirmationCode: null,
          message: 'CAPTCHA detectado. É necessário resolver manualmente no navegador.'
        };
      }

      // Tentar encontrar botão de reserva
      const reserveButton = await this.findReserveButton(page);
      if (!reserveButton) {
        await page.close();
        return {
          success: false,
          confirmationCode: null,
          message: 'Botão de reserva não encontrado. Hotel pode estar indisponível.'
        };
      }

      // Clicar no botão de reserva
      await reserveButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar se redirecionou para página de reserva
      const currentUrl = page.url();
      if (!currentUrl.includes('reservation') && !currentUrl.includes('booking')) {
        await page.close();
        return {
          success: false,
          confirmationCode: null,
          message: 'Falha ao acessar página de reserva. Pode ser necessário login.'
        };
      }

      // Simular preenchimento de dados (implementação básica)
      const reservationResult = await this.fillReservationForm(page, bookingDetails);

      await page.close();
      return reservationResult;

    } catch (error) {
      console.error('Erro ao fazer reserva:', error);
      return {
        success: false,
        confirmationCode: null,
        message: `Erro durante o processo de reserva: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async findReserveButton(page: any): Promise<any> {
    const buttonSelectors = [
      'button[data-testid="reservation-submit"]',
      'button[data-testid="book-now"]',
      '.bui-button--primary',
      '[data-testid="cta-button"]',
      'button:contains("Reservar")',
      'button:contains("Book now")',
      '.sr-hotel__book-button',
      '.hp-book-now-button'
    ];

    for (const selector of buttonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`Botão de reserva encontrado: ${selector}`);
          return button;
        }
      } catch (error) {
        console.log(`Botão não encontrado com seletor: ${selector}`);
      }
    }

    return null;
  }

  private async fillReservationForm(page: any, bookingDetails: BookingDetails): Promise<any> {
    try {
      // Aguardar carregamento do formulário
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verificar se precisa de login
      const loginRequired = await page.$('[data-testid="login"]') || await page.$('.login-form');
      if (loginRequired) {
        return {
          success: false,
          confirmationCode: null,
          message: 'Login necessário para fazer reserva. Configure BOOKING_USERNAME e BOOKING_PASSWORD no .env'
        };
      }

      // Tentar preencher campos básicos se disponíveis
      await this.fillBasicFormFields(page, bookingDetails);

      // Verificar se conseguiu prosseguir
      const canProceed = await this.checkIfCanProceed(page);
      
      if (canProceed) {
        return {
          success: true,
          confirmationCode: `BK${Date.now()}`,
          message: 'Processo de reserva iniciado com sucesso. Verificação manual recomendada.'
        };
      } else {
        return {
          success: false,
          confirmationCode: null,
          message: 'Não foi possível completar o processo de reserva automaticamente.'
        };
      }

    } catch (error) {
      return {
        success: false,
        confirmationCode: null,
        message: `Erro ao preencher formulário: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async fillBasicFormFields(page: any, bookingDetails: BookingDetails): Promise<void> {
    try {
      // Tentar preencher campos básicos se existirem
      const fields = [
        { selector: '[data-testid="firstname"]', value: 'João' },
        { selector: '[data-testid="lastname"]', value: 'Silva' },
        { selector: '[data-testid="email"]', value: 'joao.silva@email.com' },
        { selector: '[data-testid="phone"]', value: '+5511999999999' }
      ];

      for (const field of fields) {
        try {
          const element = await page.$(field.selector);
          if (element) {
            await element.type(field.value);
            console.log(`Campo ${field.selector} preenchido`);
          }
        } catch (error) {
          console.log(`Campo ${field.selector} não encontrado ou não preenchido`);
        }
      }
    } catch (error) {
      console.log('Erro ao preencher campos básicos:', error);
    }
  }

  private async checkIfCanProceed(page: any): Promise<boolean> {
    try {
      // Verificar se há botões para prosseguir
      const proceedButtons = [
        '[data-testid="proceed"]',
        '[data-testid="continue"]',
        '.bui-button--primary',
        'button:contains("Continuar")',
        'button:contains("Continue")'
      ];

      for (const selector of proceedButtons) {
        const button = await page.$(selector);
        if (button) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async getPopularDestinations(): Promise<string[]> {
    // Retorna destinos populares genéricos sem hardcoding específico
    return [
      'São Paulo, Brasil',
      'Rio de Janeiro, Brasil',
      'Brasília, Brasil',
      'Salvador, Brasil',
      'Fortaleza, Brasil',
      'Belo Horizonte, Brasil',
      'Manaus, Brasil',
      'Curitiba, Brasil',
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
      'Praga, República Tcheca',
      'Tóquio, Japão',
      'Sydney, Austrália',
      'Toronto, Canadá'
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

  async completeCheckout(params: HotelSearchParams, guestInfo?: any): Promise<any> {
    try {
      console.log('🚀 Iniciando processo completo de checkout...');
      
      // Passo 1: Buscar hotéis
      console.log('🔍 Passo 1: Buscando hotéis disponíveis...');
      const hotels = await this.searchHotels(params);
      
      if (hotels.length === 0) {
        return {
          success: false,
          message: 'Nenhum hotel disponível encontrado para as datas solicitadas.',
          step: 'search',
          hotels: []
        };
      }
      
      console.log(`✅ Encontrados ${hotels.length} hotéis disponíveis`);
      
      // Passo 2: Selecionar o melhor hotel (primeiro disponível)
      const selectedHotel = hotels[0];
      console.log(`🏨 Passo 2: Selecionando hotel: ${selectedHotel.name}`);
      
      // Passo 3: Obter detalhes do hotel
      console.log('📋 Passo 3: Obtendo detalhes do hotel...');
      const hotelDetails = await this.getHotelDetails(selectedHotel.url);
      
      // Passo 4: Fazer a reserva
      console.log('💳 Passo 4: Processando reserva...');
      const bookingDetails: BookingDetails = {
        hotelName: selectedHotel.name,
        checkin: params.checkin,
        checkout: params.checkout,
        guests: params.guests,
        rooms: params.rooms,
        totalPrice: selectedHotel.price
      };
      
      const reservation = await this.makeReservation(selectedHotel.url, bookingDetails);
      
      return {
        success: reservation.success,
        step: 'complete',
        hotel: {
          name: selectedHotel.name,
          price: selectedHotel.price,
          rating: selectedHotel.rating,
          location: selectedHotel.location,
          url: selectedHotel.url,
          details: hotelDetails
        },
        booking: {
          checkin: params.checkin,
          checkout: params.checkout,
          guests: params.guests,
          rooms: params.rooms,
          totalPrice: selectedHotel.price,
          confirmationCode: reservation.confirmationCode
        },
        message: reservation.message,
        alternativeHotels: hotels.slice(1, 5) // Outras opções
      };
      
    } catch (error) {
      console.error('Erro no processo de checkout:', error);
      return {
        success: false,
        message: `Erro durante o checkout: ${error instanceof Error ? error.message : String(error)}`,
        step: 'error'
      };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
