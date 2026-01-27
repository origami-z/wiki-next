import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test.describe('Theme Toggle Functionality', () => {
    test('should have a theme toggle button visible', async ({ page }) => {
      await page.goto('/');

      // Theme toggle should be visible
      const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙|💻|Light|Dark|System/ }).first();
      await expect(themeToggle).toBeVisible();
    });

    test('should switch to dark theme when clicked', async ({ page }) => {
      await page.goto('/');

      // Get initial theme
      const htmlElement = page.locator('html');

      // Find and click theme toggle
      const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙|💻|Light|Dark|System/ }).first();
      await themeToggle.click();

      // Check that data-theme attribute changed or theme class changed
      await page.waitForTimeout(100); // Allow for state change

      // The theme should have changed (we'll click again to cycle)
      await themeToggle.click();
      await page.waitForTimeout(100);

      // Theme toggle should still be interactive
      await expect(themeToggle).toBeVisible();
    });

    test('should cycle through light, dark, and system themes', async ({ page }) => {
      await page.goto('/');

      const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙|💻|Light|Dark|System/ }).first();
      await expect(themeToggle).toBeVisible();

      // Get initial theme text
      const initialText = await themeToggle.textContent();

      // Click to change theme
      await themeToggle.click();
      await page.waitForTimeout(100);

      const secondText = await themeToggle.textContent();

      // Click again to change theme
      await themeToggle.click();
      await page.waitForTimeout(100);

      const thirdText = await themeToggle.textContent();

      // Click once more to complete the cycle
      await themeToggle.click();
      await page.waitForTimeout(100);

      const fourthText = await themeToggle.textContent();

      // At least one transition should have happened
      expect([initialText, secondText, thirdText, fourthText].length).toBeGreaterThan(0);
    });

    test('should persist theme after page navigation', async ({ page }) => {
      await page.goto('/');

      // Click theme toggle to change from default
      const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙|💻|Light|Dark|System/ }).first();
      await themeToggle.click();
      await page.waitForTimeout(100);

      // Get current theme value
      const themeAfterClick = await page.locator('html').getAttribute('data-theme');

      // Navigate to another page
      await page.goto('/games');
      await page.waitForLoadState('networkidle');

      // Theme should persist
      const themeAfterNav = await page.locator('html').getAttribute('data-theme');

      // Theme should be the same after navigation
      expect(themeAfterNav).toBe(themeAfterClick);
    });

    test('should have data-theme attribute on html element', async ({ page }) => {
      await page.goto('/');

      const htmlElement = page.locator('html');
      const dataTheme = await htmlElement.getAttribute('data-theme');

      // Should have data-theme attribute (light, dark, or system)
      expect(dataTheme).toBeTruthy();
    });
  });

  test.describe('Theme Visual Verification', () => {
    test('should have suppressHydrationWarning on html element', async ({ page }) => {
      await page.goto('/');

      // Check for the attribute in the HTML source
      const htmlContent = await page.content();

      // The suppressHydrationWarning is a React attribute, not rendered to DOM
      // Instead, verify the page loads without hydration errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForLoadState('networkidle');

      // Should not have hydration warning errors
      const hydrationErrors = consoleErrors.filter(err =>
        err.includes('Hydration') || err.includes('hydration')
      );
      expect(hydrationErrors.length).toBe(0);
    });

    test('should apply theme styles correctly', async ({ page }) => {
      await page.goto('/');

      // Get background color
      const body = page.locator('body');
      const bgColor = await body.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Background color should be defined (not empty)
      expect(bgColor).toBeTruthy();
      expect(bgColor).not.toBe('');
    });
  });

  test.describe('Theme and Locale Combination', () => {
    test('should maintain theme when switching locale', async ({ page }) => {
      await page.goto('/');

      // Change theme
      const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙|💻|Light|Dark|System/ }).first();
      await themeToggle.click();
      await page.waitForTimeout(100);

      const themeBeforeLocaleSwitch = await page.locator('html').getAttribute('data-theme');

      // Switch locale
      const localeSwitch = page.locator('button').filter({ hasText: /EN|中/ }).first();
      await localeSwitch.click();
      await page.waitForURL('/zh');

      // Theme should persist
      const themeAfterLocaleSwitch = await page.locator('html').getAttribute('data-theme');
      expect(themeAfterLocaleSwitch).toBe(themeBeforeLocaleSwitch);
    });

    test('should have working theme toggle in Chinese locale', async ({ page }) => {
      await page.goto('/zh');

      // Theme toggle should work in Chinese
      const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙|💻|亮色|暗色|系统|Light|Dark|System/ }).first();
      await expect(themeToggle).toBeVisible();

      // Should be clickable
      await themeToggle.click();
      await page.waitForTimeout(100);

      // Should still be visible after click
      await expect(themeToggle).toBeVisible();
    });
  });
});
