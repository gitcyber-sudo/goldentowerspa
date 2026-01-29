import { test, expect } from '@playwright/test';

test.describe('Golden Tower Spa - Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to booking section
    await page.getByRole('button', { name: 'Book Now' }).click();
  });

  test('should open booking modal', async ({ page }) => {
    const bookingModal = page.locator('[data-testid="booking-modal"]');
    await expect(bookingModal).toBeVisible();
    await expect(bookingModal.locator('h2')).toHaveText(/Book Appointment/i);
  });

  test('should validate required booking fields', async ({ page }) => {
    const bookingModal = page.locator('[data-testid="booking-modal"]');
    
    // Try to submit without filling required fields
    await bookingModal.getByRole('button', { name: 'Book Now' }).click();
    
    // Check for validation errors
    await expect(bookingModal.getByText(/Please fill in all required fields/i)).toBeVisible();
  });

  test('should allow booking form submission', async ({ page }) => {
    const bookingModal = page.locator('[data-testid="booking-modal"]');
    
    // Fill in booking form
    await bookingModal.getByLabel(/Name/i).fill('John Doe');
    await bookingModal.getByLabel(/Email/i).fill('john@example.com');
    await bookingModal.getByLabel(/Phone/i).fill('123-456-7890');
    await bookingModal.getByLabel(/Service/i).selectOption('Massage Therapy');
    await bookingModal.getByLabel(/Date/i).fill('2024-01-15');
    await bookingModal.getByLabel(/Time/i).selectOption('10:00 AM');
    
    // Submit form
    await bookingModal.getByRole('button', { name: 'Book Now' }).click();
    
    // Check for success message
    await expect(bookingModal.getByText(/Booking confirmed/i)).toBeVisible();
  });

  test('should handle mobile booking flow', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const bookingModal = page.locator('[data-testid="booking-modal"]');
    await expect(bookingModal).toBeVisible();
    
    // Check mobile-specific elements
    await expect(bookingModal.getByRole('button', { name: 'Close' })).toBeVisible();
  });
});