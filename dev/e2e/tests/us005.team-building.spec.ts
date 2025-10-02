import { test, expect } from '@playwright/test';
import { addPlayers, addPlayersIncrementally, countTotalGames, countTotalReservedAndBonus, createNewSession, dismissStorageVersionModalIfPresent, generateBigToss, getGameCardByNumber, goToTab, removePlayerByName } from './helpers';

// Utility to add named players A..Z style
function letters(count: number, startChar = 'A'): string[] {
  const startCode = startChar.charCodeAt(0);
  return Array.from({ length: count }, (_, i) => String.fromCharCode(startCode + i));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await dismissStorageVersionModalIfPresent(page);
  await createNewSession(page);
});

// case 1: Exactly 6 players create a single game of 3v3 with all Reserved slots
test('US-005 case 1: 6 players -> 1 game, all Reserved', async ({ page }) => {
  await addPlayers(page, letters(6));
  await generateBigToss(page);
  await goToTab(page, 'Schedule');
  await expect(page.getByText('Game #1')).toBeVisible();
  await expect(page.getByText('Game #2')).toHaveCount(0);
  const game1 = getGameCardByNumber(page, 1);
  await expect(game1.getByText('reserved')).toHaveCount(6);
  await expect(game1.getByText('bonus')).toHaveCount(0);
});

// case 2: Adding G to 6 players creates a second game with G Reserved and others Bonus
// We assert that there are 2 games and total slot counts reflect 7 players with 1 reserved per player and remaining as bonus
test('US-005 case 2: add 7th -> 2 games; totals match 7 players (reserved=7, bonus=5)', async ({ page }) => {
  await addPlayers(page, letters(6));
  await generateBigToss(page);
  await addPlayersIncrementally(page, ['G']);
  await goToTab(page, 'Schedule');

  expect(await countTotalGames(page)).toBe(2);
  const totals = await countTotalReservedAndBonus(page);
  expect(totals.reserved).toBe(7); // each player has one reserved across the Big Toss
  expect(totals.bonus).toBe(5);    // 12 - 7 = 5 bonus slots across 2 games
});

// case: 10 players -> 2 games; second game has 4 Reserved, 2 Bonus
// We assert totals: reserved=10, bonus=2 across schedule
test('US-005 case: 10 players -> 2 games; totals reserved=10, bonus=2', async ({ page }) => {
  await addPlayers(page, letters(10));
  await generateBigToss(page);
  await goToTab(page, 'Schedule');

  expect(await countTotalGames(page)).toBe(2);
  const totals = await countTotalReservedAndBonus(page);
  expect(totals.reserved).toBe(10);
  expect(totals.bonus).toBe(2);
});

// case: Removing C after adding G consolidates and deletes bonus-only game
test('US-005 case: remove reserved leads to consolidate and delete bonus-only game', async ({ page }) => {
  await addPlayers(page, letters(6));
  await generateBigToss(page);
  await addPlayersIncrementally(page, ['G']);

  // Remove C with confirm dialog
  await goToTab(page, 'Players');
  await removePlayerByName(page, 'C');

  await goToTab(page, 'Schedule');
  await expect(page.getByText('Game #2')).toHaveCount(0);
  await expect(page.getByText('Game #1')).toBeVisible();
});

// case: From 6 players add H and I -> second game with both Reserved and others Bonus
// We assert totals: reserved equals number of players (8) and bonus equals 4 (12 - 8)
test('US-005 case: add H and I -> totals reserved=8, bonus=4', async ({ page }) => {
  await addPlayers(page, ['A', 'B', 'D', 'E', 'F', 'G']);
  await generateBigToss(page);
  await addPlayersIncrementally(page, ['H', 'I']);
  await goToTab(page, 'Schedule');

  expect(await countTotalGames(page)).toBe(2);
  const totals = await countTotalReservedAndBonus(page);
  expect(totals.reserved).toBe(8);
  expect(totals.bonus).toBe(4);
});

// case: Adding J converts an existing Bonus slot to Reserved and displaces fairly
// We assert that games remain 2 and total reserved increases by 1 after adding J
test('US-005 case: add J converts a bonus to reserved, remains 2 games (totals +1 reserved)', async ({ page }) => {
  await addPlayers(page, ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I']);
  await generateBigToss(page);
  await goToTab(page, 'Schedule');

  const before = await countTotalReservedAndBonus(page);
  expect(await countTotalGames(page)).toBe(2);

  await goToTab(page, 'Players');
  await addPlayersIncrementally(page, ['J']);
  await goToTab(page, 'Schedule');

  expect(await countTotalGames(page)).toBe(2);
  const after = await countTotalReservedAndBonus(page);
  expect(after.reserved).toBe(before.reserved + 1);
});

// case: Removing a Reserved player without bonus-only collapse -> direct replacement, keep games count
test('US-005 case: remove reserved with no bonus-only -> keep 2 games, fill directly', async ({ page }) => {
  await addPlayers(page, letters(10));
  await generateBigToss(page);
  await goToTab(page, 'Players');
  await removePlayerByName(page, 'A');
  await goToTab(page, 'Schedule');
  await expect(page.getByText('Game #1')).toBeVisible();
  await expect(page.getByText('Game #2')).toBeVisible();
  // Roster integrity: no duplicate names within Game #1
  const namesG1 = await getGameCardByNumber(page, 1).locator('.font-semibold.text-gray-800').allInnerTexts();
  const uniqueG1 = new Set(namesG1.map(n => n.trim()));
  expect(uniqueG1.size).toBe(namesG1.length);
});
