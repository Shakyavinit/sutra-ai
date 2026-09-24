import { describe, it, expect, beforeEach } from 'vitest';
import { AuditChain } from '../src/auditChain.js';

describe('AuditChain Cryptographic Tamper-Evident Ledger', () => {
  let audit;

  beforeEach(async () => {
    // Mock localStorage for test environment
    const storage = new Map();
    globalThis.localStorage = {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, val) => storage.set(key, String(val)),
      removeItem: (key) => storage.delete(key),
      clear: () => storage.clear()
    };

    audit = new AuditChain('test-case-001');
    await audit.resetChain();
  });

  it('initializes with a valid genesis block', async () => {
    const entries = audit.getEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].action).toBe('CASE_DOSSIER_INITIALIZED');
    expect(entries[0].prevHash).toBe('0000000000000000000000000000000000000000000000000000000000000000');
    expect(entries[0].hash.length).toBe(64);

    const verification = await audit.verifyChain();
    expect(verification.isValid).toBe(true);
    expect(verification.count).toBe(1);
  });

  it('appends blocks cryptographically chained to previous block hash', async () => {
    const entry1 = await audit.append('LEAD_REVIEW_DECISION', 'L-01', 'Test Lead', 'Pending', 'Approved');
    const entry2 = await audit.append('IDENTITY_RESOLUTION', 'ID-01', 'Test Merge', 'Needs Review', 'Merged');

    const entries = audit.getEntries();
    expect(entries.length).toBe(3); // genesis + 2 appends
    expect(entry1.prevHash).toBe(entries[0].hash);
    expect(entry2.prevHash).toBe(entry1.hash);

    const verification = await audit.verifyChain();
    expect(verification.isValid).toBe(true);
    expect(verification.count).toBe(3);
  });

  it('detects tampering when content or hash is modified', async () => {
    await audit.append('LEAD_REVIEW_DECISION', 'L-01', 'Original Lead', 'Pending', 'Approved');
    await audit.append('IDENTITY_RESOLUTION', 'ID-01', 'Original Merge', 'Needs Review', 'Merged');

    // Simulate malicious tamper with block notes
    audit.entries[1].notes = 'MALICIOUS_TAMPERED_CONTENT';

    const verification = await audit.verifyChain();
    expect(verification.isValid).toBe(false);
    expect(verification.message).toMatch(/Tampering detected|Digest mismatch/);
  });

  it('resets chain to clean genesis block when requested', async () => {
    await audit.append('ACTION_1', 'T-1', 'Target 1', 'A', 'B');
    await audit.append('ACTION_2', 'T-2', 'Target 2', 'B', 'C');
    expect(audit.getEntries().length).toBe(3);

    await audit.resetChain();
    expect(audit.getEntries().length).toBe(1);
    const verification = await audit.verifyChain();
    expect(verification.isValid).toBe(true);
  });
});
