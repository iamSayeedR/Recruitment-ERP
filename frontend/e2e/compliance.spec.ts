import { test, expect } from '@playwright/test';
import { loginAsRole } from './helpers/auth';

test.describe('Compliance Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'COMPLIANCE_OFFICER');
  });

  test('should display upcoming expirations and allow navigation to compliance page', async ({ page }) => {
    await page.goto('/compliance');
    
    // Verify Dashboard Title & Subheading
    await expect(page.locator('h1', { hasText: 'Compliance Dashboard' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Upcoming Expirations & Alerts' })).toBeVisible();
    
    // Verify live expirations content section is present
    const mainContent = page.getByRole('heading', { name: 'Upcoming Expirations & Alerts' });
    await expect(mainContent).toBeVisible();

    // Navigate to a candidate compliance page directly
    await page.goto('/compliance/550e8400-e29b-41d4-a716-446655440000');
    await expect(page.locator('h1', { hasText: 'Compliance Checklist' })).toBeVisible();
  });

  test('should allow status update and view document in checklist', async ({ page }) => {
    await page.goto('/compliance/550e8400-e29b-41d4-a716-446655440000');
    
    // Verify requirements table
    await expect(page.locator('h2', { hasText: 'Requirements' })).toBeVisible();
    
    // Check initial status of Passport row
    const passportRow = page.locator('tr', { hasText: 'Passport / National ID' });
    await expect(passportRow).toBeVisible();
    
    // Update status for Medical Certificate requirement
    const medicalRow = page.locator('tr', { hasText: 'Medical Certificate' });
    const selectBox = medicalRow.locator('select');
    await selectBox.selectOption('in_progress');
    await expect(selectBox).toHaveValue('in_progress');

    // Verify upload button and interaction
    const uploadBtn = medicalRow.locator('button', { hasText: 'Upload' });
    await expect(uploadBtn).toBeVisible();
    
    page.on('dialog', dialog => dialog.accept());
    await uploadBtn.click();
    
    // After upload, status should change to submitted
    await expect(selectBox).toHaveValue('submitted');
    
    // View document
    const viewBtn = passportRow.locator('button', { hasText: 'View Document' });
    await viewBtn.click();
    
    // Verify modal viewer opens
    await expect(page.locator('h2', { hasText: 'Document Viewer' })).toBeVisible();
    const iframe = page.locator('iframe[title="Document Viewer"]');
    await expect(iframe).toBeVisible();
    
    // Close viewer
    await page.click('button:has-text("Close")');
    await expect(page.locator('h2', { hasText: 'Document Viewer' })).not.toBeVisible();
  });
});
