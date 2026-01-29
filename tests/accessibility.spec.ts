import { test, expect } from '@playwright/test';

test.describe('Golden Tower Spa - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for main heading
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for semantic HTML structure
    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check navigation links have proper labels
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Book Now' })).toBeVisible();
  });

  test('should have accessible forms', async ({ page }) => {
    // Open booking modal
    await page.getByRole('button', { name: 'Book Now' }).click();
    
    const bookingModal = page.locator('[data-testid="booking-modal"]');
    await expect(bookingModal).toBeVisible();
    
    // Check form labels
    await expect(bookingModal.getByLabel(/Name/i)).toBeVisible();
    await expect(bookingModal.getByLabel(/Email/i)).toBeVisible();
    await expect(bookingModal.getByLabel(/Phone/i)).toBeVisible();
  });

  test('should have keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('button')).toBeFocused();
    
    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    
    // Check that modal opened
    const bookingModal = page.locator('[data-testid="booking-modal"]');
    await expect(bookingModal).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA attributes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      // Either aria-label or aria-labelledby should be present
      expect(ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });
});