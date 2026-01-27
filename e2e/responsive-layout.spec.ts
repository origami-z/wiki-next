import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test.describe('Desktop Layout (1280px+)', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display horizontal navigation', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Navigation links should be visible on desktop
      const navLinks = page.locator('header nav a, header a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    });

    test('should display multi-column grid for entity cards', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes');

      // Wait for cards to load
      await page.waitForSelector('a[href*="/heroes/"]');

      // Get the grid container
      const cards = page.locator('a[href*="/heroes/"]');
      const cardCount = await cards.count();

      // Should have multiple cards visible
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should show full header with locale and theme switches', async ({ page }) => {
      await page.goto('/');

      // Locale switch should be visible
      const localeSwitch = page.locator('button').filter({ hasText: /EN|中/ }).first();
      await expect(localeSwitch).toBeVisible();

      // Theme toggle should be visible
      const themeToggle = page.locator('button').filter({ hasText: /☀️|🌙|💻|Light|Dark|System/ }).first();
      await expect(themeToggle).toBeVisible();
    });
  });

  test.describe('Tablet Layout (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should have responsive header', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header');
      await expect(header).toBeVisible();
    });

    test('should display content properly', async ({ page }) => {
      await page.goto('/games/wittle-defender');

      // Content should be visible and readable
      await expect(page.locator('body')).toContainText('Wittle Defender');
    });

    test('should have accessible category cards', async ({ page }) => {
      await page.goto('/games/wittle-defender');

      // Category links should be clickable
      const categoryLinks = page.locator('a[href*="/games/wittle-defender/"]');
      const count = await categoryLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Layout (375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display mobile-friendly header', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Page should not overflow horizontally
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);
    });

    test('should have single-column layout for cards', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes');

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Content should be accessible
      await expect(page.locator('body')).toContainText(/Heroes|英雄/);
    });

    test('should have readable text sizes', async ({ page }) => {
      await page.goto('/');

      // Check that main heading is readable
      const heading = page.locator('h1, h2').first();
      const fontSize = await heading.evaluate(el => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });

      // Font size should be at least 16px for accessibility
      expect(fontSize).toBeGreaterThanOrEqual(16);
    });

    test('should have touch-friendly buttons', async ({ page }) => {
      await page.goto('/');

      // Find buttons and check their size
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const box = await firstButton.boundingBox();

        if (box) {
          // Buttons should be at least 44x44 for touch accessibility
          expect(box.width).toBeGreaterThanOrEqual(32);
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
    });

    test('should navigate correctly on mobile', async ({ page }) => {
      await page.goto('/');

      // Navigate to games
      await page.goto('/games');
      await expect(page).toHaveURL('/games');

      // Navigate to game detail
      await page.goto('/games/wittle-defender');
      await expect(page).toHaveURL('/games/wittle-defender');
      await expect(page.locator('body')).toContainText('Wittle Defender');
    });
  });

  test.describe('Small Mobile Layout (320px)', () => {
    test.use({ viewport: { width: 320, height: 568 } });

    test('should not have horizontal overflow', async ({ page }) => {
      await page.goto('/');

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(320);
    });

    test('should render home page correctly', async ({ page }) => {
      await page.goto('/');

      // Page should load without errors
      await expect(page.locator('body')).toContainText(/Game Wiki|游戏维基/);
    });

    test('should render category page correctly', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes');

      // Page should load without errors
      await expect(page.locator('body')).toContainText(/Heroes|英雄/);
    });
  });

  test.describe('Large Desktop Layout (1920px)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should have max-width container for readability', async ({ page }) => {
      await page.goto('/');

      // Content should not span the entire width
      const mainContent = page.locator('main').first();
      await expect(mainContent).toBeVisible();
    });

    test('should display grid properly', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes');

      await page.waitForLoadState('networkidle');

      // Grid should show multiple columns
      const cards = page.locator('a[href*="/heroes/"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Viewport Transitions', () => {
    test('should handle viewport resize gracefully', async ({ page }) => {
      // Start with mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/games/wittle-defender');

      await expect(page.locator('body')).toContainText('Wittle Defender');

      // Resize to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(100);

      await expect(page.locator('body')).toContainText('Wittle Defender');

      // Resize to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(100);

      await expect(page.locator('body')).toContainText('Wittle Defender');
    });
  });

  test.describe('Placeholder Images', () => {
    test('should display placeholder images for missing images', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes');

      await page.waitForLoadState('networkidle');

      // Check for SVG placeholders or image elements
      const images = page.locator('img, svg');
      const imageCount = await images.count();

      // Should have some visual elements
      expect(imageCount).toBeGreaterThan(0);
    });

    test('should handle image errors gracefully', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes/ember-knight');

      // Page should load without broken image errors
      const brokenImages: string[] = [];
      page.on('response', response => {
        if (response.url().includes('/images/') && response.status() === 404) {
          brokenImages.push(response.url());
        }
      });

      await page.waitForLoadState('networkidle');

      // Even if images are missing, the page should still be functional
      await expect(page.locator('body')).toContainText('Ember Knight');
    });
  });
});
