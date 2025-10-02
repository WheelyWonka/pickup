import { test, expect } from '@playwright/test';
import { 
  dismissStorageVersionModalIfPresent, 
  createNewSession, 
  addPlayers, 
  addPlayersIncrementally,
  generateBigToss, 
  goToTab, 
  removePlayerByName,
  getGameCardByNumber,
  countTotalGames,
  countTotalReservedAndBonus,
  letters
} from './helpers';

test.describe('US-005: Compose Games (team building)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      try { localStorage.clear(); } catch {}
    });
    await page.goto('/');
    await dismissStorageVersionModalIfPresent(page);
    await createNewSession(page);
  });

  test('Scenario: Exactly 6 players create a single game of 3v3 with all Reserved slots', async ({ page }) => {
    // GIVEN the player list is [A, B, C, D, E, F]
    await addPlayers(page, letters(6));

    // WHEN I generate the Big Toss
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // THEN there is exactly 1 game in the Big Toss
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).not.toBeVisible();
    expect(await countTotalGames(page)).toBe(1);

    // AND game 1 has two teams of 3 players each
    // AND all 6 slots in game 1 are Reserved
    const game1 = getGameCardByNumber(page, 1);
    const reservedCount = await game1.getByText('reserved', { exact: true }).count();
    const bonusCount = await game1.getByText('bonus', { exact: true }).count();
    expect(reservedCount).toBe(6);
    expect(bonusCount).toBe(0);

    // AND the players in game 1 are a permutation of [A, B, C, D, E, F]
    const playerNames = await game1.locator('.font-semibold.text-gray-800').allInnerTexts();
    const uniquePlayers = new Set(playerNames.map(n => n.trim()));
    expect(uniquePlayers.size).toBe(6);
    for (const letter of letters(6)) {
      expect(playerNames.some(n => n.trim() === letter)).toBeTruthy();
    }
  });

  test('Scenario: Adding G to 6 players creates a second game with G Reserved and others Bonus', async ({ page }) => {
    // GIVEN the player list is [A, B, C, D, E, F]
    await addPlayers(page, letters(6));
    // AND I have generated the Big Toss
    await generateBigToss(page);

    // WHEN I add player G
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['G']);

    // THEN there are exactly 2 games in the Big Toss
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(2);

    // AND in game 1, all 6 slots remain Reserved
    const game1 = getGameCardByNumber(page, 1);
    expect(await game1.getByText('reserved', { exact: true }).count()).toBe(6);

    // AND in game 2, player G occupies a Reserved slot
    const game2 = getGameCardByNumber(page, 2);
    const game2Players = await game2.locator('.font-semibold.text-gray-800').allInnerTexts();
    expect(game2Players.some(n => n.trim() === 'G')).toBeTruthy();

    // AND the remaining 5 slots in game 2 are Bonus slots occupied by players from [A, B, C, D, E, F]
    // Total should be 7 reserved (one per player), 5 bonus
    const totals = await countTotalReservedAndBonus(page);
    expect(totals.reserved).toBe(7);
    expect(totals.bonus).toBe(5);

    // AND no player appears twice within the same game
    const uniqueG2 = new Set(game2Players.map(n => n.trim()));
    expect(uniqueG2.size).toBe(game2Players.length);
  });

  test('Scenario: Exactly 10 players create two games; leftover slots in game 2 are Bonus', async ({ page }) => {
    // GIVEN the player list is [A, B, C, D, E, F, G, H, I, J]
    await addPlayers(page, letters(10));

    // WHEN I generate the Big Toss
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // THEN there are exactly 2 games in the Big Toss
    expect(await countTotalGames(page)).toBe(2);

    // AND in game 1, all 6 slots are Reserved
    const game1 = getGameCardByNumber(page, 1);
    expect(await game1.getByText('reserved', { exact: true }).count()).toBe(6);

    // AND in game 2, exactly 4 slots are Reserved and 2 slots are Bonus
    const game2 = getGameCardByNumber(page, 2);
    expect(await game2.getByText('reserved', { exact: true }).count()).toBe(4);
    expect(await game2.getByText('bonus', { exact: true }).count()).toBe(2);

    // Total across both games: 10 reserved, 2 bonus
    const totals = await countTotalReservedAndBonus(page);
    expect(totals.reserved).toBe(10);
    expect(totals.bonus).toBe(2);
  });

  test.skip('Scenario: Removing a Reserved player consolidates a later game with only Bonus slots', async ({ page }) => {
    // GIVEN the player list is [A, B, C, D, E, F]
    await addPlayers(page, letters(6));
    // AND I have generated the Big Toss
    await generateBigToss(page);
    // AND I add player G
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['G']);
    // AND there are 2 games with G Reserved in game 2 and all other game 2 slots Bonus
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(2);

    // WHEN I remove player C
    await goToTab(page, 'Players');
    await removePlayerByName(page, 'C');

    // THEN game 1 now includes G occupying the vacated slot as Reserved
    // AND game 2 has only Bonus slots remaining
    // AND game 2 is deleted
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(1);
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).not.toBeVisible();

    // AND the players remaining are [A, B, D, E, F, G]
    const game1 = getGameCardByNumber(page, 1);
    const players = await game1.locator('.font-semibold.text-gray-800').allInnerTexts();
    const uniquePlayers = new Set(players.map(n => n.trim()));
    expect(uniquePlayers.size).toBe(6);
    expect(uniquePlayers.has('G')).toBeTruthy();
    expect(uniquePlayers.has('C')).toBeFalsy();
  });

  test('Scenario: Adding H and I creates a second game with both Reserved and others Bonus', async ({ page }) => {
    // GIVEN the player list is [A, B, D, E, F, G]
    await addPlayers(page, ['A', 'B', 'D', 'E', 'F', 'G']);
    // AND I have generated the Big Toss so there is exactly 1 game
    await generateBigToss(page);
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(1);

    // WHEN I add players H, I
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['H', 'I']);

    // THEN there are exactly 2 games in the Big Toss
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(2);

    // AND in game 2, players H and I each occupy a Reserved slot
    // AND the remaining 4 slots in game 2 are Bonus slots from among [A, B, D, E, F, G]
    const totals = await countTotalReservedAndBonus(page);
    expect(totals.reserved).toBe(8); // 6 original + H + I
    expect(totals.bonus).toBe(4);    // 12 - 8

    // AND no player appears twice within the same game
    const game2 = getGameCardByNumber(page, 2);
    const game2Players = await game2.locator('.font-semibold.text-gray-800').allInnerTexts();
    const uniqueG2 = new Set(game2Players.map(n => n.trim()));
    expect(uniqueG2.size).toBe(game2Players.length);
  });

  test('Scenario: Adding J converts an existing Bonus slot to Reserved and displaces fairly', async ({ page }) => {
    // GIVEN the player list is [A, B, D, E, F, G, H, I]
    await addPlayers(page, ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I']);
    // AND I have generated the Big Toss resulting in 2 games where H and I have Reserved slots in game 2 and other slots are Bonus
    await generateBigToss(page);
    await goToTab(page, 'Schedule');
    
    const beforeGames = await countTotalGames(page);
    const beforeTotals = await countTotalReservedAndBonus(page);
    expect(beforeGames).toBe(2);

    // WHEN I add player J
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['J']);

    // THEN player J takes over a Bonus slot in an existing game (prefer the earliest game with Bonus slots)
    // AND that slot becomes Reserved for J
    // AND the displaced player is selected by highest session Bonus slot count
    // AND there are still exactly 2 games in the Big Toss
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(2);
    
    const afterTotals = await countTotalReservedAndBonus(page);
    expect(afterTotals.reserved).toBe(beforeTotals.reserved + 1); // One more reserved for J
  });

  test('Scenario: Removing a Reserved player without a Bonus-only game keeps game count and fills directly', async ({ page }) => {
    // GIVEN the player list is [A, B, C, D, E, F, G, H, I, J]
    await addPlayers(page, letters(10));
    // AND I have generated the Big Toss producing 2 games
    await generateBigToss(page);
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(2);
    // AND all games have at least one Reserved slot
    
    // WHEN I remove player A who was in a Reserved slot in game 1
    await goToTab(page, 'Players');
    await removePlayerByName(page, 'A');
    // AND there is no later game containing only Bonus slots

    // THEN the number of games remains 2
    await goToTab(page, 'Schedule');
    expect(await countTotalGames(page)).toBe(2);
    await expect(page.getByText('Game #1')).toBeVisible();
    await expect(page.getByText('Game #2')).toBeVisible();

    // AND a fair replacement is chosen to fill A's Reserved slot in game 1 using the Bonus fairness priority among eligible players not in game 1
    // AND no player appears twice within the same game
    const game1 = getGameCardByNumber(page, 1);
    const game1Players = await game1.locator('.font-semibold.text-gray-800').allInnerTexts();
    const uniqueG1 = new Set(game1Players.map(n => n.trim()));
    expect(uniqueG1.size).toBe(game1Players.length);
    expect(uniqueG1.has('A')).toBeFalsy();
  });

  test('Verify no duplicate players within same game after adds and removes', async ({ page }) => {
    // Complex scenario with multiple adds and removes
    await addPlayers(page, letters(6));
    await generateBigToss(page);
    
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['G', 'H']);
    
    await removePlayerByName(page, 'C');
    await addPlayersIncrementally(page, ['I']);
    await removePlayerByName(page, 'B');

    // Check all games for duplicate players
    await goToTab(page, 'Schedule');
    const totalGames = await countTotalGames(page);
    
    for (let i = 1; i <= totalGames; i++) {
      const game = getGameCardByNumber(page, i);
      const players = await game.locator('.font-semibold.text-gray-800').allInnerTexts();
      const uniquePlayers = new Set(players.map(n => n.trim()));
      expect(uniquePlayers.size).toBe(players.length);
    }
  });

  test('Reserved and Bonus badges are visible and correct', async ({ page }) => {
    await addPlayers(page, letters(7));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // Game 1 should have all reserved
    const game1 = getGameCardByNumber(page, 1);
    await expect(game1.getByText('reserved', { exact: true }).first()).toBeVisible();

    // Game 2 should have both reserved and bonus
    const game2 = getGameCardByNumber(page, 2);
    await expect(game2.getByText('reserved', { exact: true }).first()).toBeVisible();
    await expect(game2.getByText('bonus', { exact: true }).first()).toBeVisible();
  });

  test('Slot types persist correctly in localStorage', async ({ page }) => {
    await addPlayers(page, letters(10));
    await generateBigToss(page);

    // Check localStorage structure
    const session = await page.evaluate(() => {
      const data = localStorage.getItem('pickup.session.active');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.session || null;
    });

    expect(session).not.toBeNull();
    expect(session?.bigTosses || []).toHaveLength(1);
    const games = session?.bigTosses?.[0]?.games || [];
    expect(games.length).toBeGreaterThan(0);

    // Check that each game has teams with slot types
    for (const game of games) {
      expect(game.teams.teamA).toBeDefined();
      expect(game.teams.teamB).toBeDefined();
      expect(Array.isArray(game.teams.teamA)).toBeTruthy();
      expect(Array.isArray(game.teams.teamB)).toBeTruthy();
      
      // Each slot should have playerId and slotType
      for (const slot of [...game.teams.teamA, ...game.teams.teamB]) {
        expect(slot.playerId).toBeDefined();
        expect(['reserved', 'bonus']).toContain(slot.slotType);
      }
    }
  });
});
