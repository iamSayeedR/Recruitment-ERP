# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-full-app-audit.spec.ts >> E2E Full ERP System Audit >> Complete end-to-end verification of all 9 modules
- Location: e2e\e2e-full-app-audit.spec.ts:7:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('a[href="/candidates/new"]')

```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e3]:
    - generic [ref=f2e4]:
      - generic [ref=f2e5]: ERP
      - heading "Recruitment ERP" [level=1] [ref=f2e6]
      - paragraph [ref=f2e7]: Enterprise Mobility & Talent System
    - generic [ref=f2e8]:
      - generic [ref=f2e9]:
        - generic [ref=f2e10]: Username or Email
        - textbox "Username or Email" [ref=f2e11]:
          - /placeholder: e.g. tenantadmin@acme.dev
          - text: tenantadmin@acme.dev
      - generic [ref=f2e12]:
        - generic [ref=f2e13]: Password
        - textbox "Password" [ref=f2e14]:
          - /placeholder: ••••••••
          - text: admin123
      - button "Sign In with Credentials" [ref=f2e15] [cursor=pointer]
    - generic [ref=f2e16]: OR CONTINUE WITH SSO
    - button "Sign in via Keycloak IAM" [ref=f2e18] [cursor=pointer]
    - generic [ref=f2e22]:
      - paragraph [ref=f2e23]: "Quick Fill Demo Roles:"
      - generic [ref=f2e24]:
        - button "Tenant Admin" [ref=f2e25] [cursor=pointer]
        - button "Recruiter" [ref=f2e26] [cursor=pointer]
        - button "Compliance" [ref=f2e27] [cursor=pointer]
        - button "Branch Manager" [ref=f2e28] [cursor=pointer]
  - alert [ref=f2e29]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import path from 'path';
  3   | 
  4   | const SCREENSHOT_DIR = 'C:/Users/Sayeed Rizwan/.gemini/antigravity/brain/365ee59d-4ddf-4f9a-9432-164f4df75732/.user_uploaded';
  5   | 
  6   | test.describe('E2E Full ERP System Audit', () => {
  7   |   test('Complete end-to-end verification of all 9 modules', async ({ page }) => {
  8   |     // Step 1: Sign in as Tenant Admin
  9   |     await page.goto('/auth/signin');
  10  |     await page.waitForTimeout(1000);
  11  | 
  12  |     // Keycloak login form handling if redirected
  13  |     if (page.url().includes('keycloak')) {
  14  |       await page.fill('#username', 'tenantadmin@acme.dev');
  15  |       await page.fill('#password', 'admin123');
  16  |       await page.click('#kc-login');
  17  |       await page.waitForURL(/localhost:3000/, { timeout: 15000 });
  18  |     } else {
  19  |       // Direct NextAuth credentials login fallback
  20  |       const usernameInput = page.locator('input[name="username"], input[name="email"], #username');
  21  |       if (await usernameInput.isVisible()) {
  22  |         await usernameInput.fill('tenantadmin@acme.dev');
  23  |         const passwordInput = page.locator('input[name="password"], #password');
  24  |         await passwordInput.fill('admin123');
  25  |         await page.click('button[type="submit"]');
  26  |         await page.waitForURL(/localhost:3000/, { timeout: 15000 });
  27  |       }
  28  |     }
  29  | 
  30  |     // 1. Dashboard Module
  31  |     await page.goto('/');
  32  |     await page.waitForTimeout(2000);
  33  |     await expect(page.locator('body')).toBeVisible();
  34  |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_01_dashboard.png') });
  35  | 
  36  |     // 2. Candidates Page & Add Candidate Form (/candidates/new)
  37  |     await page.goto('/candidates');
  38  |     await page.waitForTimeout(1500);
  39  |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_02_candidates_list.png') });
  40  | 
  41  |     // Click "Add Candidate" button and verify /candidates/new loads fully
> 42  |     await page.click('a[href="/candidates/new"]');
      |                ^ Error: page.click: Test timeout of 60000ms exceeded.
  43  |     await page.waitForURL(/\/candidates\/new/, { timeout: 10000 });
  44  |     await page.waitForTimeout(1500);
  45  |     await expect(page.locator('h1')).toContainText('Add Candidate Profile');
  46  |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_03_candidates_new_form.png') });
  47  | 
  48  |     // Fill form using demo preset "+ Fatima Al-Zahra"
  49  |     await page.click('button:has-text("+ Fatima Al-Zahra")');
  50  |     await page.waitForTimeout(500);
  51  |     await page.click('button[type="submit"]');
  52  |     await page.waitForURL(/\/candidates/, { timeout: 10000 });
  53  |     await page.waitForTimeout(1500);
  54  | 
  55  |     // 3. Requisitions Module & Candidate Pipeline Kanban
  56  |     await page.goto('/requisitions');
  57  |     await page.waitForTimeout(1500);
  58  |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_04_requisitions_list.png') });
  59  | 
  60  |     // Click first requisition to view detail
  61  |     const reqLink = page.locator('a[href^="/requisitions/"]').first();
  62  |     if (await reqLink.isVisible()) {
  63  |       await reqLink.click();
  64  |       await page.waitForTimeout(1500);
  65  |       await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_05_requisition_detail.png') });
  66  | 
  67  |       // Click Pipeline button
  68  |       const pipelineBtn = page.locator('a:has-text("Pipeline")');
  69  |       if (await pipelineBtn.isVisible()) {
  70  |         await pipelineBtn.click();
  71  |         await page.waitForTimeout(2000);
  72  | 
  73  |         // Click "Add Candidate to Pipeline"
  74  |         await page.click('button:has-text("Add Candidate to Pipeline")');
  75  |         await page.waitForTimeout(1000);
  76  |         await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_06_pipeline_add_candidate_modal.png') });
  77  | 
  78  |         // Select Candidate from dropdown
  79  |         const select = page.locator('select');
  80  |         if (await select.isVisible()) {
  81  |           const options = await select.locator('option').all();
  82  |           if (options.length > 1) {
  83  |             const val = await options[1].getAttribute('value');
  84  |             if (val) await select.selectOption(val);
  85  |           }
  86  |           await page.click('button[type="submit"]');
  87  |           await page.waitForTimeout(2000);
  88  |         }
  89  | 
  90  |         // Verify Candidate Name renders on Kanban Card
  91  |         await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_07_pipeline_kanban_cards.png') });
  92  |       }
  93  |     }
  94  | 
  95  |     // 4. Clients Module
  96  |     await page.goto('/clients');
  97  |     await page.waitForTimeout(1500);
  98  |     await page.click('button:has-text("Create Client")');
  99  |     await page.waitForTimeout(500);
  100 |     await page.click('button:has-text("+ Saudi Aramco")');
  101 |     await page.waitForTimeout(500);
  102 |     await page.click('button[type="submit"]');
  103 |     await page.waitForTimeout(1500);
  104 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_08_clients_module.png') });
  105 | 
  106 |     // 5. Branches Module
  107 |     await page.goto('/branches');
  108 |     await page.waitForTimeout(1500);
  109 |     await page.click('button:has-text("Create Branch")');
  110 |     await page.waitForTimeout(500);
  111 |     await page.click('button:has-text("+ Dubai Regional HQ")');
  112 |     await page.waitForTimeout(500);
  113 |     await page.click('button[type="submit"]');
  114 |     await page.waitForTimeout(1500);
  115 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_09_branches_module.png') });
  116 | 
  117 |     // 6. Bulk Candidate Upload Module
  118 |     await page.goto('/candidates/bulk');
  119 |     await page.waitForTimeout(1500);
  120 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_10_bulk_upload_module.png') });
  121 | 
  122 |     // 7. Compliance Governance Module
  123 |     await page.goto('/compliance');
  124 |     await page.waitForTimeout(1500);
  125 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_11_compliance_module.png') });
  126 | 
  127 |     // 8. Users Administration Module
  128 |     await page.goto('/users');
  129 |     await page.waitForTimeout(1500);
  130 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_12_users_module.png') });
  131 | 
  132 |     // 9. Operations Feed Module
  133 |     await page.goto('/operations');
  134 |     await page.waitForTimeout(1500);
  135 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_13_operations_module.png') });
  136 | 
  137 |     // 10. System Settings Module
  138 |     await page.goto('/settings');
  139 |     await page.waitForTimeout(1500);
  140 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'audit_14_settings_module.png') });
  141 |   });
  142 | });
```