import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  // test.use({ storageState: 'e2e/.auth/tenant_admin.json' });

  test('TENANT_ADMIN can view user list', async ({ page }) => {
    // await page.goto('/users');
    // await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
    // await expect(page.getByRole('table')).toBeVisible();
  });

  test('can invite a new user', async ({ page }) => {
    // await page.goto('/users');
    // await page.getByRole('button', { name: /invite user/i }).click();
    
    // await page.getByLabel('Email').fill('newuser@example.com');
    // await page.getByLabel('Role').selectOption('RECRUITER');
    // await page.getByLabel('Branch').selectOption('Main Branch');
    
    // await page.getByRole('button', { name: /send invite/i }).click();
    
    // await expect(page.getByText(/invitation sent/i)).toBeVisible();
  });

  test('can modify user roles', async ({ page }) => {
    // await page.goto('/users');
    // await page.getByRole('button', { name: /edit/i }).first().click();
    
    // await page.getByLabel('Role').selectOption('BRANCH_MANAGER');
    // await page.getByRole('button', { name: /save/i }).click();
    
    // await expect(page.getByText(/role updated/i)).toBeVisible();
  });

  test('can deactivate a user', async ({ page }) => {
    // await page.goto('/users');
    // await page.getByRole('button', { name: /deactivate/i }).first().click();
    
    // Confirm in dialog
    // await page.getByRole('dialog').getByRole('button', { name: /confirm/i }).click();
    
    // Verify status badge changes
    // await expect(page.getByText(/inactive/i).first()).toBeVisible();
  });
});
