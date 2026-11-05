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

test('FAQ items can be opened and closed in sequence without leaving stale state', async ({ page }) => {
  await page.goto('/');
  const firstQuestion = page.getByRole('button', { name: 'What services does M Tech Corp offer?' });
  const secondQuestion = page.getByRole('button', { name: 'How much does a website cost?' });

  await firstQuestion.click();
  await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('region', { name: 'What services does M Tech Corp offer?' })).toBeVisible();

  await secondQuestion.click();
  await expect(secondQuestion).toHaveAttribute('aria-expanded', 'true');
  await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('region', { name: 'How much does a website cost?' })).toBeVisible();
});

test('main public routes respond successfully across the portfolio site', async ({ page }) => {
  for (const { path, heading } of [
    { path: '/', heading: 'Building Digital Solutions for Your Business' },
    { path: '/services', heading: 'Our Services' },
    { path: '/portfolio', heading: 'Our Portfolio' },
    { path: '/contact', heading: 'Contact Us' },
    { path: '/quote', heading: 'Get a Quote' },
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  }
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
