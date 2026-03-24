import { expect, test } from '@playwright/test';

test('loads the workbench and opens the agent drawer in browser preview mode', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '有什么我可以帮你的？' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Files/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Session/ })).toBeVisible();

  await page.getByRole('button', { name: /Session/ }).click();
  await expect(page.getByText('agent:main:main').first()).toBeVisible();
});
