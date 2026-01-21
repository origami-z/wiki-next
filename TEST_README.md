# Test Documentation

This document describes the test coverage for the Game Wiki application, particularly focusing on tests that cover the middleware location and locale routing bug fix.

## Test Coverage

### 1. Middleware Location Tests (`__tests__/middleware-location.test.ts`)

These tests verify that the middleware file is in the correct location (`src/middleware.ts`) when using Next.js with the `src/` directory structure. This is the key fix that resolved the locale routing issue.

**Tests:**
- ✓ Middleware is located at `src/middleware.ts`
- ✓ Middleware is NOT in the project root (wrong location)
- ✓ Middleware has a default export
- ✓ Middleware has config export with matcher
- ✓ Middleware matcher includes root path handling
- ✓ Middleware matcher excludes `_next` and `api` paths
- ✓ Middleware uses next-intl
- ✓ Middleware imports routing configuration

**Why This Matters:**
When using Next.js with a `src/` directory, middleware must be placed in `src/middleware.ts`, not in the project root. This was the bug that prevented locale routing from working correctly.

### 2. Component Tests (`__tests__/components/LocaleSwitch.test.tsx`)

Tests for the LocaleSwitch component that allows users to switch between English and Chinese locales.

**Tests:**
- ✓ Displays "EN" when locale is English
- ✓ Displays "中" when locale is Chinese
- ✓ Has correct aria-label for accessibility
- ✓ Has correct title attribute
- ✓ Switches to Chinese when clicked (from English)
- ✓ Switches to English when clicked (from Chinese)
- ✓ Preserves current pathname when switching locale
- ✓ Preserves nested paths when switching locale

### 3. E2E Tests (`e2e/locale-routing.spec.ts`)

End-to-end tests using Playwright to verify the complete locale routing behavior in a real browser.

**Locale Routing Tests:**
- ✓ Root path loads with default locale (English)
- ✓ `/zh` loads Chinese locale
- ✓ `/en` redirects to root path (as-needed strategy)
- ✓ Locale is maintained when navigating
- ✓ LocaleSwitch component works correctly
- ✓ HTML lang attribute is set correctly
- ✓ Theme toggle doesn't break locale
- ✓ Translation strings are served correctly

**Middleware Configuration Tests:**
- ✓ API routes are excluded from middleware processing
- ✓ `_next` static files are excluded from middleware
- ⊘ Admin route blocking in production (skipped - requires prod build)

## Running Tests

### Unit/Integration Tests (Jest)

```bash
# Run all Jest tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests (all browsers)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Run All Tests

```bash
npm run test:all
```

## Bug Fixed

### Issue
The middleware file was initially placed in the project root (`/middleware.ts`), which caused it not to be executed when using Next.js with the `src/` directory structure. This resulted in:
- Root path (`/`) returning 404
- Locale routing not working
- No redirect from `/en` to `/`

### Solution
Moved the middleware file to `src/middleware.ts` to align with Next.js conventions when using the `src/` directory structure.

### Tests That Verify the Fix
1. **`middleware-location.test.ts`** - Verifies middleware is in the correct location
2. **`locale-routing.spec.ts`** - Verifies locale routing works correctly end-to-end

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses Next.js Jest configuration
- Tests environment: jsdom
- Path alias: `@/*` → `src/*`
- Test patterns: `**/__tests__/**/*.test.{ts,tsx}`

### Playwright Configuration (`playwright.config.ts`)
- Test directory: `./e2e`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Auto-starts dev server before tests

## Coverage

The tests cover:
- ✅ Middleware file location
- ✅ Middleware configuration
- ✅ Locale routing behavior
- ✅ Locale switching functionality
- ✅ URL structure with `localePrefix: 'as-needed'`
- ✅ Translation loading
- ✅ Accessibility attributes

## Future Test Additions

As the application grows, consider adding:
- Visual regression tests
- Performance tests
- Cross-browser compatibility tests
- Mobile responsiveness tests
- Admin route blocking tests (requires production build setup)
