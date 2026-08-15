import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  // test.use({ storageState: 'e2e/.auth/tenant_admin.json' });

  test('can create a new client', async ({ page }) => {
    // await page.goto('/clients');
    // await page.getByRole('button', { name: /create client/i }).click();
    
    // await page.getByLabel('Name').fill('Acme Corp');
    // await page.getByLabel('Industry').fill('Technology');
    // await page.getByLabel('Contact Email').fill('contact@acme.corp');
    
    // await page.getByRole('button', { name: /submit/i }).click();
    
    // await expect(page.getByRole('cell', { name: 'Acme Corp' })).toBeVisible();
  });

  test('can edit an existing client', async ({ page }) => {
    // await page.goto('/clients');
    // await page.getByRole('button', { name: /edit/i }).first().click();
    
    // await page.getByLabel('Name').fill('Updated Client Name');
    // await page.getByRole('button', { name: /save/i }).click();
    
    // await expect(page.getByRole('cell', { name: 'Updated Client Name' })).toBeVisible();
  });

  test('can change client status', async ({ page }) => {
    // await page.goto('/clients');
    // await page.getByRole('button', { name: /deactivate/i }).first().click();
    
    // Confirm in dialog
    // await page.getByRole('dialog').getByRole('button', { name: /confirm/i }).click();
    
    // Verify status badge changes
    // await expect(page.getByText(/inactive/i).first()).toBeVisible();
  });

  test('shows validation errors for invalid form data', async ({ page }) => {
    // await page.goto('/clients');
    // await page.getByRole('button', { name: /create client/i }).click();
    
    // Submit empty form
    // await page.getByRole('button', { name: /submit/i }).click();
    
    // Verify validation error messages
    // await expect(page.getByText(/name is required/i)).toBeVisible();
  });
});
