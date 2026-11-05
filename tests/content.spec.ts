import { test, expect } from './fixtures';

test('services page describes the three core offerings', async ({ page }) => {
  await page.goto('/services');
  for (const service of ['Web Development', 'Web Hosting', 'Software Testing']) {
    await expect(page.locator('main').getByRole('heading', { name: service, exact: true }).first()).toBeVisible();
  }
});

test('FAQ reveals an answer and collapses again', async ({ page }) => {
  await page.goto('/');
  const question = page.getByRole('button', { name: 'What services does M Tech Corp offer?' });
  await expect(question).toHaveAttribute('aria-expanded', 'false');
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  const answer = page.getByRole('region', { name: 'What services does M Tech Corp offer?' });
  await expect(answer).toBeVisible();
  await expect(answer).toContainText(/web development/i);
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'false');
  await expect(answer).toBeHidden();
});

test('portfolio search narrows projects and restores them when cleared', async ({ page }) => {
  await page.goto('/portfolio');
  const search = page.getByPlaceholder('Search projects...');
  const match = page.getByRole('heading', { name: 'Data & Cybersecurity Limited', exact: true });
  const other = page.getByRole('heading', { name: 'AutoLuv Service Center', exact: true });
  await expect(match).toBeVisible();
  await expect(other).toBeVisible();
  await search.fill('Data & Cybersecurity');
  await expect(match).toBeVisible();
  await expect(other).toBeHidden();
  await search.clear();
  await expect(other).toBeVisible();
});

test('portfolio search handles no matches', async ({ page }) => {
  await page.goto('/portfolio');
  await page.getByPlaceholder('Search projects...').fill('zzzz-no-project-9283');
  await expect(page.getByText(/no projects found/i)).toBeVisible();
});

test('capture a portfolio demonstration screenshot', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Capture the hero viewport; full-page captures include dynamic counters and carousels.
  await testInfo.attach('MTech homepage', {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });
});
