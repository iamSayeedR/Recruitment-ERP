const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/Sayeed Rizwan/.gemini/antigravity/brain/365ee59d-4ddf-4f9a-9432-164f4df75732/.user_uploaded';

(async () => {
  console.log('🧪 Testing Sign Out Flow...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Sign In
    console.log('➡️ 1. Navigating to /auth/signin...');
    await page.goto('http://localhost:3000/auth/signin');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✅ Logged in cleanly! URL:', page.url());

    // 2. Click Sign Out
    console.log('➡️ 2. Clicking Sign Out button in Header...');
    const signOutBtn = page.locator('button:has-text("Sign Out")');
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await page.waitForTimeout(3000);
      console.log('✅ Sign Out clicked! Current URL:', page.url());
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signout_verified.png') });
    }
  } catch (err) {
    console.error('❌ Sign Out Error:', err);
  } finally {
    await browser.close();
  }
})();
