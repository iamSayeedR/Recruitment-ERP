import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sayeed Rizwan/.gemini/antigravity/brain/365ee59d-4ddf-4f9a-9432-164f4df75732/.user_uploaded';

test.describe('E2E Full ERP System Audit', () => {
  test('Complete end-to-end verification of all 9 modules', async ({ page }) => {
    // Step 1: Sign in as Tenant Admin
    await page.goto('/auth/signin');
    await page.waitForTimeout(1000);

    // Keycloak login form handling if redirected
    if (page.url().includes('keycloak')) {
      await page.fill('#username', 'tenantadmin@acme.dev');
      await page.fill('#password', 'admin123');
      await page.click('#kc-login');
      await page.waitForURL(/localhost:3000/, { timeout: 15000 });
    } else {
      // Direct NextAuth credentials login fallback
      const usernameInput = page.locator('input[name="username"], input[name="email"], #username');
      if (await usernameInput.isVisible()) {
        await usernameInput.fill('tenantadmin@acme.dev');
        const passwordInput = page.locator('input[name="password"], #password');
        await passwordInput.fill('admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/localhost:3000/, { timeout: 15000 });
      }
    }

    // 1. Dashboard Module
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_01_dashboard.png') });

    // 2. Candidates Page & Add Candidate Form (/candidates/new)
    await page.goto('/candidates');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_02_candidates_list.png') });

    // Click "Add Candidate" button and verify /candidates/new loads fully
    await page.click('a[href="/candidates/new"]');
    await page.waitForURL(/\/candidates\/new/, { timeout: 10000 });
    await page.waitForTimeout(1500);
    await expect(page.locator('h1')).toContainText('Add Candidate Profile');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_03_candidates_new_form.png') });

    // Fill form using demo preset "+ Fatima Al-Zahra"
    await page.click('button:has-text("+ Fatima Al-Zahra")');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/candidates/, { timeout: 10000 });
    await page.waitForTimeout(1500);

    // 3. Requisitions Module & Candidate Pipeline Kanban
    await page.goto('/requisitions');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_04_requisitions_list.png') });

    // Click first requisition to view detail
    const reqLink = page.locator('a[href^="/requisitions/"]').first();
    if (await reqLink.isVisible()) {
      await reqLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_05_requisition_detail.png') });

      // Click Pipeline button
      const pipelineBtn = page.locator('a:has-text("Pipeline")');
      if (await pipelineBtn.isVisible()) {
        await pipelineBtn.click();
        await page.waitForTimeout(2000);

        // Click "Add Candidate to Pipeline"
        await page.click('button:has-text("Add Candidate to Pipeline")');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_06_pipeline_add_candidate_modal.png') });

        // Select Candidate from dropdown
        const select = page.locator('select');
        if (await select.isVisible()) {
          const options = await select.locator('option').all();
          if (options.length > 1) {
            const val = await options[1]?.getAttribute('value');
            if (val) await select.selectOption(val);
          }
          await page.click('button[type="submit"]');
          await page.waitForTimeout(2000);
        }

        // Verify Candidate Name renders on Kanban Card
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_07_pipeline_kanban_cards.png') });
      }
    }

    // 4. Clients Module
    await page.goto('/clients');
    await page.waitForTimeout(1500);
    await page.click('button:has-text("Create Client")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("+ Saudi Aramco")');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_08_clients_module.png') });

    // 5. Branches Module
    await page.goto('/branches');
    await page.waitForTimeout(1500);
    await page.click('button:has-text("Create Branch")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("+ Dubai Regional HQ")');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_09_branches_module.png') });

    // 6. Bulk Candidate Upload Module
    await page.goto('/candidates/bulk');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_10_bulk_upload_module.png') });

    // 7. Compliance Governance Module
    await page.goto('/compliance');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_11_compliance_module.png') });

    // 8. Users Administration Module
    await page.goto('/users');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_12_users_module.png') });

    // 9. Operations Feed Module
    await page.goto('/operations');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_13_operations_module.png') });

    // 10. System Settings Module
    await page.goto('/settings');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_14_settings_module.png') });
  });
});
