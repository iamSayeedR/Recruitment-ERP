import { Client } from 'pg';
import { TEST_CANDIDATE_ID, TEST_TENANT_ID } from './global.setup';

async function globalTeardown() {
  console.log('Running global teardown for Playwright (DB Cleanup)...');

  // Must use postgres superuser to SET the app.current_tenant_id GUC (custom namespace)
  const client = new Client({
    user: 'postgres',
    password: 'changeme_in_production',
    host: '127.0.0.1',
    port: 5432,
    database: 'recruitment_erp',
  });

  try {
    await client.connect();

    // Set the RLS tenant context
    await client.query(`SET SESSION app.current_tenant_id = '${TEST_TENANT_ID}'`);
    await client.query(`SET SESSION app.current_user_id = 'e2e-test-setup'`);

    // checklist_items cascade-delete when the parent checklist is deleted
    await client.query(`
      DELETE FROM compliance_checklists 
      WHERE candidate_application_id = $1 AND tenant_id = $2
    `, [TEST_CANDIDATE_ID, TEST_TENANT_ID]);

    // Clean up the rules seeded in setup
    await client.query(`
      DELETE FROM compliance_rules
      WHERE tenant_id = $1 AND document_type IN ('Passport / National ID', 'Medical Certificate')
    `, [TEST_TENANT_ID]);

    console.log(`Cleaned up test data for candidate ${TEST_CANDIDATE_ID}`);
  } catch (error) {
    console.error('Failed to clean up database in global teardown:', error);
  } finally {
    await client.end();
  }
}

export default globalTeardown;
