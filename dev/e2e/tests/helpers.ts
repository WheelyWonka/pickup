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
  await page.getByRole('button', { name: tabLabel }).click();
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

function playerNameSpan(page: Page, name: string): Locator {
  return page.locator('span.font-semibold.text-gray-900', { hasText: new RegExp(`^${escapeRegExp(name)}$`) }).first();
}

export async function removePlayerByName(page: Page, playerName: string): Promise<void> {
  const nameSpan = playerNameSpan(page, playerName);
  const row = nameSpan.locator('xpath=ancestor::div[contains(@class, "px-4") and contains(@class, "py-3")][1]');
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await row.getByTitle('Remove player').click();
}

export async function toggleAvailabilityByName(page: Page, playerName: string): Promise<void> {
  const nameSpan = playerNameSpan(page, playerName);
  const row = nameSpan.locator('xpath=ancestor::div[contains(@class, "px-4") and contains(@class, "py-3")][1]');
  await row.locator('button[title^="Mark"]').first().click();
}

export async function countTotalGames(page: Page): Promise<number> {
  return await page.getByText(/Game #\d+/).count();
}

export async function countTotalReservedAndBonus(page: Page): Promise<{ reserved: number; bonus: number }>{
  const reserved = await page.getByText('reserved', { exact: true }).count();
  const bonus = await page.getByText('bonus', { exact: true }).count();
  return { reserved, bonus };
}
