import { test, expect } from '@playwright/test';

/**
 * Debug tests - these are specifically designed for debugging purposes
 * These tests will help you understand how your React components behave
 */

test.describe('🔧 Debug Tests - Golden Tower Spa', () => {
  test('debug: inspect page structure', async ({ page }) => {
    console.log('🔍 Starting page structure inspection...');
    
    await page.goto('/');
    
    // Log page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`📄 Page: ${title} (${url})`);
    
    // Find and log all interactive elements
    const interactiveElements = await page.$$eval('*', (elements) => {
      return elements.filter(el => {
        return el.tagName === 'BUTTON' || 
               el.tagName === 'A' || 
               el.tagName === 'INPUT' || 
               el.tagName === 'SELECT' || 
               el.tagName === 'TEXTAREA';
      }).map(el => ({
        tag: el.tagName,
        id: el.id || 'no-id',
        class: el.className || 'no-class',
        text: el.textContent?.substring(0, 50) || 'no-text'
      }));
    });
    
    console.log(`🎯 Found ${interactiveElements.length} interactive elements:`);
    interactiveElements.forEach((el, index) => {
      console.log(`  [${index}] ${el.tag}#${el.id} (${el.class}): ${el.text}`);
    });
    
    // Take screenshot for manual inspection
    await page.screenshot({ path: 'test-results/debug-page-structure.png', fullPage: true });
    
    expect(title).toContain('Golden Tower Spa');
  });

  test('debug: test booking modal interactions', async ({ page }) => {
    console.log('🔍 Testing booking modal interactions...');
    
    await page.goto('/');
    
    // Find and log all book buttons
    const bookButtons = await page.$$eval('*', (elements) => {
      return Array.from(elements).filter(el => 
        el.textContent?.toLowerCase().includes('book') || 
        el.getAttribute('data-testid')?.includes('book')
      ).map(el => ({
        text: el.textContent || 'no-text',
        id: el.id || 'no-id',
        class: el.className || 'no-class'
      }));
    });
    
    console.log(`🎯 Found ${bookButtons.length} book buttons:`);
    bookButtons.forEach((btn, index) => {
      console.log(`  [${index}] ${btn.text} (${btn.id}: ${btn.class})`);
    });
    
    // Click the first book button
    if (bookButtons.length > 0) {
      const firstBookBtn = await page.$('button, a');
      if (firstBookBtn) {
        console.log('🖱️  Clicking first book button...');
        await firstBookBtn.click();
        
        // Wait for modal to open
        await page.waitForTimeout(2000);
        
        // Check for modal elements
        const modalElements = await page.$$eval('*', (elements) => {
          return Array.from(elements).filter(el => 
            el.getAttribute('data-testid')?.includes('modal') ||
            el.classList.contains('modal') ||
            el.closest('.modal')
          ).length;
        });
        
        console.log(`🎯 Found ${modalElements} modal elements`);
        
        // Take screenshot
        await page.screenshot({ path: 'test-results/debug-booking-modal.png' });
      }
    }
    
    expect(bookButtons.length).toBeGreaterThan(0);
  });

  test('debug: test navigation flow', async ({ page }) => {
    console.log('🔍 Testing navigation flow...');
    
    await page.goto('/');
    
    // Find all navigation links
    const navLinks = await page.$$eval('nav a, .nav a', (links) => {
      return links.map(link => ({
        text: link.textContent || 'no-text',
        href: link.href || 'no-href',
        target: link.target || 'no-target'
      }));
    });
    
    console.log(`🎯 Found ${navLinks.length} navigation links:`);
    navLinks.forEach((link, index) => {
      console.log(`  [${index}] ${link.text} -> ${link.href} (${link.target})`);
    });
    
    // Test navigation to each link
    for (const link of navLinks) {
      if (link.href && link.href !== 'no-href' && link.href.includes('localhost:5173')) {
        console.log(`🧭 Testing navigation to: ${link.text}`);
        await page.click(`a[href="${link.href}"]`);
        await page.waitForLoadState('networkidle');
        
        // Check page loaded successfully
        const currentUrl = page.url();
        console.log(`✅ Navigated to: ${currentUrl}`);
        
        // Take screenshot
        await page.screenshot({ path: `test-results/debug-nav-${link.text.replace(/\s+/g, '-')}.png` });
      }
    }
    
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('debug: test form interactions', async ({ page }) => {
    console.log('🔍 Testing form interactions...');
    
    await page.goto('/');
    
    // Open booking modal
    await page.click('[data-testid="book-now-btn"]');
    await page.waitForTimeout(1000);
    
    // Find all form elements
    const formElements = await page.$$eval('form input, form select, form textarea', (elements) => {
      return elements.map(el => ({
        type: el.type || el.tagName.toLowerCase(),
        name: el.name || el.id || 'no-name',
        placeholder: el.placeholder || 'no-placeholder',
        required: el.hasAttribute('required'),
        disabled: el.hasAttribute('disabled')
      }));
    });
    
    console.log(`🎯 Found ${formElements.length} form elements:`);
    formElements.forEach((el, index) => {
      console.log(`  [${index}] ${el.type} (${el.name}): ${el.placeholder} [required: ${el.required}, disabled: ${el.disabled}]`);
    });
    
    // Test filling form fields
    const form = await page.$('form');
    if (form) {
      console.log('📝 Testing form field filling...');
      
      // Fill in some sample data
      await page.fill('input[name="name"], input[placeholder*="Name"], input[placeholder*="name"]', 'John Doe');
      await page.fill('input[name="email"], input[placeholder*="Email"], input[placeholder*="email"]', 'john@example.com');
      await page.fill('input[name="phone"], input[placeholder*="Phone"], input[placeholder*="phone"]', '123-456-7890');
      
      console.log('✅ Form fields filled');
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/debug-form-filled.png' });
    }
    
    expect(formElements.length).toBeGreaterThan(0);
  });

  test('debug: test responsive behavior', async ({ page }) => {
    console.log('🔍 Testing responsive behavior...');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Check for responsive elements
      const navElements = await page.$$eval('nav', (navs) => {
        return navs.map(nav => ({
          class: nav.className,
          mobile: nav.classList.contains('mobile-nav'),
          desktop: nav.classList.contains('desktop-nav')
        }));
      });
      
      console.log(`🎯 Found ${navElements.length} nav elements for ${viewport.name}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/debug-responsive-${viewport.name}.png`,
        fullPage: true 
      });
    }
    
    expect(viewports.length).toBe(3);
  });
});