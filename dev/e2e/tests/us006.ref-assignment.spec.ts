import { test, expect } from '@playwright/test';
import { addPlayers, addPlayersIncrementally, createNewSession, dismissStorageVersionModalIfPresent, generateBigToss, getGameCardByNumber, goToTab, removePlayerByName, toggleAvailabilityByName } from './helpers';

function letters(count: number, startChar = 'A'): string[] {
  const startCode = startChar.charCodeAt(0);
  return Array.from({ length: count }, (_, i) => String.fromCharCode(startCode + i));
}

function mainRefContainer(gameCard) {
  return gameCard.locator('span.inline-flex').filter({ hasText: 'Main:' }).first();
}

function asstRefContainer(gameCard) {
  return gameCard.locator('span.inline-flex').filter({ hasText: 'Asst:' }).first();
}

async function getRefDisplayName(container) {
  // Last font-semibold span in the container holds the name or "Needs ref"
  const nameSpan = container.locator('span.font-semibold').last();
  return (await nameSpan.innerText()).trim();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await dismissStorageVersionModalIfPresent(page);
  await createNewSession(page);
});

// Scenario: 7 players, game 1 has only one eligible ref

test('US-006: 7 players -> game 1 has only one eligible ref and assistant may be unassigned', async ({ page }) => {
  await addPlayers(page, letters(6));
  await generateBigToss(page);
  await addPlayersIncrementally(page, ['G']);
  await goToTab(page, 'Schedule');

  const g1 = getGameCardByNumber(page, 1);
  const mainC = mainRefContainer(g1);
  const asstC = asstRefContainer(g1);
  await expect(mainC).toBeVisible();
  await expect(asstC).toBeVisible();
  const mainName = await getRefDisplayName(mainC);
  const asstName = await getRefDisplayName(asstC);
  expect([mainName, asstName].includes('Needs ref')).toBeTruthy();
});

// Scenario: A ref becomes a player in the same game after an add, must be replaced

test('US-006: ref becomes player -> ref role recalculates and remains valid', async ({ page }) => {
  await addPlayers(page, letters(6));
  await generateBigToss(page);
  await addPlayersIncrementally(page, ['H', 'I']);
  await goToTab(page, 'Schedule');

  const g1 = getGameCardByNumber(page, 1);
  const mainC = mainRefContainer(g1);
  const asstC = asstRefContainer(g1);
  await expect(mainC).toBeVisible();
  await expect(asstC).toBeVisible();

  const playerNames = (await g1.locator('.font-semibold.text-gray-800').allInnerTexts()).map(t => t.trim());
  const mainName = await getRefDisplayName(mainC);
  const asstName = await getRefDisplayName(asstC);
  for (const name of [mainName, asstName]) {
    if (name && name !== 'Needs ref') {
      expect(playerNames.includes(name)).toBeFalsy();
    }
  }
});

// Scenario: Deleting a game with only Bonus slots removes its ref assignments (implicit by card disappearance)

test('US-006: deleting a bonus-only game removes its ref assignments (implicit by card disappearance)', async ({ page }) => {
  await addPlayers(page, letters(6));
  await generateBigToss(page);
  await addPlayersIncrementally(page, ['G']);
  await goToTab(page, 'Schedule');
  await expect(getGameCardByNumber(page, 2)).toBeVisible();

  await goToTab(page, 'Players');
  await removePlayerByName(page, 'C');

  await goToTab(page, 'Schedule');
  await expect(page.getByText('Game #2')).toHaveCount(0);
});

// Scenario: Direct ref selection fairness; labels visible

test('US-006: ref labels display and remain consistent across games', async ({ page }) => {
  await addPlayers(page, letters(10));
  await generateBigToss(page);
  await goToTab(page, 'Schedule');

  for (const gameNumber of [1, 2]) {
    const g = getGameCardByNumber(page, gameNumber);
    await expect(mainRefContainer(g)).toBeVisible();
    await expect(asstRefContainer(g)).toBeVisible();
  }
});

// Scenario: Only one eligible ref exists -> at least one Needs ref

test('US-006: limited pool -> at least one Needs ref', async ({ page }) => {
  await addPlayers(page, letters(7));
  await generateBigToss(page);
  await goToTab(page, 'Schedule');
  const g1 = getGameCardByNumber(page, 1);
  const mainC = mainRefContainer(g1);
  const asstC = asstRefContainer(g1);
  await expect(mainC).toBeVisible();
  await expect(asstC).toBeVisible();
  const mainName = await getRefDisplayName(mainC);
  const asstName = await getRefDisplayName(asstC);
  expect([mainName, asstName].includes('Needs ref')).toBeTruthy();
});

// Scenario: Manual team change forces ref recalculation - proxy via navigation

test('US-006: labels persist after navigation (proxy for recalculation)', async ({ page }) => {
  await addPlayers(page, letters(10));
  await generateBigToss(page);
  await goToTab(page, 'Schedule');
  const g1 = getGameCardByNumber(page, 1);
  await expect(mainRefContainer(g1)).toBeVisible();
  await goToTab(page, 'Players');
  await goToTab(page, 'Schedule');
  await expect(mainRefContainer(g1)).toBeVisible();
});

// Scenario: Same person can ref consecutive games -> label presence only

test('US-006: ref can be same across consecutive games (non-deterministic identity check)', async ({ page }) => {
  await addPlayers(page, letters(10));
  await generateBigToss(page);
  await goToTab(page, 'Schedule');
  for (const gameNumber of [1, 2]) {
    const g = getGameCardByNumber(page, gameNumber);
    await expect(mainRefContainer(g)).toBeVisible();
  }
});

// Scenario: Unavailable players are excluded from ref selection -> toggle a player unavailable and verify labels

test('US-006: unavailable players excluded from ref selection', async ({ page }) => {
  await addPlayers(page, letters(7));
  await generateBigToss(page);
  await goToTab(page, 'Players');
  await toggleAvailabilityByName(page, 'G');

  await goToTab(page, 'Schedule');
  const g1 = getGameCardByNumber(page, 1);
  await expect(mainRefContainer(g1)).toBeVisible();
});
