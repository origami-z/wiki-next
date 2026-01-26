import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
  test.describe('Games → Category → Item Detail Navigation', () => {
    test('should navigate from home to games list', async ({ page }) => {
      await page.goto('/');

      // Find and click the Games link in navigation
      const gamesLink = page.locator('header a[href*="/games"]').first();
      await expect(gamesLink).toBeVisible();
      await gamesLink.click();

      // Should be on games page
      await expect(page).toHaveURL('/games');
      await expect(page.locator('h1')).toContainText(/Games|游戏/);
    });

    test('should navigate from games to game detail', async ({ page }) => {
      await page.goto('/games');

      // Click on Wittle Defender game
      const gameCard = page.locator('a[href*="/games/wittle-defender"]').first();
      await expect(gameCard).toBeVisible();
      await gameCard.click();

      // Should be on game detail page
      await expect(page).toHaveURL('/games/wittle-defender');
      await expect(page.locator('body')).toContainText('Wittle Defender');
    });

    test('should navigate from game to category (heroes)', async ({ page }) => {
      await page.goto('/games/wittle-defender');

      // Click on Heroes category
      const heroesLink = page.locator('a[href*="/games/wittle-defender/heroes"]').first();
      await expect(heroesLink).toBeVisible();
      await heroesLink.click();

      // Should be on heroes category page
      await expect(page).toHaveURL('/games/wittle-defender/heroes');
      await expect(page.locator('body')).toContainText(/Heroes|英雄/);
    });

    test('should navigate from category to item detail', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes');

      // Click on a specific hero (Ember Knight)
      const heroCard = page.locator('a[href*="/ember-knight"]').first();
      await expect(heroCard).toBeVisible();
      await heroCard.click();

      // Should be on hero detail page
      await expect(page).toHaveURL('/games/wittle-defender/heroes/ember-knight');
      await expect(page.locator('body')).toContainText('Ember Knight');
    });

    test('complete navigation flow: home → games → game → category → item', async ({ page }) => {
      // Start at home
      await page.goto('/');
      await expect(page.locator('body')).toContainText(/Game Wiki|游戏维基/);

      // Go to games
      await page.goto('/games');
      await expect(page).toHaveURL('/games');

      // Go to specific game
      await page.goto('/games/wittle-defender');
      await expect(page).toHaveURL('/games/wittle-defender');

      // Go to category
      await page.goto('/games/wittle-defender/dungeons');
      await expect(page).toHaveURL('/games/wittle-defender/dungeons');
      await expect(page.locator('body')).toContainText(/Dungeons|地下城/);

      // Go to specific item
      await page.goto('/games/wittle-defender/skills/fireball');
      // Verify page loads (may show skill or 404 depending on data)
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should show breadcrumbs on category page', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes');

      // Check for navigation structure (links back to parent pages)
      const gameLink = page.locator('a[href="/games/wittle-defender"]');
      await expect(gameLink).toBeVisible();
    });

    test('should show breadcrumbs on item detail page', async ({ page }) => {
      await page.goto('/games/wittle-defender/heroes/ember-knight');

      // Should have links back to category and game
      await expect(page.locator('a[href*="/games/wittle-defender"]')).toBeVisible();
    });
  });

  test.describe('Chinese Locale Navigation', () => {
    test('should maintain Chinese locale through navigation', async ({ page }) => {
      await page.goto('/zh');
      await expect(page).toHaveURL('/zh');

      // Navigate to games
      await page.goto('/zh/games');
      await expect(page).toHaveURL('/zh/games');
      await expect(page.locator('body')).toContainText('所有游戏');

      // Navigate to game detail
      await page.goto('/zh/games/wittle-defender');
      await expect(page).toHaveURL('/zh/games/wittle-defender');

      // Navigate to category
      await page.goto('/zh/games/wittle-defender/heroes');
      await expect(page).toHaveURL('/zh/games/wittle-defender/heroes');
      await expect(page.locator('body')).toContainText('英雄');
    });
  });

  test.describe('Header Navigation Links', () => {
    test('should have working Home link', async ({ page }) => {
      await page.goto('/games/wittle-defender');

      const homeLink = page.locator('header a[href="/"]').first();
      await expect(homeLink).toBeVisible();
      await homeLink.click();

      await expect(page).toHaveURL('/');
    });

    test('should have working Games link', async ({ page }) => {
      await page.goto('/');

      const gamesLink = page.locator('header a[href*="/games"]').first();
      await expect(gamesLink).toBeVisible();
      await gamesLink.click();

      await expect(page).toHaveURL('/games');
    });
  });

  test.describe('404 Handling', () => {
    test('should handle non-existent game gracefully', async ({ page }) => {
      const response = await page.goto('/games/non-existent-game');

      // Should return 404 or show not found message
      const status = response?.status();
      if (status === 200) {
        await expect(page.locator('body')).toContainText(/not found|404/i);
      } else {
        expect(status).toBe(404);
      }
    });

    test('should handle non-existent category gracefully', async ({ page }) => {
      const response = await page.goto('/games/wittle-defender/non-existent-category');

      const status = response?.status();
      if (status === 200) {
        await expect(page.locator('body')).toContainText(/not found|404/i);
      } else {
        expect(status).toBe(404);
      }
    });
  });
});
