import { test, expect } from '@playwright/test';
import { dismissStorageVersionModalIfPresent, createNewSession, addPlayers, generateBigToss, goToTab, letters } from './helpers';

test.describe('US-002: View Session dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      try { localStorage.clear(); } catch {}
    });
    await page.goto('/');
    await dismissStorageVersionModalIfPresent(page);
    await createNewSession(page);
  });

  test('Scenario: Dashboard shows empty states', async ({ page }) => {
    // GIVEN there is an active Session with no players and no Big Toss
    await expect(page.getByText('Player Roster (0)')).toBeVisible();

    // WHEN I open the dashboard (default view is Players tab)
    // THEN I see empty state messages for Players
    await expect(page.getByText('No players added yet')).toBeVisible();
    await expect(page.getByText('Add players to start building your roster')).toBeVisible();

    // Schedule tab empty state
    await goToTab(page, 'Schedule');
    await expect(page.getByText(/no big toss/i)).toBeVisible();

    // Stats tab empty state - shows table headers but no data rows
    await goToTab(page, 'Stats');
    await expect(page.getByRole('heading', { name: 'Player Session Stats' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Player' })).toBeVisible();
    // Table should be empty (no data rows)
    const dataRows = page.locator('tbody tr');
    expect(await dataRows.count()).toBe(0);
  });

  test('Scenario: Counts reflect current roster and assignments', async ({ page }) => {
    // GIVEN there is an active Session with players [A, B, C, D, E, F]
    await addPlayers(page, letters(6));

    // AND I generate a Big Toss
    await generateBigToss(page);

    // WHEN I open the dashboard
    await goToTab(page, 'Players');

    // THEN the total player count is 6
    await expect(page.getByText('Player Roster (6)')).toBeVisible();
    
    // Check player stats cards - look for the actual text in the overview section
    await expect(page.getByText('6 Players')).toBeVisible(); // In the overview section
    await expect(page.getByText('1 Big Tosses')).toBeVisible(); // In the overview section

    // AND the "currently playing" count reflects scheduled game assignments
    // AND the "currently reffing" count is shown (may be 0 if refs are unassigned due to pool size)
    await expect(page.getByText('Total Players')).toBeVisible();
    await expect(page.getByText('Active Players')).toBeVisible();
    await expect(page.getByText('Currently Playing')).toBeVisible();
    await expect(page.getByText('Currently Reffing')).toBeVisible();
  });

  test('Scenario: Big Toss games are listed with statuses', async ({ page }) => {
    // GIVEN a Big Toss exists with 2 games
    await addPlayers(page, letters(12));
    await generateBigToss(page);

    // WHEN I view the Schedule tab
    await goToTab(page, 'Schedule');

    // THEN I see both games in order with their statuses displayed as badges
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).toBeVisible();
    
    // Check for status badges (scheduled is the default initial state)
    const statusBadges = page.getByText('scheduled', { exact: false });
    expect(await statusBadges.count()).toBeGreaterThanOrEqual(1);
  });

  test('Scenario: Stats card shows aggregate indicators', async ({ page }) => {
    // GIVEN at least one Big Toss has been generated
    await addPlayers(page, letters(6));
    await generateBigToss(page);

    // WHEN I open the Stats tab
    await goToTab(page, 'Stats');

    // THEN I see aggregate indicators such as player stats
    // Check that the stats table is present with the correct heading
    await expect(page.getByRole('heading', { name: 'Player Session Stats' })).toBeVisible();
    
    // Check for the stats table headers
    await expect(page.getByRole('cell', { name: 'Player' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Games' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Reserved' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bonus' })).toBeVisible();
  });

  test('Dashboard tabs are clickable and show correct content', async ({ page }) => {
    // Given a session with players and a Big Toss
    await addPlayers(page, letters(6));
    await generateBigToss(page);

    // Players tab
    await goToTab(page, 'Players');
    await expect(page.getByText('Player Roster (6)')).toBeVisible();

    // Schedule tab
    await goToTab(page, 'Schedule');
    await expect(page.getByText('Game #1')).toBeVisible();

    // Stats tab
    await goToTab(page, 'Stats');
    await expect(page.getByRole('heading', { name: 'Player Session Stats' })).toBeVisible();
  });
});
