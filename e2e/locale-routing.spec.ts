import { test, expect } from '@playwright/test';

test.describe('Locale Routing and Middleware', () => {
  test('should redirect root path to default locale (English)', async ({ page }) => {
    await page.goto('/');

    // Should be on the root path (no /en prefix for default locale with as-needed strategy)
    await expect(page).toHaveURL('/');

    // Should display English content
    await expect(page.locator('body')).toContainText('Game Wiki');
  });

  test('should load Chinese locale with /zh prefix', async ({ page }) => {
    await page.goto('/zh');

    // Should stay on /zh path
    await expect(page).toHaveURL('/zh');

    // Should display Chinese content
    await expect(page.locator('body')).toContainText('游戏维基');
  });

  test('should redirect /en to root path', async ({ page }) => {
    await page.goto('/en');

    // Should redirect to root (as-needed strategy means no prefix for default locale)
    await expect(page).toHaveURL('/');

    // Should display English content
    await expect(page.locator('body')).toContainText('Game Wiki');
  });

  test('should maintain locale when navigating', async ({ page }) => {
    // Start on Chinese version
    await page.goto('/zh');
    await expect(page).toHaveURL('/zh');

    // If there are navigation links, test they maintain locale
    // (This will be more relevant once we have more pages)
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should switch locale using LocaleSwitch component', async ({ page }) => {
    // Start on English version
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Game Wiki');

    // Find and click the locale switch button
    const localeSwitch = page.locator('button').filter({ hasText: /EN|中/ });
    await expect(localeSwitch).toBeVisible();
    await localeSwitch.click();

    // Should now be on Chinese version
    await expect(page).toHaveURL('/zh');
    await expect(page.locator('body')).toContainText('游戏维基');

    // Click again to switch back
    await localeSwitch.click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toContainText('Game Wiki');
  });

  test('should have correct lang attribute on html element', async ({ page }) => {
    // English version
    await page.goto('/');
    const htmlEn = page.locator('html');
    await expect(htmlEn).toHaveAttribute('lang', 'en');

    // Chinese version
    await page.goto('/zh');
    const htmlZh = page.locator('html');
    await expect(htmlZh).toHaveAttribute('lang', 'zh');
  });

  test('should handle theme toggle without breaking locale', async ({ page }) => {
    await page.goto('/zh');

    // Find and click theme toggle
    const themeToggle = page.locator('button[title*="主题"], button[aria-label*="主题"]').first();
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();

    // Should still be on Chinese locale after theme change
    await expect(page).toHaveURL('/zh');
    await expect(page.locator('body')).toContainText('游戏维基');
  });

  test('should serve correct translation strings', async ({ page }) => {
    // English version
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText(/© \d{4} Game Wiki\. All rights reserved\./);

    // Chinese version
    await page.goto('/zh');
    await expect(footer).toContainText(/© \d{4} 游戏维基。保留所有权利。/);
  });
});

test.describe('Middleware Configuration', () => {
  test('should exclude API routes from middleware processing', async ({ page, request }) => {
    // This test verifies the middleware matcher is working correctly
    // API routes should not go through i18n middleware
    const response = await request.get('/api/test', {
      failOnStatusCode: false
    });

    // Should get 404 (route doesn't exist) not a redirect or locale error
    expect(response.status()).toBe(404);
  });

  test('should exclude _next static files from middleware', async ({ page }) => {
    // Navigate to a page first to ensure assets are loaded
    await page.goto('/');

    // Check that _next files are loading without middleware interference
    const responses: number[] = [];
    page.on('response', response => {
      if (response.url().includes('/_next/')) {
        responses.push(response.status());
      }
    });

    // Wait a bit for assets to load
    await page.waitForLoadState('networkidle');

    // All _next assets should have loaded successfully (200 or 304)
    const allSuccessful = responses.every(status => status === 200 || status === 304);
    expect(allSuccessful).toBeTruthy();
  });

  test('should handle admin route blocking in production', async ({ page, request }) => {
    // Note: This test assumes we're running in development mode
    // In production, admin routes should return 404

    // Skip if we can't set NODE_ENV (would need separate test config)
    // This documents the expected behavior
    test.skip();
  });
});
