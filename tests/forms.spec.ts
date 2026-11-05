import { test, expect } from './fixtures';

test('contact form explains all required fields on an empty submission', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  for (const message of ['Name is required', 'Email is required', 'Phone number is required', 'Message is required']) {
    await expect(page.getByText(message, { exact: true })).toBeVisible();
  }
  await expect(page).toHaveURL(/\/contact$/);
});

test('quote form rejects missing project and contact details', async ({ page }) => {
  await page.goto('/quote');
  await page.getByRole('button', { name: 'Submit Quote Request' }).click();
  for (const message of [
    'Name must be at least 2 characters',
    'Please enter a valid email address',
    'Please enter a valid phone number',
    'Please select a project type',
    'Message must be at least 10 characters',
  ]) {
    await expect(page.getByText(message, { exact: true })).toBeVisible();
  }
  await expect(page.getByLabel('Email Address')).toHaveAttribute('aria-invalid', 'true');
});

test('quote form rejects a malformed email while retaining the selected service', async ({ page }) => {
  await page.goto('/quote');
  await page.getByLabel('Email Address').fill('invalid-email');
  await page.getByLabel('Project Type').selectOption('software-testing');
  await page.getByRole('button', { name: 'Submit Quote Request' }).click();
  await expect(page.getByText('Please enter a valid email address', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Project Type')).toHaveValue('software-testing');
  await expect(page.getByLabel('Email Address')).toHaveValue('invalid-email');
});

test('contact form clears errors after valid input is entered', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByText('Name is required', { exact: true })).toBeVisible();

  await page.getByLabel('Name').fill('Test User');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Phone number').fill('876-123-4567');
  await page.getByLabel('Message').fill('This is a valid message for validation testing.');
  await page.getByRole('button', { name: 'Send Message', exact: true }).click();

  await expect(page.getByText('Name is required', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Email is required', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Phone number is required', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Message is required', { exact: true })).toHaveCount(0);
});

test('quote form clears email validation after the user fixes the value', async ({ page }) => {
  await page.goto('/quote');
  await page.getByLabel('Email Address').fill('invalid-email');
  await page.getByLabel('Project Type').selectOption('software-testing');
  await page.getByRole('button', { name: 'Submit Quote Request' }).click();
  await expect(page.getByText('Please enter a valid email address', { exact: true })).toBeVisible();

  await page.getByRole('textbox', { name: 'Full Name*' }).fill('Test User');
  await page.getByLabel('Email Address*').fill('test@example.com');
  await page.getByLabel('Phone Number*').fill('876-123-4567');
  await page.getByLabel('Project Details*').fill('This is a valid quote message for validation testing.');
  await page.getByRole('button', { name: 'Submit Quote Request' }).click();

  await expect(page.getByText('Please enter a valid email address', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Project Type')).toHaveValue('software-testing');
  await expect(page.getByLabel('Email Address')).toHaveValue('test@example.com');
});
