const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Sayeed Rizwan/.gemini/antigravity/brain/365ee59d-4ddf-4f9a-9432-164f4df75732/.user_uploaded';

(async () => {
  console.log('🚀 Capturing Remaining Authentic UI Screenshots...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Pipeline Kanban View with Candidates
    const reqId = 'fae9a605-8c6c-4c7a-909b-72958e0a852e';
    console.log('➡️ 1. Pipeline Kanban View:', `/requisitions/${reqId}/pipeline`);
    await page.goto(`http://localhost:3000/requisitions/${reqId}/pipeline`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_05_pipeline_kanban_cards.png') });
    console.log('✅ Captured Pipeline Kanban with Candidate Names');

    // 2. Add Candidate Modal inside Pipeline View
    const addBtn = page.locator('button:has-text("Add Candidate to Pipeline")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_06_pipeline_add_candidate_modal.png') });
      console.log('✅ Captured Add Candidate Modal inside Pipeline Tab');
    }

    // 3. Branches Page with Back Button
    console.log('➡️ 3. Branches Page...');
    await page.goto('http://localhost:3000/branches');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_08_branches_page.png') });
    console.log('✅ Captured Branches Page UI');

    // 4. Bulk Candidate Upload Page
    console.log('➡️ 4. Bulk Upload Page...');
    await page.goto('http://localhost:3000/candidates/bulk');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_09_bulk_upload_page.png') });
    console.log('✅ Captured Bulk Upload Page UI');

    // 5. Compliance & Governance Page
    console.log('➡️ 5. Compliance Page...');
    await page.goto('http://localhost:3000/compliance');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_10_compliance_page.png') });
    console.log('✅ Captured Compliance Page UI');

    // 6. Users Page
    console.log('➡️ 6. Users Page...');
    await page.goto('http://localhost:3000/users');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_11_users_page.png') });
    console.log('✅ Captured Users Page UI');

    // 7. Operations Feed Page
    console.log('➡️ 7. Operations Feed Page...');
    await page.goto('http://localhost:3000/operations');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_12_operations_page.png') });
    console.log('✅ Captured Operations Feed Page UI');

    // 8. System Settings Page
    console.log('➡️ 8. Settings Page...');
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_13_settings_page.png') });
    console.log('✅ Captured Settings Page UI');

    console.log('🎉 ALL REMAINING AUTHENTIC UI SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Capture Error:', err);
  } finally {
    await browser.close();
  }
})();
