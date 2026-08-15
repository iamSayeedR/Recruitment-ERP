const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Sayeed Rizwan/.gemini/antigravity/brain/365ee59d-4ddf-4f9a-9432-164f4df75732/.user_uploaded';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Starting Full E2E Module Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Dashboard
    console.log('➡️ 1. Testing Dashboard...');
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_01_dashboard.png') });
    console.log('✅ Dashboard captured');

    // 2. Candidates List & New Candidate Form
    console.log('➡️ 2. Testing Candidates Page...');
    await page.goto('http://localhost:3000/candidates');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_02_candidates_list.png') });

    console.log('➡️ 2b. Testing /candidates/new...');
    await page.goto('http://localhost:3000/candidates/new');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_03_candidates_new_form.png') });

    // 3. Requisitions & Pipeline Kanban
    console.log('➡️ 3. Testing Requisitions List...');
    await page.goto('http://localhost:3000/requisitions');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_04_requisitions_list.png') });

    // 4. Clients
    console.log('➡️ 4. Testing Clients Module...');
    await page.goto('http://localhost:3000/clients');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_05_clients_module.png') });

    // 5. Branches
    console.log('➡️ 5. Testing Branches Module...');
    await page.goto('http://localhost:3000/branches');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_06_branches_module.png') });

    // 6. Bulk Upload
    console.log('➡️ 6. Testing Bulk Upload Module...');
    await page.goto('http://localhost:3000/candidates/bulk');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_07_bulk_upload_module.png') });

    // 7. Compliance
    console.log('➡️ 7. Testing Compliance Module...');
    await page.goto('http://localhost:3000/compliance');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_08_compliance_module.png') });

    // 8. Users
    console.log('➡️ 8. Testing Users Module...');
    await page.goto('http://localhost:3000/users');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_09_users_module.png') });

    // 9. Operations & Settings
    console.log('➡️ 9. Testing Operations & Settings...');
    await page.goto('http://localhost:3000/operations');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_10_operations_module.png') });

    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_11_settings_module.png') });

    console.log('🎉 ALL 9 MODULES AUDITED AND CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Audit Error:', err);
  } finally {
    await browser.close();
  }
})();
