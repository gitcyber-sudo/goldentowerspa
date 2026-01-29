import { test, expect } from '@playwright/test';

// Global test setup
test.beforeEach(async ({ page }) => {
  // Common setup for all tests
  await page.goto('/');
});

// Global test hooks
test.afterEach(async ({ page }) => {
  // Take screenshot on test failure
  if (test.info().status === test.info().expectedStatus) {
    // Pass - no screenshot needed
  } else {
    // Take a screenshot to help debug failures
    await page.screenshot({ path: `test-results/${test.info().title.replace(/[^a-zA-Z0-9]/g, '-')}.png` });
  }
});

// Global test timeout
test.setTimeout(30000);