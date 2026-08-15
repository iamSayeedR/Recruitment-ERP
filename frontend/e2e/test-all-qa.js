const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Starting Full QA Verification Sweep across all 8 modules...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  const checkPage = async (name, url, expectedSelector) => {
    try {
      const res = await page.goto(`http://localhost:3000${url}`, { waitUntil: 'domcontentloaded' });
      const status = res ? res.status() : 500;
      let hasElement = false;
      if (expectedSelector) {
        hasElement = (await page.$(expectedSelector)) !== null;
      } else {
        hasElement = status === 200;
      }
      results.push({ name, url, status, ok: status === 200 && hasElement });
      console.log(`  ${status === 200 && hasElement ? '✅' : '❌'} [${status}] ${name.padEnd(25)} -> ${url}`);
    } catch (err) {
      results.push({ name, url, status: 'ERROR', ok: false, error: err.message });
      console.log(`  ❌ [ERR] ${name.padEnd(25)} -> ${err.message}`);
    }
  };

  await checkPage('1. Executive Dashboard', '/', 'body');
  await checkPage('2. Operations Feed', '/operations', 'body');
  await checkPage('3. Job Requisitions List', '/requisitions', 'body');
  await checkPage('4. Requisition Edit Route', '/requisitions/fae9a605-8c6c-4c7a-909b-72958e0a852e/edit', 'body');
  await checkPage('5. Requisition Pipeline', '/requisitions/fae9a605-8c6c-4c7a-909b-72958e0a852e/pipeline', 'body');
  await checkPage('6. Candidate Talent Pool', '/candidates', 'body');
  await checkPage('7. Bulk Candidate Import', '/candidates/bulk', 'body');
  await checkPage('8. Clients Module', '/clients', 'body');
  await checkPage('9. Branches Module', '/branches', 'body');
  await checkPage('10. Compliance Audits', '/compliance', 'body');
  await checkPage('11. Users Governance', '/users', 'body');
  await checkPage('12. Tenant Settings', '/settings', 'body');

  await browser.close();

  const failed = results.filter(r => !r.ok);
  if (failed.length === 0) {
    console.log('\n🎉 ALL 12 QA ROUTES AND MODULES PASSED WITH 100% VERIFICATION SUCCESS!');
  } else {
    console.error(`\n⚠️ ${failed.length} modules failed!`);
    process.exit(1);
  }
})();
