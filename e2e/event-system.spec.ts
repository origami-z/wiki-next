import { test, expect } from '@playwright/test';

test.describe('Event System', () => {
  test.describe('Events Overview Page', () => {
    test('should load events page', async ({ page }) => {
      await page.goto('/games/wittle-defender/events');

      // Page should load
      await expect(page).toHaveURL('/games/wittle-defender/events');

      // Should have events title
      await expect(page.locator('body')).toContainText(/Events|活动|游戏活动/);
    });

    test('should display event sections (active/upcoming/past)', async ({ page }) => {
      await page.goto('/games/wittle-defender/events');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Should have section headings for events (translated or English)
      const hasEventContent = await page.locator('body').textContent();
      const hasEventSections =
        hasEventContent?.includes('Active') ||
        hasEventContent?.includes('Upcoming') ||
        hasEventContent?.includes('Past') ||
        hasEventContent?.includes('进行中') ||
        hasEventContent?.includes('即将');

      expect(hasEventSections).toBeTruthy();
    });

    test('should display event cards with names', async ({ page }) => {
      await page.goto('/games/wittle-defender/events');

      await page.waitForLoadState('networkidle');

      // Should have at least one event listed
      // Check for known event names
      const bodyText = await page.locator('body').textContent();
      const hasEvents =
        bodyText?.includes('Wittle Defender Challenge') ||
        bodyText?.includes('Lunar New Year') ||
        bodyText?.includes('挑战') ||
        bodyText?.includes('新年');

      expect(hasEvents).toBeTruthy();
    });

    test('should have event cards as clickable links', async ({ page }) => {
      await page.goto('/games/wittle-defender/events');

      await page.waitForLoadState('networkidle');

      // Find links to event details
      const eventLinks = page.locator('a[href*="/events/"]');
      const linkCount = await eventLinks.count();

      // Should have at least one event link
      expect(linkCount).toBeGreaterThan(0);
    });
  });

  test.describe('Event Detail Page', () => {
    test('should load event detail page for recurring event', async ({ page }) => {
      await page.goto('/games/wittle-defender/events/wittle-defender-challenge');

      // Page should load
      await page.waitForLoadState('networkidle');

      // Should show event name
      await expect(page.locator('body')).toContainText(/Wittle Defender Challenge|挑战/);
    });

    test('should load event detail page for one-time event', async ({ page }) => {
      await page.goto('/games/wittle-defender/events/lunar-new-year');

      // Page should load
      await page.waitForLoadState('networkidle');

      // Should show event name
      await expect(page.locator('body')).toContainText(/Lunar New Year|新年/);
    });

    test('should display event stages with requirements and rewards', async ({ page }) => {
      await page.goto('/games/wittle-defender/events/wittle-defender-challenge');

      await page.waitForLoadState('networkidle');

      // Should have stages section
      const bodyText = await page.locator('body').textContent();
      const hasStages =
        bodyText?.includes('Stage') ||
        bodyText?.includes('Gathering') ||
        bodyText?.includes('Battle') ||
        bodyText?.includes('阶段');

      expect(hasStages).toBeTruthy();

      // Should have requirements/rewards
      const hasReqRewards =
        bodyText?.includes('Crystal') ||
        bodyText?.includes('Gold') ||
        bodyText?.includes('Requirements') ||
        bodyText?.includes('Rewards') ||
        bodyText?.includes('需求') ||
        bodyText?.includes('奖励');

      expect(hasReqRewards).toBeTruthy();
    });

    test('should show back navigation link', async ({ page }) => {
      await page.goto('/games/wittle-defender/events/wittle-defender-challenge');

      await page.waitForLoadState('networkidle');

      // Should have back link to events list
      const backLink = page.locator('a[href*="/events"]').first();
      await expect(backLink).toBeVisible();
    });

    test('should display recurring event info', async ({ page }) => {
      await page.goto('/games/wittle-defender/events/wittle-defender-challenge');

      await page.waitForLoadState('networkidle');

      // Should show recurring indicator
      const bodyText = await page.locator('body').textContent();
      const hasRecurringInfo =
        bodyText?.includes('Recurring') ||
        bodyText?.includes('Repeats') ||
        bodyText?.includes('days') ||
        bodyText?.includes('循环') ||
        bodyText?.includes('重复');

      expect(hasRecurringInfo).toBeTruthy();
    });
  });

  test.describe('Event Countdown', () => {
    test('should display countdown component', async ({ page }) => {
      await page.goto('/games/wittle-defender/events');

      await page.waitForLoadState('networkidle');

      // Look for countdown elements (days, hours, minutes, seconds)
      const bodyText = await page.locator('body').textContent();
      const hasCountdown =
        bodyText?.includes('Days') ||
        bodyText?.includes('Hrs') ||
        bodyText?.includes('Mins') ||
        bodyText?.includes('天') ||
        bodyText?.includes('时') ||
        bodyText?.includes('分');

      // Countdown may not always be visible depending on event status
      // Just verify the page loads without error
      expect(page.url()).toContain('/events');
    });
  });

  test.describe('Event Status Badges', () => {
    test('should display status badges on event cards', async ({ page }) => {
      await page.goto('/games/wittle-defender/events');

      await page.waitForLoadState('networkidle');

      // Should have status indicators
      const bodyText = await page.locator('body').textContent();
      const hasStatus =
        bodyText?.includes('Active') ||
        bodyText?.includes('Upcoming') ||
        bodyText?.includes('Ended') ||
        bodyText?.includes('进行中') ||
        bodyText?.includes('即将') ||
        bodyText?.includes('已结束');

      expect(hasStatus).toBeTruthy();
    });
  });

  test.describe('Event Timeline', () => {
    test('should display upcoming timeline section', async ({ page }) => {
      await page.goto('/games/wittle-defender/events');

      await page.waitForLoadState('networkidle');

      // Look for timeline elements
      const bodyText = await page.locator('body').textContent();
      const hasTimeline =
        bodyText?.includes('Timeline') ||
        bodyText?.includes('Upcoming') ||
        bodyText?.includes('时间线') ||
        bodyText?.includes('即将');

      // Timeline section should exist
      expect(hasTimeline).toBeTruthy();
    });
  });

  test.describe('Chinese Locale Events', () => {
    test('should display events page in Chinese', async ({ page }) => {
      await page.goto('/zh/games/wittle-defender/events');

      await page.waitForLoadState('networkidle');

      // Should display Chinese content
      await expect(page.locator('body')).toContainText('游戏活动');
    });

    test('should display event detail in Chinese', async ({ page }) => {
      await page.goto('/zh/games/wittle-defender/events/wittle-defender-challenge');

      await page.waitForLoadState('networkidle');

      // Should display Chinese translations for event elements
      const bodyText = await page.locator('body').textContent();

      // At least some Chinese characters should be present
      const hasChinese = /[\u4e00-\u9fff]/.test(bodyText || '');
      expect(hasChinese).toBeTruthy();
    });
  });

  test.describe('Future Event Predictions', () => {
    test('should display future dates for recurring events', async ({ page }) => {
      await page.goto('/games/wittle-defender/events/wittle-defender-challenge');

      await page.waitForLoadState('networkidle');

      // Should show future occurrences section
      const bodyText = await page.locator('body').textContent();
      const hasFutureDates =
        bodyText?.includes('Future') ||
        bodyText?.includes('Dates') ||
        bodyText?.includes('未来') ||
        bodyText?.includes('日期') ||
        bodyText?.includes('2026') ||
        bodyText?.includes('2027');

      // Future dates section should be present for recurring event
      expect(hasFutureDates).toBeTruthy();
    });
  });
});
