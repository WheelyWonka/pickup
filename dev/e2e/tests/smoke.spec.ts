import { test, expect } from '@playwright/test';

// Ensure a clean localStorage for each test run
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.clear(); } catch {}
  });
});

test('create session, add players, generate Big Toss and see schedule', async ({ page }) => {
  await page.goto('/');

  // Dismiss storage version modal if it appears
  const acknowledge = page.getByRole('button', { name: 'I understand' });
  if (await acknowledge.isVisible().catch(() => false)) {
    await acknowledge.click();
  }

  // Create a new session
  await page.getByRole('button', { name: 'Create new session' }).click();
  await expect(page.getByText('Player Roster (0)')).toBeVisible();

  // Add 6 players using the input + Enter to submit the form
  const input = page.getByPlaceholder('Enter player name...');
  for (const name of ['A', 'B', 'C', 'D', 'E', 'F']) {
    await input.fill(name);
    await input.press('Enter');
  }
  await expect(page.getByText('Player Roster (6)')).toBeVisible();

  // Generate Big Toss
  const generate = page.getByRole('button', { name: 'Generate Big Toss' });
  await expect(generate).toBeEnabled();
  await generate.click();

  // Switch to Schedule tab
  await page.getByRole('button', { name: 'Schedule' }).click();

  // Basic assertions on schedule
  await expect(page.getByText('Game #1')).toBeVisible();
  await expect(page.getByText('Referees')).toBeVisible();
  await expect(page.getByText('Needs ref').first()).toBeVisible();
});
