import { test, expect } from '@playwright/test';

test.describe('Golden Tower Spa - Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard (you may need to implement authentication)
    await page.goto('/admin');
  });

  test('should load admin dashboard', async ({ page }) => {
    await expect(page).toHaveTitle(/Admin Dashboard/i);
    await expect(page.locator('h2')).toHaveText(/Admin Dashboard/i);
  });

  test('should display booking statistics', async ({ page }) => {
    const statsSection = page.locator('[data-testid="booking-stats"]');
    await expect(statsSection).toBeVisible();
    
    // Check for stat cards
    await expect(statsSection.getByText(/Total Bookings/i)).toBeVisible();
    await expect(statsSection.getByText(/Today's Bookings/i)).toBeVisible();
    await expect(statsSection.getByText(/Revenue/i)).toBeVisible();
  });

  test('should show booking list', async ({ page }) => {
    const bookingList = page.locator('[data-testid="booking-list"]');
    await expect(bookingList).toBeVisible();
    
    // Check for booking items
    const bookingItems = bookingList.locator('[data-testid="booking-item"]');
    await expect(bookingItems.first()).toBeVisible();
  });

  test('should allow booking management', async ({ page }) => {
    const bookingList = page.locator('[data-testid="booking-list"]');
    
    // Find first booking item
    const firstBooking = bookingList.locator('[data-testid="booking-item"]').first();
    await expect(firstBooking).toBeVisible();
    
    // Test edit functionality
    const editButton = firstBooking.getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    await editButton.click();
    
    // Check if edit modal opens
    const editModal = page.locator('[data-testid="edit-booking-modal"]');
    await expect(editModal).toBeVisible();
    
    // Close modal
    await editModal.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle admin navigation', async ({ page }) => {
    // Test navigation between admin sections
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.locator('h2')).toHaveText(/Admin Dashboard/i);
    
    await page.getByRole('link', { name: 'Bookings' }).click();
    await expect(page.locator('h2')).toHaveText(/Manage Bookings/i);
  });
});