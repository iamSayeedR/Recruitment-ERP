const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Sayeed Rizwan/.gemini/antigravity/brain/365ee59d-4ddf-4f9a-9432-164f4df75732/.user_uploaded';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Starting Authentic UI Module Screenshot Capture...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Dashboard
    console.log('➡️ 1. Capturing Dashboard...');
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_01_dashboard.png') });
    console.log('✅ Captured Dashboard UI');

    // 2. Candidates Talent Pool
    console.log('➡️ 2. Capturing Candidates Talent Pool...');
    await page.goto('http://localhost:3000/candidates');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_02_candidates_list.png') });
    console.log('✅ Captured Candidates Talent Pool UI');

    // 3. Add Candidate Profile Page (/candidates/new with Back Button)
    console.log('➡️ 3. Capturing /candidates/new Registration Form...');
    await page.goto('http://localhost:3000/candidates/new');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_03_candidates_new_page.png') });
    console.log('✅ Captured /candidates/new UI');

    // 4. Requisitions List & Pipeline Kanban
    console.log('➡️ 4. Capturing Requisitions List...');
    await page.goto('http://localhost:3000/requisitions');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_04_requisitions_list.png') });

    const reqLink = page.locator('a[href^="/requisitions/"]').first();
    if (await reqLink.isVisible()) {
      const href = await reqLink.getAttribute('href');
      console.log('➡️ 4b. Capturing Pipeline Kanban View:', `${href}/pipeline`);
      await page.goto(`http://localhost:3000${href}/pipeline`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_05_pipeline_kanban.png') });
      console.log('✅ Captured Pipeline Kanban UI');

      // Click Add Candidate to Pipeline modal
      const addModalBtn = page.locator('button:has-text("Add Candidate to Pipeline")');
      if (await addModalBtn.isVisible()) {
        await addModalBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_06_pipeline_add_candidate_modal.png') });
        console.log('✅ Captured Add Candidate Modal inside Pipeline UI');
      }
    }

    // 5. Clients Management Page (with Back Button)
    console.log('➡️ 5. Capturing Clients Management...');
    await page.goto('http://localhost:3000/clients');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_07_clients_page.png') });
    console.log('✅ Captured Clients UI');

    // 6. Branch Network Page (with Back Button)
    console.log('➡️ 6. Capturing Branch Network...');
    await page.goto('http://localhost:3000/branches');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_08_branches_page.png') });
    console.log('✅ Captured Branches UI');

    // 7. Bulk Candidate Upload Page
    console.log('➡️ 7. Capturing Bulk Candidate Upload...');
    await page.goto('http://localhost:3000/candidates/bulk');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_09_bulk_upload_page.png') });
    console.log('✅ Captured Bulk Upload UI');

    // 8. Compliance & Governance Page
    console.log('➡️ 8. Capturing Compliance & Governance...');
    await page.goto('http://localhost:3000/compliance');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_10_compliance_page.png') });
    console.log('✅ Captured Compliance UI');

    // 9. User Administration Page
    console.log('➡️ 9. Capturing User Administration...');
    await page.goto('http://localhost:3000/users');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_11_users_page.png') });
    console.log('✅ Captured Users UI');

    // 10. Operational Feed & Activity Page
    console.log('➡️ 10. Capturing Operational Feed & Activity...');
    await page.goto('http://localhost:3000/operations');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_12_operations_page.png') });
    console.log('✅ Captured Operations UI');

    // 11. System Settings Page
    console.log('➡️ 11. Capturing System Settings...');
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_13_settings_page.png') });
    console.log('✅ Captured Settings UI');

    console.log('🎉 ALL AUTHENTICATED UI SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Capture Error:', err);
  } finally {
    await browser.close();
  }
})();
