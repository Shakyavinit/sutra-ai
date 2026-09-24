import { describe, it, expect } from 'vitest';
import { EvidenceParser } from '../src/uploadParser.js';

describe('EvidenceParser Multi-Source Ingestion & Integrity', () => {
  it('parses RFC 4180 compliant CSVs with quotes and delimiters via PapaParse', () => {
    const csvContent = `Caller,Callee,Duration,TowerID\n"+91-98201-44019","+91-98711-20914",120s,DEL-NDLS-04\n"+91-98201-44019","+91-97110-39182",84s,"DEL, South Ext"`;
    const result = EvidenceParser.parseCSV('test_cdr.csv', csvContent, 'dummy-hash');

    expect(result.status).toBe('SUCCESS');
    expect(result.detectedType).toMatch(/CDR/i);
    expect(result.entities.length).toBeGreaterThanOrEqual(2);
    expect(result.relationships.length).toBe(2);
  });

  it('generates deterministic stable entity IDs', () => {
    const id1 = EvidenceParser.makeStableId('Phone', '+91-98201-44019');
    const id2 = EvidenceParser.makeStableId('Phone', '+91-98201-44019');
    const id3 = EvidenceParser.makeStableId('Phone', '+91-99999-00000');

    expect(id1).toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id1).toMatch(/^E-PHO-/);
  });

  it('catches referential integrity issues when edges reference missing nodes', () => {
    const entities = [
      { id: 'E-001', name: 'Node 1' },
      { id: 'E-002', name: 'Node 2' }
    ];

    const validEdges = [
      { source: 'E-001', target: 'E-002', type: 'CALLS' }
    ];

    const invalidEdges = [
      { source: 'E-001', target: 'E-MISSING-999', type: 'CALLS' }
    ];

    const cleanValid = EvidenceParser.validateReferentialIntegrity(entities, validEdges);
    const cleanInvalid = EvidenceParser.validateReferentialIntegrity(entities, invalidEdges);

    expect(cleanValid.length).toBe(1);
    expect(cleanInvalid.length).toBe(0);
  });

  it('honestly handles PDF uploads without fabricating entities in client mode', async () => {
    const mockPdfFile = { name: 'FIR-142.pdf', size: 1048576 };
    const result = await EvidenceParser.parseFile(mockPdfFile, '%PDF-1.4 mock binary');

    expect(result.status).toBe('BACKEND_REQUIRED');
    expect(result.entities).toEqual([]);
    expect(result.relationships).toEqual([]);
    expect(result.message).toMatch(/backend microservice with Tesseract\/OCR/);
  });
});
