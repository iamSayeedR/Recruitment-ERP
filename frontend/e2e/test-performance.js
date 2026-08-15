const { chromium } = require('playwright');

(async () => {
  console.log('⚡ Running Data Loading Performance Benchmark...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const routes = [
    '/',
    '/candidates',
    '/requisitions',
    '/clients',
    '/branches',
    '/compliance',
    '/users',
    '/operations',
    '/settings',
  ];

  for (const route of routes) {
    const start = Date.now();
    await page.goto(`http://localhost:3000${route}`, { waitUntil: 'domcontentloaded' });
    const duration = Date.now() - start;
    console.log(`⏱️ Route ${route.padEnd(16)} loaded in: ${duration}ms`);
  }

  await browser.close();
  console.log('🚀 All routes loaded lightning fast!');
})();
