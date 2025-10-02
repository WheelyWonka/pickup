import { expect, Locator, Page } from '@playwright/test';

export async function dismissStorageVersionModalIfPresent(page: Page): Promise<void> {
  const acknowledge = page.getByRole('button', { name: 'I understand' });
  if (await acknowledge.isVisible().catch(() => false)) {
    await acknowledge.click();
  }
}

export async function createNewSession(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Create new session' }).click();
  await expect(page.getByText('Player Roster (0)')).toBeVisible();
}

export async function addPlayers(page: Page, playerNames: string[]): Promise<void> {
  const input = page.getByPlaceholder('Enter player name...');
  for (const name of playerNames) {
    await input.fill(name);
    await input.press('Enter');
  }
  await expect(page.getByText(`Player Roster (${playerNames.length})`)).toBeVisible();
}

export async function addPlayersIncrementally(page: Page, playerNames: string[]): Promise<void> {
  const input = page.getByPlaceholder('Enter player name...');
  let expectedCount = Number((await page.getByText(/Player Roster \(/).innerText()).match(/Player Roster \((\d+)\)/)?.[1] ?? '0');
  for (const name of playerNames) {
    await input.fill(name);
    await input.press('Enter');
    expectedCount += 1;
    await expect(page.getByText(`Player Roster (${expectedCount})`)).toBeVisible();
  }
}

export async function generateBigToss(page: Page): Promise<void> {
  const button = page.getByRole('button', { name: 'Generate Big Toss' });
  await expect(button).toBeEnabled();
  await button.click();
}

export async function goToTab(page: Page, tabLabel: 'Players' | 'Schedule' | 'Stats'): Promise<void> {
  if (tabLabel === 'Stats') {
    // Stats button doesn't have a count, just "Stats"
    await page.getByRole('button', { name: 'Stats' }).click();
  } else {
    // Players and Schedule buttons include counts (e.g., "Players 6", "Schedule 1")
    await page.getByRole('button', { name: new RegExp(`^${tabLabel} \\d+$`) }).click();
  }
}

export function getGameCardByNumber(page: Page, gameNumber: number): Locator {
  // Find the span that exactly matches the game header, then climb to the nearest card container
  const header = page.locator('span', { hasText: `Game #${gameNumber}` }).first();
  const card = header.locator('xpath=ancestor::div[contains(@class, "rounded-xl") and contains(@class, "border")][1]');
  return card;
}

export async function getNamesInGameCard(gameCard: Locator): Promise<string[]> {
  const nameLocators = gameCard.locator('.font-semibold.text-gray-800');
  const count = await nameLocators.count();
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    names.push((await nameLocators.nth(i).innerText()).trim());
  }
  return names;
}

export async function countBadge(gameCard: Locator, text: 'reserved' | 'bonus'): Promise<number> {
  return await gameCard.getByText(text, { exact: true }).count();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function removePlayerByName(page: Page, playerName: string): Promise<void> {
  // Find the player name text and get its parent container
  const playerNameElement = page.getByText(new RegExp(`^${escapeRegExp(playerName)}$`));
  const playerRow = playerNameElement.locator('xpath=ancestor::div[contains(@class, "px-4") and contains(@class, "py-3")][1]');
  
  // Just click the remove button - dialog handling should be done by the test
  await playerRow.getByTitle('Remove player').click();
}

export async function toggleAvailabilityByName(page: Page, playerName: string): Promise<void> {
  // Find the player name text and get its parent container
  const playerNameElement = page.getByText(new RegExp(`^${escapeRegExp(playerName)}$`));
  const playerRow = playerNameElement.locator('xpath=ancestor::div[contains(@class, "px-4") and contains(@class, "py-3")][1]');
  
  await playerRow.getByRole('button', { name: /Mark as/ }).click();
}

export async function countTotalGames(page: Page): Promise<number> {
  return await page.getByText(/Game #\d+/).count();
}

export async function countTotalReservedAndBonus(page: Page): Promise<{ reserved: number; bonus: number }>{
  const reserved = await page.getByText('reserved', { exact: true }).count();
  const bonus = await page.getByText('bonus', { exact: true }).count();
  return { reserved, bonus };
}

export function letters(count: number, startChar = 'A'): string[] {
  const startCode = startChar.charCodeAt(0);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i < 26) {
      // A-Z
      names.push(String.fromCharCode(startCode + i));
    } else {
      // AA, AB, AC, etc.
      const firstChar = String.fromCharCode(startCode + Math.floor(i / 26) - 1);
      const secondChar = String.fromCharCode(startCode + (i % 26));
      names.push(firstChar + secondChar);
    }
  }
  return names;
}
