# SUTRA Backend & Neo4j Integration Guide

**SUTRA: Smart Unified Threat Relationship Analytics**  
*SIH 2026 Problem Statement ID: 26189 | Team BLACKSWAN (ID: 133455)*

---

## 1. Overview
The SUTRA backend microservice coordinates multi-source ingestion (FIRs, CDRs, Bank Transactions, Surveillance Reports) and translates them into high-performance graph topologies hosted on **Neo4j Enterprise / Community** or local Docker containers.

When deployed on **GitHub Pages**, the frontend automatically operates in **Demo Mode**, loading isolated case dossiers from `public/demo-data/` with full client-side interactivity. When a real backend is available (via `VITE_API_BASE_URL`), the UI transitions automatically to Live Server Mode.

---

## 2. Local Setup & Docker Deployment

### Step A: Start Neo4j via Docker
```bash
docker run -d \
  --name sutra-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/sutra_secure_pass \
  -e NEO4J_PLUGINS='["graph-data-science", "apoc"]' \
  neo4j:5.18-community
```

### Step B: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure parameters:
```env
PORT=3000
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=sutra_secure_pass
```

### Step C: Start the Investigation Service
```bash
npm install
npm run server
```

---

## 3. API Endpoints
- `GET /api/health` — Verifies engine status & Neo4j link
- `GET /api/cases` — Lists active investigation dossiers
- `GET /api/cases/:id` — Fetches full graph nodes and relationships
- `POST /api/evidence/upload` — Ingests unstructured files for NLP extraction
- `POST /api/review/decision` — Commits analyst approvals to the tamper-proof ledger
