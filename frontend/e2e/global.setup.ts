import { Client } from 'pg';
import crypto from 'crypto';

export const TEST_CANDIDATE_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_TENANT_ID = 'tenant-acme'; // must match the tenant_id claim in the Keycloak JWT for complianceofficer@acme.dev

async function globalSetup() {
  console.log('Running global setup for Playwright (DB Seeding)...');

  // Connect as the postgres superuser so we can:
  //  1. SET the app.current_tenant_id GUC (custom GUC namespace only settable by superuser)
  //  2. Satisfy the FORCE ROW LEVEL SECURITY policies that use that GUC
  // app_user is the runtime user; postgres is only used here for test seeding.
  const client = new Client({
    user: 'postgres',
    password: 'changeme_in_production',
    host: '127.0.0.1',
    port: 5432,
    database: 'recruitment_erp',
  });

  try {
    await client.connect();

    // Set the RLS tenant context so all INSERT/SELECT go into the correct tenant partition
    await client.query(`SET SESSION app.current_tenant_id = '${TEST_TENANT_ID}'`);
    await client.query(`SET SESSION app.current_user_id = 'e2e-test-setup'`);

    // Create compliance rules (document types expected by the spec)
    const ruleId1 = crypto.randomUUID();
    const ruleId2 = crypto.randomUUID();

    await client.query(`
      INSERT INTO compliance_rules (id, tenant_id, document_type, is_required, active)
      VALUES 
        ($1, $2, 'Passport / National ID', true, true),
        ($3, $2, 'Medical Certificate', true, true)
      ON CONFLICT (id) DO NOTHING
    `, [ruleId1, TEST_TENANT_ID, ruleId2]);

    // Create the test checklist for the E2E candidate
    const checklistId = crypto.randomUUID();
    await client.query(`
      INSERT INTO compliance_checklists (id, tenant_id, candidate_application_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [checklistId, TEST_TENANT_ID, TEST_CANDIDATE_ID]);

    // Create checklist items:
    //   - Passport: VERIFIED with a document reference (so "View Document" button appears)
    //   - Medical Certificate: NOT_STARTED (so "Upload" button appears and status can be changed)
    const itemId1 = crypto.randomUUID();
    const itemId2 = crypto.randomUUID();
    await client.query(`
      INSERT INTO checklist_items (id, checklist_id, rule_id, status, document_reference)
      VALUES 
        ($1, $2, $3, 'VERIFIED', 'https://example.com/e2e-passport.pdf'),
        ($4, $2, $5, 'NOT_STARTED', NULL)
      ON CONFLICT (id) DO NOTHING
    `, [itemId1, checklistId, ruleId1, itemId2, ruleId2]);

    // Verify the seed actually wrote rows (fail fast if RLS blocked it)
    const check = await client.query(
      `SELECT count(*) FROM checklist_items WHERE checklist_id = $1`,
      [checklistId]
    );
    const rowCount = parseInt(check.rows[0].count, 10);
    if (rowCount !== 2) {
      throw new Error(`Seed verification failed: expected 2 checklist_items, got ${rowCount}. RLS may have blocked the inserts.`);
    }

    console.log(`Seeded checklist ${checklistId} for candidate ${TEST_CANDIDATE_ID} (${rowCount} items)`);

    // Store IDs in process.env so teardown can clean up deterministically
    process.env.E2E_CHECKLIST_ID = checklistId;
    process.env.E2E_RULE_ID_1 = ruleId1;
    process.env.E2E_RULE_ID_2 = ruleId2;
  } catch (error) {
    console.error('Failed to seed database in global setup:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export default globalSetup;
