# Playwright Debug Guide for Golden Tower Spa

## 🎭 Quick Start

### Running Tests
```bash
# Run all tests
npm run test

# Run tests with trace for debugging
npm run test:trace

# Run specific test file
npm run test:specific tests/booking.spec.ts

# Run tests in headed mode (visible browser)
npm run test:headed
```

### Debug Scripts
```bash
# Show help for debug scripts
node debug-scripts.js

# Run tests with trace
node debug-scripts.js run-with-trace

# Run tests with debugger
node debug-scripts.js run-with-debugger

# Show test report
node debug-scripts.js show-test-report
```

## 🔧 Debug Utilities

### Using Debug Utils
```javascript
const { debugUtils, debugHelpers } = require('./debug-utils');

// Quick debug session for booking modal
await debugHelpers.debugBookingModal();

// Debug admin dashboard
await debugHelpers.debugAdminDashboard();

// Debug responsive design
await debugHelpers.debugResponsiveDesign();
```

### Manual Debugging Session
```javascript
const { debugUtils } = require('./debug-utils');

// Initialize browser
await debugUtils.init('chromium');

// Navigate to page
await debugUtils.navigate('/');

// Take screenshot
await debugUtils.screenshot('debug-session');

// Find elements
await debugUtils.findElements('button');

// Fill form
await debugUtils.fillField('input[name="name"]', 'John Doe');

// Close browser
await debugUtils.close();
```

## 📊 Test Structure

### Test Categories
- **Home Page Tests** (`home.spec.ts`) - Basic page loading and navigation
- **Booking Flow Tests** (`booking.spec.ts`) - Booking modal and form submission
- **Admin Dashboard Tests** (`admin.spec.ts`) - Admin panel functionality
- **Responsive Design Tests** (`responsive.spec.ts`) - Cross-device testing
- **Accessibility Tests** (`accessibility.spec.ts`) - A11y compliance
- **Debug Tests** (`debug.spec.ts`) - Development and debugging utilities

### Test Configuration
- **Browsers**: Chrome, Firefox, Safari, Mobile devices
- **Viewports**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI
- **Tracing**: Enabled on first retry

## 🎯 Debug Scenarios

### 1. Booking Modal Debug
```bash
# Run debug tests for booking modal
npm run test:specific tests/booking.spec.ts

# Use debug utilities
node -e "
const { debugHelpers } = require('./debug-utils');
debugHelpers.debugBookingModal().catch(console.error);
"
```

### 2. Admin Dashboard Debug
```bash
# Run debug tests for admin dashboard
npm run test:specific tests/admin.spec.ts

# Use debug utilities
node -e "
const { debugHelpers } = require('./debug-utils');
debugHelpers.debugAdminDashboard().catch(console.error);
"
```

### 3. Responsive Design Debug
```bash
# Run responsive tests
npm run test:specific tests/responsive.spec.ts

# Use debug utilities for responsive testing
node -e "
const { debugHelpers } = require('./debug-utils');
debugHelpers.debugResponsiveDesign().catch(console.error);
"
```

### 4. Network Request Debug
```javascript
// Add to your test for network debugging
test('debug: network requests', async ({ page }) => {
  // Enable network logging
  page.on('request', request => {
    console.log(`[REQUEST] ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
  });
  
  await page.goto('/');
});
```

## 🛠️ Development Workflow

### 1. Development Testing
```bash
# Run tests in headed mode for development
npm run test:headed

# Run specific test with debugging
npm run test:debug tests/booking.spec.ts
```

### 2. CI/CD Testing
```bash
# Run tests in headless mode for CI
npm run test:ci

# Run tests with screenshots
npm run test:screenshots
```

### 3. Performance Testing
```bash
# Run tests with performance metrics
npm run test:perf
```

## 📁 File Structure

```
goldentowerspa/
├── playwright.config.ts      # Playwright configuration
├── debug-scripts.js          # Debug utilities and scripts
├── debug-utils.js            # Debug utilities library
├── tests/
│   ├── global.setup.ts       # Global test setup
│   ├── home.spec.ts          # Home page tests
│   ├── booking.spec.ts       # Booking flow tests
│   ├── admin.spec.ts         # Admin dashboard tests
│   ├── responsive.spec.ts    # Responsive design tests
│   ├── accessibility.spec.ts # Accessibility tests
│   └── debug.spec.ts         # Debug and development tests
└── test-results/             # Test results and screenshots
```

## 🔍 Common Debugging Issues

### 1. Element Not Found
- Use `debug.spec.ts` to inspect page structure
- Check element selectors and CSS classes
- Verify element visibility and timing

### 2. Navigation Issues
- Use network logging to track requests
- Check for JavaScript errors
- Verify page load states

### 3. Form Issues
- Use debug tests to inspect form elements
- Check field names and types
- Verify form validation logic

### 4. Responsive Issues
- Test on multiple viewports
- Check CSS media queries
- Verify mobile navigation

## 🎨 Customization

### Adding New Debug Tests
1. Create a new test file in `tests/` directory
2. Follow the naming convention: `feature.spec.ts`
3. Include debug-specific tests with `debug:` prefix
4. Add to debug utilities in `debug-utils.js`

### Extending Debug Utilities
1. Add new methods to `DebugUtils` class
2. Add helper functions to `debugHelpers` object
3. Update debug scripts if needed
4. Add examples and documentation

## 📞 Support

For issues with Playwright setup or debugging:
1. Check the test results in `test-results/` directory
2. Use the debug utilities to inspect page state
3. Run tests with trace for detailed debugging
4. Check browser console for JavaScript errors