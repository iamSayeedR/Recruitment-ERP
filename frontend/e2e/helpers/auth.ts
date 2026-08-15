import { Page, BrowserContext } from '@playwright/test';

export type Role = 'TENANT_ADMIN' | 'BRANCH_MANAGER' | 'RECRUITER' | 'COMPLIANCE_OFFICER';

/**
 * Login helper that bypasses the React/hydration redirect chain.
 *
 * Flow:
 *   1. Navigate to /api/auth/signin to establish session cookies
 *   2. Read the CSRF token from the DOM
 *   3. Use page.request (shares browser cookie jar, runs at HTTP layer) to POST
 *      to /api/auth/signin/keycloak with maxRedirects:0 to capture the Location header
 *   4. page.goto() directly to the Keycloak authorization URL
 *   5. Fill credentials and submit
 *   6. Wait for NextAuth callback to land us back on localhost:3000
 */
export async function loginAsRole(page: Page, role: Role) {
  const credentials: Record<Role, { email: string; password: string }> = {
    TENANT_ADMIN:       { email: 'tenantadmin@acme.dev',       password: 'admin123' },
    BRANCH_MANAGER:     { email: 'branchmanager@acme.dev',     password: 'admin123' },
    RECRUITER:          { email: 'recruiter@acme.dev',         password: 'admin123' },
    COMPLIANCE_OFFICER: { email: 'complianceofficer@acme.dev', password: 'compliance123' },
  };

  const user = credentials[role];

  // ── Step 1: Land on the NextAuth signin page to establish session cookies ──
  await page.goto('/api/auth/signin', { waitUntil: 'domcontentloaded' });

  // Already logged in?
  if (!page.url().includes('/api/auth/signin')) return;

  // ── Step 2: Read CSRF token from the rendered form ──
  const csrfToken = await page.locator('input[name="csrfToken"]').first().inputValue();

  // ── Step 3: POST to NextAuth via page.request (HTTP-layer, shares cookies) ──
  //    maxRedirects: 0 lets us read the 302 Location header before Playwright follows it
  const signinRes = await page.request.fetch('http://localhost:3000/api/auth/signin/keycloak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: `csrfToken=${encodeURIComponent(csrfToken)}&callbackUrl=${encodeURIComponent('http://localhost:3000')}`,
    maxRedirects: 0,
    failOnStatusCode: false,
  });

  const keycloakAuthUrl = signinRes.headers()['location'];
  console.log('[auth] Keycloak auth URL:', keycloakAuthUrl ?? '(none)');

  if (!keycloakAuthUrl) {
    throw new Error(
      `[auth] NextAuth did not return a redirect to Keycloak. ` +
      `Status: ${signinRes.status()}, URL: ${page.url()}`
    );
  }

  // ── Step 4: Navigate directly to the Keycloak login page ──
  await page.goto(keycloakAuthUrl, { waitUntil: 'domcontentloaded' });

  // ── Step 5: Fill credentials on the Keycloak form ──
  try {
    await page.waitForSelector('#username', { timeout: 30000 });
    await page.fill('#username', user.email);
    await page.fill('#password', user.password);
  } catch (e) {
    console.error('[auth] Keycloak form not found. URL:', page.url());
    console.error('[auth] Page head:', (await page.content()).substring(0, 2000));
    throw e;
  }

  await page.click('#kc-login');

  // ── Step 6: Handle optional "Update Account Information" profile prompt ──
  try {
    if (await page.locator('#firstName').isVisible({ timeout: 3000 })) {
      await page.fill('#firstName', role.split('_')[0] ?? '');
      await page.fill('#lastName', 'User');
      await page.click('input[type="submit"], button[type="submit"]');
    }
  } catch {
    // Not present — fine
  }

  // ── Step 7: Wait for NextAuth callback to complete ──
  try {
    await page.waitForURL(/localhost:3000(?!\/api\/auth)/, { timeout: 30000 });
  } catch (e) {
    console.error('[auth] Callback timeout. URL:', page.url());
    console.error('[auth] Page head:', (await page.content()).substring(0, 2000));
    throw e;
  }
}

export const loginAs = loginAsRole;

/**
 * Save and reuse auth state for a given role.
 */
export async function setupAuthState(
  context: BrowserContext,
  role: Role,
  statePath: string,
) {
  const page = await context.newPage();
  await loginAsRole(page, role);
  await context.storageState({ path: statePath });
  await page.close();
}
