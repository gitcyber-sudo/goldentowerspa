import { chromium, firefox, webkit } from 'playwright';

/**
 * Debug utilities for Playwright testing
 * These utilities can be used for manual debugging and development
 */

class DebugUtils {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Initialize browser for debugging
   */
  async init(browserType = 'chromium') {
    const browserMap = {
      chromium: () => chromium.launch({ headless: false }),
      firefox: () => firefox.launch({ headless: false }),
      webkit: () => webkit.launch({ headless: false })
    };

    this.browser = await browserMap[browserType]();
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      // Enable debug mode
      bypassCSP: true,
      ignoreHTTPSErrors: true
    });
    
    this.page = await this.context.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      console.log(`[PAGE_CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
    
    // Enable network request logging
    this.page.on('request', request => {
      if (request.url().includes('localhost:5173')) {
        console.log(`[NETWORK_REQUEST] ${request.method()} ${request.url()}`);
      }
    });
    
    this.page.on('response', response => {
      if (response.url().includes('localhost:5173')) {
        console.log(`[NETWORK_RESPONSE] ${response.status()} ${response.url()}`);
      }
    });
    
    return this.page;
  }

  /**
   * Navigate to a specific page
   */
  async navigate(url = '/') {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    
    await this.page.goto(`http://localhost:5173${url}`);
    console.log(`📍 Navigated to: ${url}`);
  }

  /**
   * Take a screenshot and save it
   */
  async screenshot(name = 'debug-screenshot') {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    
    const filename = `test-results/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  /**
   * Get page title and URL
   */
  async getPageInfo() {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    
    const title = await this.page.title();
    const url = this.page.url();
    
    console.log(`📄 Page Info:`);
    console.log(`  Title: ${title}`);
    console.log(`  URL: ${url}`);
    
    return { title, url };
  }

  /**
   * Find and log all elements matching a selector
   */
  async findElements(selector) {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    
    const elements = await this.page.$$(selector);
    console.log(`🔍 Found ${elements.length} elements matching "${selector}":`);
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const text = await element.textContent();
      const isVisible = await element.isVisible();
      console.log(`  [${i}] Visible: ${isVisible}, Text: ${text?.substring(0, 50)}...`);
    }
    
    return elements;
  }

  /**
   * Wait for an element to appear
   */
  async waitForElement(selector, timeout = 10000) {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    
    console.log(`⏳ Waiting for element: ${selector}`);
    await this.page.waitForSelector(selector, { timeout });
    console.log(`✅ Element found: ${selector}`);
  }

  /**
   * Click an element and wait for navigation
   */
  async clickAndWaitForNavigation(selector, options = {}) {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    
    console.log(`🖱️  Clicking: ${selector}`);
    const response = await Promise.all([
      this.page.waitForNavigation(options),
      this.page.click(selector)
    ]);
    
    console.log(`✅ Navigation completed after click: ${selector}`);
    return response;
  }

  /**
   * Fill a form field
   */
  async fillField(selector, value) {
    if (!this.page) {
      throw new Error('Browser not initialized. Call init() first.');
    }
    
    console.log(`✍️  Filling field ${selector}: ${value}`);
    await this.page.fill(selector, value);
  }

  /**
   * Close the browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Export utilities for debugging
const debugUtils = new DebugUtils();

// Helper functions for common debugging tasks
const debugHelpers = {
  /**
   * Quick debug session for booking modal
   */
  async debugBookingModal() {
    console.log('🎭 Starting debug session for Booking Modal');
    
    await debugUtils.init();
    await debugUtils.navigate('/');
    
    // Open booking modal
    await debugUtils.clickAndWaitForNavigation('[data-testid="book-now-btn"]');
    
    // Take screenshot
    await debugUtils.screenshot('booking-modal-open');
    
    // Get page info
    await debugUtils.getPageInfo();
    
    // Find booking modal elements
    await debugUtils.findElements('[data-testid="booking-modal"]');
    
    await debugUtils.close();
  },

  /**
   * Debug admin dashboard
   */
  async debugAdminDashboard() {
    console.log('🎭 Starting debug session for Admin Dashboard');
    
    await debugUtils.init();
    await debugUtils.navigate('/admin');
    
    // Take screenshot
    await debugUtils.screenshot('admin-dashboard');
    
    // Get page info
    await debugUtils.getPageInfo();
    
    // Find admin elements
    await debugUtils.findElements('[data-testid="admin-dashboard"]');
    
    await debugUtils.close();
  },

  /**
   * Debug responsive design
   */
  async debugResponsiveDesign() {
    console.log('🎭 Starting debug session for Responsive Design');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);
      
      await debugUtils.init();
      await debugUtils.context.setViewportSize({ width: viewport.width, height: viewport.height });
      await debugUtils.navigate('/');
      
      await debugUtils.screenshot(`responsive-${viewport.name}`);
      await debugUtils.getPageInfo();
      
      await debugUtils.close();
    }
  }
};

// Export for use
module.exports = { DebugUtils, debugUtils, debugHelpers };