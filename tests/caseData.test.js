import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GraphEngine } from '../src/graphEngine.js';
import { EvidenceParser } from '../src/uploadParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Case Demonstration Data Integrity & Completeness', () => {
  const caseFiles = ['case-001.json', 'case-002.json'];

  caseFiles.forEach(file => {
    it(`verifies schema, node counts, and referential integrity for ${file}`, () => {
      const filePath = path.join(__dirname, '../public/demo-data', file);
      expect(fs.existsSync(filePath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      expect(data.caseId).toBeDefined();
      expect(data.title).toBeDefined();
      expect(data.entities).toBeDefined();
      expect(data.relationships).toBeDefined();

      // All demonstration cases must have exactly 15 entities
      expect(data.entities.length).toBe(15);
      expect(data.relationships.length).toBeGreaterThanOrEqual(10);

      // Verify referential integrity of edges (all edges must connect valid nodes)
      const cleanRels = EvidenceParser.validateReferentialIntegrity(data.entities, data.relationships);
      expect(cleanRels.length).toBe(data.relationships.length);

      // Verify that every entity type normalizes to a recognized GraphEngine category
      const recognizedCategories = new Set(['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location', 'Event']);
      data.entities.forEach(entity => {
        const canonical = GraphEngine.normalizeType(entity.type);
        expect(recognizedCategories.has(canonical)).toBe(true);
      });
    });
  });

  it('ensures Case 2 Bank Account / Wallet entities are canonically recognized as BankAccount', () => {
    const filePath = path.join(__dirname, '../public/demo-data/case-002.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const walletNodes = data.entities.filter(e => e.type.includes('Wallet') || e.type.includes('Bank'));
    expect(walletNodes.length).toBeGreaterThan(0);

    walletNodes.forEach(node => {
      const canonical = GraphEngine.normalizeType(node.type);
      expect(canonical).toBe('BankAccount');
    });
  });
});
