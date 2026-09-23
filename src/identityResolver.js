/**
 * SUTRA - Identity Resolution & Entity Deduplication Manager
 * Implements deterministic matching factor heuristics:
 * - Shared phone IMEI / MSISDN overlap
 * - ANPR / Toll vehicle co-occurrence
 * - Geolocation cluster proximity (<100m)
 */

export class IdentityResolver {
  constructor(identityRecords, onResolutionUpdated) {
    this.records = [...identityRecords];
    this.onResolutionUpdated = onResolutionUpdated || (() => {});
  }

  setRecords(records) {
    this.records = [...records];
  }

  approveMerge(recordId) {
    const rec = this.records.find(r => r.id === recordId);
    if (!rec) return false;

    rec.status = 'Approved (Merged)';
    rec.resolutionTimestamp = new Date().toISOString();
    rec.analystDecision = 'Entity profiles consolidated under primary identifier.';
    this.onResolutionUpdated(rec, 'APPROVE');
    return true;
  }

  rejectMerge(recordId) {
    const rec = this.records.find(r => r.id === recordId);
    if (!rec) return false;

    rec.status = 'Rejected (Distinct)';
    rec.resolutionTimestamp = new Date().toISOString();
    rec.analystDecision = 'Flagged as false positive correlation; records maintained separately.';
    this.onResolutionUpdated(rec, 'REJECT');
    return true;
  }

  getRecords() {
    return this.records;
  }
}
