import assert from 'node:assert';
import {
  updateOrganisationStage,
  getOrganisationById,
  logOrganisationInteraction,
  addOrganisationContact,
} from '../lib/data-access.ts';
import { offlineQueue } from '../lib/offline-queue.ts';
import {
  handleExportOrganisations,
  handleExportEvents,
  handleExportQuarterlySummary,
} from '../server/export.ts';

async function runSession2Tests() {
  console.log('=== Running AI Loops Session 2 Verification Suite ===\n');

  // Test 1: Inactive Stage Reason Enforcement
  console.log('Test 1: Inactive stage validation check...');
  let threw = false;
  try {
    await updateOrganisationStage('org-1', 'Inactive', 'bad');
  } catch (err: any) {
    threw = true;
    assert(
      err.message.includes('A detailed reason (at least 5 characters) is mandatory'),
      'Expected minimum 5 char validation error'
    );
  }
  assert(threw, 'Should throw error when reason is too short');
  console.log('✓ Inactive stage rejects missing or short reasons cleanly');

  // Test 2: Valid Stage Transition & Interaction Audit Trail
  console.log('\nTest 2: Stage transition audit logging...');
  const testReason = 'Strategic focus shift to pan-African AI research hub';
  const updatedOrg = await updateOrganisationStage('org-1', 'Inactive', testReason);
  assert.strictEqual(updatedOrg.stage, 'Inactive');
  assert.strictEqual(updatedOrg.inactiveReason, testReason);
  
  // Verify interaction audit trail was automatically appended
  const auditInteraction = updatedOrg.interactions?.find((i) =>
    i.summary.includes('Stage changed:') && i.summary.includes(testReason)
  );
  assert(auditInteraction, 'Audit interaction record must exist in organisation timeline');
  assert.strictEqual(auditInteraction.loggedBy, 'Audit Trail');
  console.log('✓ Stage transition automatically logged audit interaction:', auditInteraction.summary);

  // Restore org-1 stage
  await updateOrganisationStage('org-1', 'Champion');

  // Test 3: Offline Queue Operations
  console.log('\nTest 3: Offline write queue mechanics...');
  const queueId = offlineQueue.enqueue('logOrganisationInteraction', {
    orgId: 'org-2',
    data: {
      date: new Date().toISOString(),
      channel: 'Email',
      direction: 'Outbound',
      summary: 'Verification test for offline write queuing engine',
      loggedBy: 'Test Runner',
    },
  });
  assert(queueId.startsWith('queue-'), 'Queue item must have valid ID');
  const status = offlineQueue.getStatus();
  console.log(`✓ Offline queue enqueue successful. Status: ${status.status}, Pending: ${status.pendingCount}`);

  // Test 4: CSV Streaming Handlers
  console.log('\nTest 4: CSV streaming generator formats...');
  function createMockRes() {
    let output = '';
    const headers: Record<string, string> = {};
    return {
      setHeader: (k: string, v: string) => { headers[k] = v; },
      write: (chunk: string) => { output += chunk; },
      end: () => {},
      getOutput: () => output,
      getHeaders: () => headers,
    } as any;
  }

  const orgRes = createMockRes();
  await handleExportOrganisations({ query: {} } as any, orgRes);
  const orgCsv = orgRes.getOutput();
  assert(orgCsv.startsWith('ID,Organisation Name,Sector,Tier,Pipeline Stage,Status,Owner,Next Action,Next Action Date (ISO),Inactive Reason,Website'));
  assert(orgCsv.includes('Blockchain & AI Ecosystem Association'));
  console.log('✓ Organisations CSV contains valid headers and rows');

  const evRes = createMockRes();
  await handleExportEvents({ query: {} } as any, evRes);
  const eventsCsv = evRes.getOutput();
  assert(eventsCsv.startsWith('ID,Slug,Title,Category,City,Venue,Organiser,Format,Price Type,Price,Start Date (WAT/ISO),End Date,Registration URL,Status'));
  assert(eventsCsv.includes('Nigeria Fintech Week 2026'));
  console.log('✓ Events CSV contains valid headers and rows');

  const sumRes = createMockRes();
  await handleExportQuarterlySummary({ query: {} } as any, sumRes);
  const summaryCsv = sumRes.getOutput();
  assert(summaryCsv.includes('QUARTERLY PARTNERSHIP & OUTREACH AUDIT REPORT'));
  assert(summaryCsv.includes('EXECUTIVE ROLLUP SUMMARY'));
  assert(summaryCsv.includes('PIPELINE STAGE DISTRIBUTION'));
  console.log('✓ Quarterly Summary CSV contains executive rollups and distribution tables');

  console.log('\nAll Session 2 verification tests PASSED with 0 errors.');
}

runSession2Tests().catch((err) => {
  console.error('Session 2 Verification FAILED:', err);
  process.exit(1);
});
