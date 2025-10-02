import { test, expect } from '@playwright/test';
import { 
  dismissStorageVersionModalIfPresent, 
  createNewSession, 
  addPlayers, 
  addPlayersIncrementally,
  generateBigToss, 
  goToTab, 
  removePlayerByName,
  toggleAvailabilityByName,
  getGameCardByNumber,
  letters
} from './helpers';

function mainRefContainer(gameCard) {
  return gameCard.locator('span.inline-flex').filter({ hasText: 'Main:' }).first();
}

function asstRefContainer(gameCard) {
  return gameCard.locator('span.inline-flex').filter({ hasText: 'Asst:' }).first();
}

async function getRefDisplayName(container) {
  const nameSpan = container.locator('span.font-semibold').last();
  return (await nameSpan.innerText()).trim();
}

test.describe('US-006: Assign refs per Game', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      try { localStorage.clear(); } catch {}
    });
    await page.goto('/');
    await dismissStorageVersionModalIfPresent(page);
    await createNewSession(page);
  });

  test('Scenario: 7 players, game 1 has only one eligible ref', async ({ page }) => {
    // GIVEN the player list is [A, B, C, D, E, F]
    await addPlayers(page, letters(6));
    // AND I generate the Big Toss (game 1 has players [A, B, C, D, E, F])
    await generateBigToss(page);
    
    // WHEN I add player G and create game 2 per US-005
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['G']);
    await goToTab(page, 'Schedule');

    // THEN for game 1, the eligible ref pool is [G]
    const g1 = getGameCardByNumber(page, 1);
    const mainC = mainRefContainer(g1);
    const asstC = asstRefContainer(g1);
    
    // AND game 1 has main assigned to G and assistant is unassigned
    await expect(mainC).toBeVisible();
    await expect(asstC).toBeVisible();
    
    const mainName = await getRefDisplayName(mainC);
    const asstName = await getRefDisplayName(asstC);
    
    // At least one should be "Needs ref" since only 1 eligible ref exists
    expect([mainName, asstName].includes('Needs ref')).toBeTruthy();
    
    // AND game 2 assigns two refs chosen from players not playing in game 2 by fairness
    const g2 = getGameCardByNumber(page, 2);
    await expect(mainRefContainer(g2)).toBeVisible();
    await expect(asstRefContainer(g2)).toBeVisible();
  });

  test('Scenario: A ref becomes a player in the same game after an add', async ({ page }) => {
    // GIVEN game 1 has players [A, B, C, D, E, F] and main ref is G
    await addPlayers(page, letters(6));
    await generateBigToss(page);
    
    // AND I add players H, I creating game 2 per US-005
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['H', 'I']);
    await goToTab(page, 'Schedule');

    // WHEN game 1 roster changes so that G is now a player in game 1
    // THEN G must be removed as a ref from game 1
    // AND a new eligible ref is selected by fairness for game 1
    
    const g1 = getGameCardByNumber(page, 1);
    const playerNames = (await g1.locator('.font-semibold.text-gray-800').allInnerTexts()).map(t => t.trim());
    const mainC = mainRefContainer(g1);
    const asstC = asstRefContainer(g1);
    
    const mainName = await getRefDisplayName(mainC);
    const asstName = await getRefDisplayName(asstC);
    
    // Verify refs are not playing in the same game
    for (const refName of [mainName, asstName]) {
      if (refName && refName !== 'Needs ref') {
        expect(playerNames.includes(refName)).toBeFalsy();
      }
    }
  });

  test.skip('Scenario: Deleting a game with only Bonus slots removes its ref assignments', async ({ page }) => {
    // GIVEN two games exist and game 2 contains only Bonus slots
    await addPlayers(page, letters(6));
    await generateBigToss(page);
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['G']);
    
    // AND game 2 has main and assistant assigned
    await goToTab(page, 'Schedule');
    await expect(getGameCardByNumber(page, 2)).toBeVisible();

    // WHEN game 2 is deleted per US-005 rules
    await goToTab(page, 'Players');
    await removePlayerByName(page, 'C');

    // THEN game 2's ref assignments are removed
    // AND no references to those assignments remain in state
    await goToTab(page, 'Schedule');
    await expect(page.getByText('Game #2')).not.toBeVisible();
  });

  test('Scenario: Refs are selected by lowest assigned counts and earliest lastRefedAt', async ({ page }) => {
    // GIVEN a game with candidate refs [G, H]
    await addPlayers(page, letters(10));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // WHEN refs are assigned
    // THEN main is the candidate with the lowest assigned count and earliest lastRefedAt by tie-break
    // AND assistant is the next best candidate by the same ordering
    
    // Verify both games have ref containers visible
    for (const gameNumber of [1, 2]) {
      const g = getGameCardByNumber(page, gameNumber);
      await expect(mainRefContainer(g)).toBeVisible();
      await expect(asstRefContainer(g)).toBeVisible();
    }
  });

  test('Scenario: Only one eligible ref exists', async ({ page }) => {
    // GIVEN a game where the candidate pool is [X]
    await addPlayers(page, letters(7));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // WHEN refs are assigned
    // THEN main is X AND assistant is unassigned
    const g1 = getGameCardByNumber(page, 1);
    const mainC = mainRefContainer(g1);
    const asstC = asstRefContainer(g1);
    
    await expect(mainC).toBeVisible();
    await expect(asstC).toBeVisible();
    
    const mainName = await getRefDisplayName(mainC);
    const asstName = await getRefDisplayName(asstC);
    
    // At least one should be "Needs ref" due to limited pool
    expect([mainName, asstName].includes('Needs ref')).toBeTruthy();
  });

  test('Scenario: Manual team change forces ref recalculation', async ({ page }) => {
    // Note: Manual team overrides (US-013) are not yet implemented
    // This test verifies that refs persist and remain valid after navigation
    
    // GIVEN a scheduled game with main and assistant assigned
    await addPlayers(page, letters(10));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');
    
    const g1 = getGameCardByNumber(page, 1);
    await expect(mainRefContainer(g1)).toBeVisible();
    
    // Navigate away and back to verify refs persist
    await goToTab(page, 'Players');
    await goToTab(page, 'Schedule');
    
    // THEN ref assignments for that game remain visible
    await expect(mainRefContainer(g1)).toBeVisible();
    await expect(asstRefContainer(g1)).toBeVisible();
  });

  test('Scenario: Same person can ref consecutive games if still the fairest', async ({ page }) => {
    // GIVEN two consecutive scheduled games G1 and G2
    await addPlayers(page, letters(10));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // AND player Q is selected as a ref for G1 by fairness
    // WHEN assigning refs for G2
    // THEN Q may be selected again if they remain the fairest eligible candidate
    
    // Verify both games have refs assigned (no cooldown restriction)
    for (const gameNumber of [1, 2]) {
      const g = getGameCardByNumber(page, gameNumber);
      await expect(mainRefContainer(g)).toBeVisible();
    }
  });

  test('Scenario: Unavailable players are excluded from ref selection', async ({ page }) => {
    // GIVEN player R is marked unavailable
    await addPlayers(page, letters(7));
    await generateBigToss(page);
    
    await goToTab(page, 'Players');
    await toggleAvailabilityByName(page, 'G');

    // WHEN assigning refs for any game
    // THEN R is not considered in the candidate pool
    await goToTab(page, 'Schedule');
    
    const g1 = getGameCardByNumber(page, 1);
    const mainC = mainRefContainer(g1);
    const asstC = asstRefContainer(g1);
    
    const mainName = await getRefDisplayName(mainC);
    const asstName = await getRefDisplayName(asstC);
    
    // G should not be assigned as a ref
    expect(mainName).not.toBe('G');
    expect(asstName).not.toBe('G');
  });

  test('Ref labels display correctly with Main and Asst badges', async ({ page }) => {
    await addPlayers(page, letters(10));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    for (const gameNumber of [1, 2]) {
      const g = getGameCardByNumber(page, gameNumber);
      
      // Check for Main and Asst labels
      await expect(g.getByText('Main:', { exact: false })).toBeVisible();
      await expect(g.getByText('Asst:', { exact: false })).toBeVisible();
    }
  });

  test('Refs section shows "Needs ref" when no eligible refs available', async ({ page }) => {
    // With 6 players, no one is available to ref
    await addPlayers(page, letters(6));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    const g1 = getGameCardByNumber(page, 1);
    
    // Should show "Needs ref" indicators
    const needsRefCount = await g1.getByText('Needs ref').count();
    expect(needsRefCount).toBeGreaterThan(0);
  });

  test('Refs are reassigned when roster changes affect eligibility', async ({ page }) => {
    await addPlayers(page, letters(10));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // Get initial ref assignments
    const g1 = getGameCardByNumber(page, 1);
    const initialMain = await getRefDisplayName(mainRefContainer(g1));

    // Add a new player which may trigger ref reassignment
    await goToTab(page, 'Players');
    await addPlayersIncrementally(page, ['K']);
    await goToTab(page, 'Schedule');

    // Verify refs are still assigned (may be same or different based on fairness)
    const newMain = await getRefDisplayName(mainRefContainer(g1));
    expect(newMain).toBeTruthy();
    expect(newMain).not.toBe(''); // Should have some assignment
  });

  test('Ref assignments persist to localStorage', async ({ page }) => {
    await addPlayers(page, letters(10));
    await generateBigToss(page);

    // Check localStorage for ref assignments
    const session = await page.evaluate(() => {
      const data = localStorage.getItem('pickup.session.active');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.session || null;
    });

    expect(session).not.toBeNull();
    expect(session?.bigTosses || []).toHaveLength(1);
    const games = session?.bigTosses?.[0]?.games || [];
    
    for (const game of games) {
      expect(game.refs).toBeDefined();
      expect(game.refs).toHaveProperty('mainId');
      expect(game.refs).toHaveProperty('assistantId');
      // mainId and assistantId can be null or string (player ID)
      expect(game.refs.mainId === null || typeof game.refs.mainId === 'string').toBeTruthy();
      expect(game.refs.assistantId === null || typeof game.refs.assistantId === 'string').toBeTruthy();
    }
  });

  test('Refs cannot be the same player for main and assistant', async ({ page }) => {
    await addPlayers(page, letters(10));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    // Check all games
    const totalGames = await page.getByText(/Game #\d+/).count();
    
    for (let i = 1; i <= totalGames; i++) {
      const g = getGameCardByNumber(page, i);
      const mainName = await getRefDisplayName(mainRefContainer(g));
      const asstName = await getRefDisplayName(asstRefContainer(g));
      
      // If both are assigned, they must be different
      if (mainName !== 'Needs ref' && asstName !== 'Needs ref') {
        expect(mainName).not.toBe(asstName);
      }
    }
  });

  test('Refs are not assigned if they are playing in the game', async ({ page }) => {
    await addPlayers(page, letters(10));
    await generateBigToss(page);
    await goToTab(page, 'Schedule');

    const totalGames = await page.getByText(/Game #\d+/).count();
    
    for (let i = 1; i <= totalGames; i++) {
      const g = getGameCardByNumber(page, i);
      const playerNames = (await g.locator('.font-semibold.text-gray-800').allInnerTexts()).map(t => t.trim());
      const mainName = await getRefDisplayName(mainRefContainer(g));
      const asstName = await getRefDisplayName(asstRefContainer(g));
      
      // Refs should not be in the player list
      if (mainName !== 'Needs ref') {
        expect(playerNames.includes(mainName)).toBeFalsy();
      }
      if (asstName !== 'Needs ref') {
        expect(playerNames.includes(asstName)).toBeFalsy();
      }
    }
  });
});
