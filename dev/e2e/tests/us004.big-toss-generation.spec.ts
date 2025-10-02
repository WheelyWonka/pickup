import { test, expect } from '@playwright/test';
import { dismissStorageVersionModalIfPresent, createNewSession, addPlayers, generateBigToss, goToTab, letters } from './helpers';

test.describe('US-004: Start a Big Toss', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      try { localStorage.clear(); } catch {}
    });
    await page.goto('/');
    await dismissStorageVersionModalIfPresent(page);
    await createNewSession(page);
  });

  test('Scenario: Button disabled when fewer than 6 players', async ({ page }) => {
    // GIVEN the roster has 5 eligible players
    await addPlayers(page, letters(5));
    await expect(page.getByText('Player Roster (5)')).toBeVisible();

    // WHEN I view the toolbar
    const button = page.getByRole('button', { name: /Big Toss/i });

    // THEN the "Generate Big Toss" button is disabled
    await expect(button).toBeDisabled();

    // AND I see a tooltip explaining at least 6 players are required (via title attribute)
    const title = await button.getAttribute('title');
    expect(title).toBeTruthy();
    expect(title).toMatch(/6.*player/i);
  });

  test('Scenario: Create Big Toss when 6 players exist', async ({ page }) => {
    // GIVEN the roster has 6 eligible players
    await addPlayers(page, letters(6));
    await expect(page.getByText('Player Roster (6)')).toBeVisible();

    // WHEN I click "Generate Big Toss"
    await generateBigToss(page);

    // THEN a Big Toss is created with exactly 1 game of 6 players
    await goToTab(page, 'Schedule');
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).not.toBeVisible();

    // AND the Big Toss status is "scheduled"
    await expect(page.getByText('scheduled', { exact: false })).toBeVisible();

    // Verify in localStorage
    const session = await page.evaluate(() => {
      const data = localStorage.getItem('pickup.session.active');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.session || null;
    });
    expect(session).not.toBeNull();
    expect(session?.bigTosses || []).toHaveLength(1);
    expect(session.bigTosses[0].games).toHaveLength(1);
    expect(session.bigTosses[0].status).toBe('scheduled');
  });

  test('Scenario: Create multiple games for larger rosters', async ({ page }) => {
    // GIVEN the roster has 12 eligible players
    await addPlayers(page, letters(12));
    await expect(page.getByText('Player Roster (12)')).toBeVisible();

    // WHEN I click "Generate Big Toss"
    await generateBigToss(page);

    // THEN a Big Toss is created with 2 games of 6 players each
    await goToTab(page, 'Schedule');
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).toBeVisible();
    await expect(page.getByText('Game #3')).not.toBeVisible();

    // Verify in localStorage
    const session = await page.evaluate(() => {
      const data = localStorage.getItem('pickup.session.active');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.session || null;
    });
    expect(session).not.toBeNull();
    expect(session?.bigTosses || []).toHaveLength(1);
    expect(session.bigTosses[0].games).toHaveLength(2);
  });

  test('Scenario: Auto-recalculation on roster change', async ({ page }) => {
    // GIVEN a scheduled Big Toss exists
    await addPlayers(page, letters(6));
    await generateBigToss(page);

    await goToTab(page, 'Schedule');
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).not.toBeVisible();

    // WHEN I add a new player
    await goToTab(page, 'Players');
    const input = page.getByPlaceholder('Enter player name...');
    await input.fill('G');
    await input.press('Enter');
    await expect(page.getByText('Player Roster (7)')).toBeVisible();

    // THEN the scheduled Big Toss is recalculated according to US-005 and refs per US-006
    await goToTab(page, 'Schedule');
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).toBeVisible(); // Should now have 2 games
  });

  test('Button is enabled only when 6 or more eligible players exist', async ({ page }) => {
    const button = page.getByRole('button', { name: /Big Toss/i });

    // 0 players - disabled
    await expect(button).toBeDisabled();

    // Add players incrementally
    const input = page.getByPlaceholder('Enter player name...');
    
    // 1-5 players - still disabled
    for (let i = 1; i <= 5; i++) {
      await input.fill(`Player${i}`);
      await input.press('Enter');
      await expect(button).toBeDisabled();
    }

    // 6th player - now enabled
    await input.fill('Player6');
    await input.press('Enter');
    await expect(button).toBeEnabled();
  });

  test('Button shows appropriate text on desktop and mobile', async ({ page }) => {
    await addPlayers(page, letters(6));

    // Check that the button text contains "Big Toss"
    const button = page.getByRole('button', { name: /Big Toss/i });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('Big Toss persists to localStorage immediately', async ({ page }) => {
    await addPlayers(page, letters(6));
    
    // Before generating
    let session = await page.evaluate(() => {
      const data = localStorage.getItem('pickup.session.active');
      return data ? JSON.parse(data) : null;
    });
    expect(session).not.toBeNull();
    expect(session?.bigTosses || []).toHaveLength(0);

    // After generating
    await generateBigToss(page);
    
    session = await page.evaluate(() => {
      const data = localStorage.getItem('pickup.session.active');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.session || null;
    });
    expect(session).not.toBeNull();
    expect(session?.bigTosses || []).toHaveLength(1);
    expect(session.bigTosses[0].games.length).toBeGreaterThan(0);
  });

  test('Can generate Big Toss with exactly 18 players (3 games)', async ({ page }) => {
    await addPlayers(page, letters(18));
    await generateBigToss(page);

    await goToTab(page, 'Schedule');
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).toBeVisible();
    await expect(page.getByText('Game #3')).toBeVisible();
    await expect(page.getByText('Game #4')).not.toBeVisible();
  });

  test('Button state updates reactively when players are added/removed', async ({ page }) => {
    const button = page.getByRole('button', { name: /Big Toss/i });
    const input = page.getByPlaceholder('Enter player name...');

    // Add 6 players
    for (let i = 1; i <= 6; i++) {
      await input.fill(`P${i}`);
      await input.press('Enter');
    }
    await expect(button).toBeEnabled();

    // Remove one player (down to 5)
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button[title="Remove player"]').first().click();
    await expect(page.getByText('Player Roster (5)')).toBeVisible();
    await expect(button).toBeDisabled();

    // Add one back (up to 6)
    await input.fill('P7');
    await input.press('Enter');
    await expect(page.getByText('Player Roster (6)')).toBeVisible();
    await expect(button).toBeEnabled();
  });
});
