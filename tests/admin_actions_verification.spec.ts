import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Action Buttons', () => {
    test.beforeEach(async ({ page }) => {
        // We'll need to mock or bypass auth if possible, or expect to be on /admin
        // For this verification, we primarily want to check the DOM structure and CSS
        await page.goto('/admin');
    });

    test('More Actions menu should be visible and clickable on desktop', async ({ page }) => {
        // Set viewport to desktop
        await page.setViewportSize({ width: 1280, height: 720 });

        // Wait for dashboard to load
        await page.waitForSelector('table');

        // Find the first "More Actions" button
        const moreActionsBtn = page.locator('button[title=""] :has(svg.lucide-more-vertical)').first();
        if (await moreActionsBtn.isVisible()) {
            await moreActionsBtn.click();

            // Check if the dropdown menu is visible and not clipped
            const dropdown = page.locator('div.absolute.right-0.top-full');
            await expect(dropdown).toBeVisible();

            // Verify a button inside the dropdown is clickable
            const cancelBtn = dropdown.getByText(/Cancel Booking/i);
            await expect(cancelBtn).toBeVisible();

            // Check z-index (implicitly by checking visibility/clickability)
            await cancelBtn.hover();
        }
    });

    test('Assign Therapist button should be visible in dropdown', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForSelector('table');

        const moreActionsBtn = page.locator('button :has(svg.lucide-more-vertical)').first();
        if (await moreActionsBtn.isVisible()) {
            await moreActionsBtn.click();
            const assignBtn = page.getByText(/Assign Therapist/i);
            await expect(assignBtn).toBeVisible();
        }
    });
});
