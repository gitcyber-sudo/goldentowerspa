import { test, expect } from '@playwright/test';

test.describe('Golden Tower Spa - Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Golden Tower Spa/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Check for navigation links
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Book Now' })).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });
});