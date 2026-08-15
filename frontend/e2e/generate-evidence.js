const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Sayeed Rizwan/.gemini/antigravity/brain/365ee59d-4ddf-4f9a-9432-164f4df75732/.user_uploaded';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Starting Quick Visual Evidence Capture...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Pipeline Kanban Cards
    await page.goto('http://localhost:3000/requisitions/fae9a605-8c6c-4c7a-909b-72958e0a852e/pipeline');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'evidence_01_candidate_names_in_pipeline.png') });
    console.log('✅ 1. Pipeline Kanban Cards captured');

    // 2. Add Candidate Modal Inside Pipeline
    const addBtn = page.locator('button:has-text("Add Candidate to Pipeline")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'evidence_02_add_candidate_modal_inside_pipeline.png') });
      console.log('✅ 2. Add Candidate Modal Inside Pipeline captured');
    }

    // 3. Candidates Page Add to Pipeline Button
    await page.goto('http://localhost:3000/candidates');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'evidence_03_candidates_table_add_to_pipeline.png') });
    console.log('✅ 3. Candidates Page Add to Pipeline Button captured');

    // 4. Back Navigation Buttons
    await page.goto('http://localhost:3000/candidates/new');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'evidence_04_back_button_candidates_new.png') });

    await page.goto('http://localhost:3000/clients');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'evidence_05_back_button_clients.png') });

    await page.goto('http://localhost:3000/branches');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'evidence_06_back_button_branches.png') });
    console.log('✅ 4. Back Navigation Buttons captured');

    // 5. Sidebar Tooltips Hover
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);
    const link = page.locator('a[href="/candidates"]').first();
    if (await link.isVisible()) {
      await link.hover();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'evidence_07_sidebar_tooltips_hover.png') });
    console.log('✅ 5. Sidebar Hover Tooltips captured');

    console.log('🎉 ALL EVIDENCE CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error capturing evidence:', err);
  } finally {
    await browser.close();
  }
})();
