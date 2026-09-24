/**
 * SUTRA - Tamper-Evident Hash-Chained Demo Audit Log
 * SIH 2026 Problem Statement ID: 26189 | Team BLACKSWAN
 *
 * Implements an append-only, SHA-256 cryptographically chained log
 * for documenting all analyst decisions, identity resolution merges,
 * and evidentiary additions during SIH evaluation.
 *
 * NOTE: This is a client-side tamper-evident demonstration audit log.
 * Enterprise production architecture scales to permissioned Hyperledger Fabric.
 */

export class AuditChain {
  constructor(caseId = 'case-001') {
    this.caseId = caseId;
    this.storageKey = `sutra_audit_log_${caseId}`;
    this.entries = [];
    this.loadFromStorage();
  }

  setCase(caseId) {
    this.caseId = caseId;
    this.storageKey = `sutra_audit_log_${caseId}`;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.entries = JSON.parse(raw);
      } else {
        this.entries = [];
        this.seedGenesisEntry();
      }
    } catch (e) {
      console.warn('[SUTRA AuditChain] LocalStorage inaccessible, running in-memory:', e);
      this.entries = [];
      this.seedGenesisEntry();
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (e) {
      console.warn('[SUTRA AuditChain] Failed to persist to localStorage:', e);
    }
  }

  async seedGenesisEntry() {
    const genesisData = {
      id: `AUD-${this.caseId}-GENESIS`,
      timestamp: new Date().toISOString(),
      analyst: 'System (Automated Ingestion Protocol)',
      action: 'CASE_DOSSIER_INITIALIZED',
      targetId: this.caseId,
      targetName: `Case Dossier ${this.caseId}`,
      previousState: 'UNINITIALIZED',
      newState: 'LOADED',
      notes: 'Initial cryptographic genesis state for demonstration dossier.',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000'
    };
    genesisData.hash = await this.computeHash(genesisData);
    this.entries = [genesisData];
    this.saveToStorage();
  }

  async append(action, targetId, targetName, previousState, newState, notes = '', analyst = 'Demo Analyst (ID: LEA-8891)') {
    const prevEntry = this.entries.length > 0 ? this.entries[this.entries.length - 1] : null;
    const prevHash = prevEntry ? prevEntry.hash : '0000000000000000000000000000000000000000000000000000000000000000';

    const entryData = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      analyst,
      action,
      targetId,
      targetName,
      previousState,
      newState,
      notes: notes || 'Analyst decision recorded in demonstration audit trail.',
      prevHash
    };

    entryData.hash = await this.computeHash(entryData);
    this.entries.push(entryData);
    this.saveToStorage();
    return entryData;
  }

  async computeHash(entry) {
    const canonicalString = [
      entry.id,
      entry.timestamp,
      entry.analyst,
      entry.action,
      entry.targetId,
      entry.targetName,
      entry.previousState,
      entry.newState,
      entry.notes,
      entry.prevHash
    ].join('|');

    return await this.sha256(canonicalString);
  }

  async sha256(message) {
    // Check if crypto.subtle is available
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback deterministic hash for Node test environments if needed
      let hash = 0;
      for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(64, '0');
    }
  }

  async verifyChain() {
    if (this.entries.length === 0) {
      return { isValid: true, message: 'Audit chain is empty.', count: 0 };
    }

    for (let i = 0; i < this.entries.length; i++) {
      const current = this.entries[i];

      // Verify cryptographic link to previous
      if (i > 0) {
        const previous = this.entries[i - 1];
        if (current.prevHash !== previous.hash) {
          return {
            isValid: false,
            errorIndex: i,
            message: `Hash link broken between entry #${i - 1} (${previous.id}) and #${i} (${current.id}). Tampering detected!`,
            count: i
          };
        }
      }

      // Recompute hash
      const expectedHash = await this.computeHash(current);
      if (current.hash !== expectedHash) {
        return {
          isValid: false,
          errorIndex: i,
          message: `Digest mismatch at entry #${i} (${current.id}). Stored: ${current.hash.substring(0, 16)}..., Recomputed: ${expectedHash.substring(0, 16)}...`,
          count: i
        };
      }
    }

    return {
      isValid: true,
      count: this.entries.length,
      latestHash: this.entries[this.entries.length - 1].hash,
      message: `Audit chain cryptographically verified: All ${this.entries.length} entries intact and unaltered.`
    };
  }

  getEntries() {
    return [...this.entries];
  }

  async resetChain() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {}
    this.entries = [];
    await this.seedGenesisEntry();
  }
}
