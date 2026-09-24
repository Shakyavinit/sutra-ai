# AI-Powered Criminal Network Analysis System
### Prototype Codename: SUTRA (Smart Unified Threat Relationship Analytics)

<p align="center">
  <strong>Smart India Hackathon 2026 | Problem Statement ID: PS26189</strong><br>
  <em>Fragmented Evidence to Explainable Criminal Network Leads</em>
</p>

<p align="center">
  <a href="https://shakyavinit.github.io/sutra-ai/"><img src="https://img.shields.io/badge/Live%20Prototype-GitHub%20Pages-0284c7?style=for-the-badge&logo=github" alt="Live Prototype" /></a>
  <a href="#"><img src="https://img.shields.io/badge/SIH%20Problem%20Statement-PS26189-d97706?style=for-the-badge" alt="SIH PS 26189" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Team-BLACKSWAN%20(ID:%20133455)-10b981?style=for-the-badge" alt="Team BLACKSWAN" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Theme-Blockchain%20%26%20Cybersecurity-6366f1?style=for-the-badge" alt="Theme" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Tests-16%20Passing-brightgreen?style=for-the-badge" alt="Tests" /></a>
</p>

---

## 🌐 Live Prototype Deployment
The evaluation prototype is deployed and accessible on GitHub Pages:  
👉 **[https://shakyavinit.github.io/sutra-ai/](https://shakyavinit.github.io/sutra-ai/)**

---

## 📌 Project Identity & Metadata

| Specification Attribute | Details |
| :--- | :--- |
| **Official Solution Title** | **AI-Powered Criminal Network Analysis System** |
| **Prototype Codename** | **SUTRA** (*Smart Unified Threat Relationship Analytics*) |
| **SIH Problem Statement** | **PS26189** (*Software Category*) |
| **SIH Theme** | **Blockchain & Cybersecurity** |
| **Team Name & ID** | **BLACKSWAN** (Team ID: **133455**) |
| **Lead Developer** | Shakya Vinit ([@Shakyavinit](https://github.com/Shakyavinit)) |
| **Repository URL** | [https://github.com/Shakyavinit/sutra-ai](https://github.com/Shakyavinit/sutra-ai) |
| **Target End-Users** | State Police Cyber Cells, Crime Investigation Branches & Central LEAs |
| **Admissibility Standard** | Section 63, Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023) |

> [!NOTE]
> **Academic Prototype Disclaimer:** SUTRA is the evaluation prototype codename for the SIH 2026 competition. All data presented in the packaged demonstration dossiers are completely synthetic demonstration artifacts. In accordance with the *Bharatiya Sakshya Adhiniyam, 2023*, algorithmic relationship inferences constitute investigative leads and require independent human investigator verification.

---

## 🔍 The Operational Challenge

Law enforcement investigators spend days manually cross-referencing police FIRs, telecom CDR dumps, bank transaction spreadsheets, and field surveillance reports. Critical links between criminal kingpins, money-layering conduits, and logistical assets are frequently obscured across agency silos.

The **AI-Powered Criminal Network Analysis System** ingests multi-source evidentiary documents, calculates exact network centrality metrics to surface hidden brokers, resolves aliases probabilistically, and produces an explainable, court-admissible draft intelligence dossier backed by a tamper-evident cryptographic audit chain.

---

## 🔄 Deterministic Investigative Pipeline

```
┌─────────────────────────┐
│ 1. Multi-Source Ingest  │ (CDRs, Banking RTGS/IMPS, Police FIRs, ANPR Sightings)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 2. Parsing & Provenance │ (RFC 4180 Ingestion + SHA-256 Chain of Custody)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3. Entity Extraction    │ (Deterministic Stable IDs: E-PHO-, E-ACC-, E-VEH-)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 4. Identity Resolution  │ (Fuzzy Factor Corroboration: IMEI, MSISDN, Location)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 5. Network Graph Core   │ (Force Simulation, Spatial Culling, Camera Transform)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 6. Centrality Analytics │ (Brandes Betweenness, Degree, IPS Scoring 0–100)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 7. Human Lead Triage    │ (Investigator Approvals Logged to Hash-Chained Audit)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 8. Section 63 Dossier   │ (Court-Admissible Draft Report with Watermark)
└─────────────────────────┘
```

---

## 🚀 Key Technical Upgrades & Capabilities

### 1. Algorithmic Centrality & Priority Scoring (`src/graphAnalytics.js`)
- **Brandes Algorithm ($O(V \cdot E)$)**: Calculates exact unweighted shortest-path betweenness centrality to detect critical intermediary conduits, financial mules, and cutouts bridging disparate network clusters.
- **Normalized Degree Centrality**: Measures communication/transaction hub density normalized by $(n - 1)$.
- **Deterministic Community Detection**: Breadth-first clustering to identify tactical sub-cells.
- **Explainable Investigative Priority Score (IPS: 0–100)**: Formulated from normalized degree (35%), betweenness (35%), multi-source corroboration (15%), and verified evidentiary links (15%). Every score includes human-readable factor rationales.
- **Shortest Path Conduit Discovery**: Bi-directional BFS discovering exact multi-hop conduits between any two entities (e.g. tracing Kingpin Tariq to Dubai Hawala escrow).

### 2. Tamper-Evident Hash-Chained Audit Trail (`src/auditChain.js`)
- Append-only, SHA-256 cryptographically chained audit log for every analyst triage decision, merge approval, and evidence ingestion event.
- Built-in `verifyChain()` routine detecting any modification to prior entries or hashes.
- Interactive **"Verify Chain Integrity"** and **"View Audit Log"** modal dialogs.
- Clear architecture mapping to enterprise permissioned consortium blockchain (Hyperledger Fabric).

### 3. Robust Multi-Source Evidence Ingestion (`src/uploadParser.js`)
- **RFC 4180 Ingestion**: PapaParse engine with full quote-escape and delimiter handling.
- **Deterministic Stable Entity IDs**: Hash-derived canonical IDs (`E-PHO-...`, `E-ACC-...`, `E-VEH-...`).
- **Cryptographic Provenance**: Real-time SHA-256 hashing of incoming evidence files for chain of custody.
- **Honest PDF Handling**: Clear notice explaining in-browser text extraction vs backend deep OCR without fabricating false entities.

### 4. Interactive Guided SIH Demo Walkthrough
- Integrated 7-step guided judge tour with floating progress bar:
  1. Case Telemetry & KPI Analysis
  2. In-Browser Field CDR Ingestion & Hashing
  3. Graph Topology & Kingpin Spotting (IPS 96)
  4. Tracing Hawala Money Trail Conduits
  5. Probabilistic Identity Disambiguation
  6. Human-in-the-Loop Triage & Digital Signing
  7. Section 63 BSA 2023 Draft Intelligence Dossier

### 5. High-Performance Graph Canvas (`src/graphEngine.js`)
- Custom HTML5 Canvas simulation with velocity-Verlet integration and collision repulsion.
- Simulation cooldown after convergence to preserve CPU/battery.
- Non-destructive search highlighting: dimming irrelevant nodes while centering on matches.
- Canonical entity normalization recognizing all 15 nodes in Case 1 and Case 2 (including bank accounts and cryptocurrency wallets).

---

## 🏛️ Architecture Comparison: Prototype vs Enterprise Scale

| Component Layer | Client Evaluation Prototype (Current) | Enterprise Law-Enforcement Target |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5 Canvas + Vanilla JS + Vite SPA | React / Next.js Micro-Frontends + WebGL / Three.js |
| **Graph Database** | In-Memory Adjacency Graph + Brandes Engine | **Neo4j Enterprise Cluster** + Graph Data Science (GDS) |
| **Centrality Compute** | Client-Side Brandes Betweenness ($O(V \cdot E)$) | Distributed Neo4j GDS PageRank, Louvain & GraphSAGE |
| **NLP & Ingestion** | PapaParse RFC 4180 + Regex NER + SHA-256 | **Legal-BERT / IndicBERT** + Tesseract OCR + Kafka Bus |
| **Audit & Provenance** | Append-Only SHA-256 Hash Chain (LocalStorage) | **Hyperledger Fabric** Permissioned Multi-Agency Consortium |
| **Deployment Model** | 100% Client-Side Static (GitHub Pages) | Air-Gapped Sovereign Cloud / On-Prem Kubernetes Cluster |
| **Legal Compliance** | Draft Lead Report (Sec 63 BSA 2023 Notice) | Cryptographically Signed Evidence Certificate (Sec 63 BSA) |

---

## 📂 Packaged Demonstration Cases

The prototype includes two comprehensive, 15-node demonstration dossiers in `public/demo-data/`:

1. **`case-001.json` — Operation Falcon: Inter-State Arms & Narcotics Syndicate**
   - Category: Organized Crime / Cross-Border Contraband
   - Key Entities: Tariq (Kingpin / IPS 96), Vikram Solanki (Logistics Broker / IPS 88), Scorpio DL-01-AB-4491, Hawala Pool Escrow.
   - 15 Entities / 14 Conduits / 4 Ingested Evidence Files.

2. **`case-002.json` — Operation Ghost Ledger: Cyber Mule & USDT Layering Network**
   - Category: Cyber Financial Fraud / Mule Networks
   - Key Entities: Aniket Verma (Mule Recruiter / IPS 94), SBI Tier-1 Mule Accounts, USDT ERC-20 Hot Wallet, Telegram Bot Controller.
   - 15 Entities / 12 Conduits / 4 Ingested Evidence Files.

---

## 🧪 Automated Test Suite

SUTRA includes an automated test suite verifying algorithms, data integrity, and security:

```bash
# Run Vitest test suite
npm test
```

### Test Coverage Highlights:
- **`tests/graphAnalytics.test.js`**: Verifies normalized degree centrality, Brandes unweighted betweenness centrality, BFS shortest paths, disconnected node handling, and Investigative Priority Score bounds (0–100).
- **`tests/auditChain.test.js`**: Verifies genesis block generation, SHA-256 cryptographic link continuity, tamper detection on manipulated notes, and ledger reset.
- **`tests/uploadParser.test.js`**: Verifies PapaParse RFC 4180 handling, deterministic stable IDs, referential integrity filtering, and honest PDF messaging.
- **`tests/caseData.test.js`**: Validates schema compliance, 15-node completeness, referential integrity, and canonical entity categorization for both demo cases.

---

## 🛠️ Local Installation & Development

```bash
# 1. Clone repository
git clone https://github.com/Shakyavinit/sutra-ai.git
cd sutra-ai

# 2. Install dependencies
npm install

# 3. Run automated tests
npm test

# 4. Start local Vite development server
npm run dev

# 5. Build production bundle
npm run build
```

---

## 🔌 Optional Local Backend & Neo4j Integration

To run the optional Node.js microservice and Neo4j database locally:

```bash
# 1. Start local Neo4j container
docker run -d \
  --name sutra-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/change_me_to_secure_password \
  neo4j:5.18-community

# 2. Configure environment
cp .env.example .env
# Set PORT=3000, NEO4J_URI=bolt://localhost:7687, NEO4J_PASSWORD=change_me_to_secure_password

# 3. Start Investigation Service
npm run server
```

---

## 🔒 Security & Data Ethics

- **Zero Hardcoded Credentials**: Strictly audited; `.env` excluded via `.gitignore`.
- **Content Security Policy**: Hardened CSP and strict referrer policy tags configured in `index.html`.
- **Input Sanitization**: All user-rendered strings sanitized via DOMPurify to prevent XSS.
- **Synthetic Demonstration Data**: All persons, phone numbers, vehicle registrations, and financial accounts are purely fictional artifacts generated for SIH technical evaluation.
- **Legal Compliance**: Explicitly aligned with Section 63 of the *Bharatiya Sakshya Adhiniyam, 2023* (BSA 2023) regarding the admissibility of electronic records.

---

## 👥 Team Attribution & Attribution Notice

- **Project**: AI-Powered Criminal Network Analysis System (Prototype Codename: SUTRA)
- **SIH Team**: BLACKSWAN (Team ID: 133455)
- **Problem Statement ID**: PS26189
- **Lead Developer**: [Shakya Vinit (@Shakyavinit)](https://github.com/Shakyavinit)
- **Upstream Source Remote**: Preserved under `upstream` reference (`https://github.com/Dhruvranax/crimial_network_ai.git`).

---

## 📄 License
This project is released under the [MIT License](LICENSE).
