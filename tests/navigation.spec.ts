import { test, expect } from './fixtures';

const destinations = [
  { name: 'Services', path: '/services', heading: 'Our Services' },
  { name: 'About', path: '/about', heading: 'About M Tech Corp' },
  { name: 'Portfolio', path: '/portfolio', heading: 'Our Portfolio' },
  { name: 'Contact', path: '/contact', heading: 'Contact Us' },
  { name: 'Get a Quote', path: '/quote', heading: 'Get a Quote' },
];

test('homepage introduces the business and primary calls to action', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/MTech Corp/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Building Digital Solutions for Your Business');
  await expect(page.getByRole('link', { name: 'Our Services', exact: true })).toHaveAttribute('href', '/services');
  await expect(page.getByRole('link', { name: 'Contact Us', exact: true }).first()).toHaveAttribute('href', '/contact');
});

for (const destination of destinations) {
  test(`header opens ${destination.name}`, async ({ page, isMobile }) => {
    await page.goto('/');
    const header = page.locator('header');
    if (isMobile) await header.getByRole('button', { name: 'Toggle menu' }).click();
    await header.getByRole('link', { name: destination.name, exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL(new RegExp(`${destination.path}/?$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(destination.heading);
    if (isMobile) {
      await expect(header.getByRole('link', { name: destination.name, exact: true }).filter({ visible: true })).toHaveCount(0);
    }
  });
}

test('footer exposes working email and telephone link targets', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'info@mtechcorpja.com' })).toHaveAttribute('href', 'mailto:info@mtechcorpja.com');
  await expect(footer.getByRole('link', { name: '876-833-1524' })).toHaveAttribute('href', 'tel:876-833-1524');
});

test('main pages fit within the viewport', async ({ page }) => {
  for (const path of ['/', '/services', '/portfolio', '/contact', '/quote']) {
    await test.step(`check ${path}`, async () => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect.poll(() => page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      )).toBeLessThanOrEqual(1);
    });
  }
});
