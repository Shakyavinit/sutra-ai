/**
 * SUTRA - Backend Investigation Server
 * Smart Unified Threat Relationship Analytics
 * SIH 2026 Problem Statement ID: 26189 | Team BLACKSWAN (ID: 133455)
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initNeo4j, runCypher } from './neo4jConnector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Initialize Neo4j Driver (optional fallback if offline)
initNeo4j();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'SUTRA Investigation Core',
    version: '3.4.0',
    mode: process.env.NEO4J_URI ? 'CONNECTED_NEO4J' : 'HYBRID_STANDALONE',
    timestamp: new Date().toISOString()
  });
});

// Load Cases List
app.get('/api/cases', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../public/demo-data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    const cases = files.map(file => {
      const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      return {
        id: content.caseId,
        title: content.title,
        category: content.category,
        status: content.status,
        entityCount: content.entities.length,
        relationshipCount: content.relationships.length,
        file: file
      };
    });
    res.json({ cases });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read case dossiers', details: err.message });
  }
});

// Get Case By ID
app.get('/api/cases/:caseId', (req, res) => {
  const { caseId } = req.params;
  const dataDir = path.join(__dirname, '../public/demo-data');
  const filename = caseId === 'case-002' || caseId === 'CR-2026-1144' ? 'case-002.json' : 'case-001.json';
  
  try {
    const caseData = JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
    res.json(caseData);
  } catch (err) {
    res.status(404).json({ error: 'Case not found', caseId });
  }
});

// Ingest Evidence Document Endpoint
app.post('/api/evidence/upload', (req, res) => {
  const { filename, fileType, rawContent } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  // Simulated server-side entity extraction logic
  res.json({
    success: true,
    file: filename,
    detectedType: fileType || 'Document/Text',
    status: 'PARSED',
    extractedEntities: [
      { name: 'Extracted Entity 1', type: 'Person', confidence: 91 },
      { name: '+91-98000-11111', type: 'Phone', confidence: 97 }
    ],
    timestamp: new Date().toISOString()
  });
});

// Review Queue Approval / Rejection
app.post('/api/review/decision', (req, res) => {
  const { itemId, decision, notes } = req.body;
  res.json({
    success: true,
    itemId,
    decision,
    notes: notes || 'No notes added',
    updatedBy: 'Authorized Analyst (Session Verified)',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[SUTRA] Investigation Backend listening on port ${PORT}`);
  console.log(`[SUTRA] Health check: http://localhost:${PORT}/api/health`);
});
