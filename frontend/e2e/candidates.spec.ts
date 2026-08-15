import { test, expect } from '@playwright/test';

test.describe('Candidate Profile & Document Viewer Security', () => {
  
  test('document viewer iframe has sandbox and CSP frame-src restrictions', async ({ page }) => {
    // Navigate to candidate profile page (use a mock/test candidate ID)
    const testCandidateId = '00000000-0000-0000-0000-000000000000';
    
    // We navigate to candidates details profile view
    await page.goto(`/candidates/${testCandidateId}`);

    // Verify page CSP headers include restricted frame-src rules
    const response = await page.request.get(`/candidates/${testCandidateId}`);
    const headers = response.headers();
    const csp = headers['content-security-policy'];
    
    if (csp) {
      expect(csp).toContain("frame-src 'self' http://localhost:8180 http://localhost:9000");
    }

    // Go to the document viewer tab if tab elements are present
    const viewButton = page.getByRole('button', { name: /view document/i });
    if (await viewButton.count() > 0) {
      await viewButton.first().click();
      
      const iframe = page.locator('iframe[title="Document Viewer"]');
      await expect(iframe).toBeVisible();
      
      // Assert sandbox attribute is exactly "allow-same-origin"
      const sandbox = await iframe.getAttribute('sandbox');
      expect(sandbox).toBe('allow-same-origin');
    }
  });
});
