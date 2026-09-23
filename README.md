# SUTRA: Smart Unified Threat Relationship Analytics

<p align="center">
  <strong>AI-Powered Criminal Network Analysis System</strong><br>
  <em>Fragmented Evidence to Verified Criminal Networks</em>
</p>

<p align="center">
  <a href="https://shakyavinit.github.io/sutra-ai/"><img src="https://img.shields.io/badge/Live%20Prototype-GitHub%20Pages-0284c7?style=for-the-badge&logo=github" alt="Live Prototype" /></a>
  <a href="#"><img src="https://img.shields.io/badge/SIH%20Problem%20Statement-26189-d97706?style=for-the-badge" alt="SIH PS 26189" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Team-BLACKSWAN%20(133455)-10b981?style=for-the-badge" alt="Team BLACKSWAN" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Theme-Blockchain%20%26%20Cybersecurity-6366f1?style=for-the-badge" alt="Theme" /></a>
</p>

---

## 🌐 Live Prototype URL
The official, temporary prototype web application is live and accessible at:  
👉 **[https://shakyavinit.github.io/sutra-ai/](https://shakyavinit.github.io/sutra-ai/)**

---

## 📌 Project Identity & Overview

| Attribute | Specification |
| :--- | :--- |
| **Product Name** | **SUTRA** |
| **Full Form** | **Smart Unified Threat Relationship Analytics** |
| **Project Title** | **SUTRA – AI-Powered Criminal Network Analysis** |
| **Tagline** | *Fragmented Evidence to Verified Criminal Networks* |
| **SIH 2026 PS ID** | **26189** |
| **Team Name** | **BLACKSWAN** |
| **Team ID** | **133455** |
| **Category** | **Software** |
| **Theme** | **Blockchain & Cybersecurity** |
| **Target Users** | State Police Cyber Cells, Crime Branches & Central LEAs |

---

## 🔍 The Investigation Problem

Law enforcement investigators spend days manually cross-referencing police FIRs, telecom CDR dumps, bank transaction spreadsheets, and field surveillance reports. Critical links between criminal kingpins, money-layering conduits, and logistical assets are frequently obscured across agency silos.

**SUTRA** solves this challenge by ingesting multi-source evidentiary documents, extracting entities, resolving aliases, and generating an explainable, interactive knowledge graph with human-in-the-loop verification.

---

## 🔄 The SUTRA Investigative Workflow

```
Evidence Upload
      ↓
Text & Data Extraction
      ↓
Entity Extraction
      ↓
Identity Resolution
      ↓
Criminal Network Graph
      ↓
Evidence Verification
      ↓
Human Approval
      ↓
Court-Ready Case Dossier
```

---

## 🚀 Key Functional Capabilities

### 1. Multi-Source Evidence Ingestion
- Ingests structured and unstructured inputs:
  - Police FIRs & Charge-sheets (PDF / Text)
  - Telecom CDR & Tower Dumps (CSV)
  - Bank Account & RTGS/IMPS Transaction Records (CSV)
  - Field Surveillance Logs & ANPR FASTag Feeds (JSON)
- Safe client-side parsing in static demonstration mode.

### 2. High-Performance Dynamic Network Graph
- **Dynamic Viewport & Auto-Resize**: Eliminates graph clipping issues across all screen resolutions and layout transitions.
- **Interactive Controls**: Smooth pan, zoom to cursor, node drag, edge selection, "Fit to View", and "Reset View".
- **Filtering Suite**: Real-time filtering by Entity Type, Relationship Type, and Evidentiary Confidence.
- **Node Search**: Instantly locate nodes and auto-center the viewport.

### 3. Evidentiary Audit Panel (Drawer)
- Clicking any node or relationship opens a detailed evidentiary breakdown:
  - Source file and row/span citations
  - Confidence percentage meter
  - Extraction methodology
  - Current analyst verification status (`Verified`, `Needs Review`, `AI Suggested`, `Rejected`)
  - Prominent statutory notice:
    > *"AI-generated relationships remain investigative leads until verified by an authorized analyst."*

### 4. Probabilistic Identity Resolution
- Identifies aliases and duplicates referring to the same criminal entity (e.g. `Rahim Khan` alias `Tiger Bhai`, or `Aniket Verma` alias `@shadow_lead_99`).
- Quantifies fuzzy matching factors: IMEI overlaps, co-location clusters, and shared transport links.
- Interactive **"Approve Merge"** and **"Reject Merge"** buttons that dynamically update local state.

### 5. Chronological Case Timeline
- Correlates multi-source events into a single timeline:
  - FIR registration
  - High-value banking transfers
  - Intercepted call bursts
  - FASTag toll crossing timestamps
  - Physical surveillance sightings

### 6. Analyst Human-in-the-Loop Review Queue
- Triages suspicious indicators:
  - Low-confidence entities (<70%)
  - Inferred multi-hop financial conduits
  - Anomalous nocturnal call velocity
- Allows officers to Approve, Reject, and append field notes to the audit trail.

### 7. Court-Ready Case Dossier Export
- Generates a formatted intelligence report featuring executive summaries, verified entity rosters, conduit tables, and sign-off blocks.
- Clean printable formatting via browser print dialog (`window.print()`).

---

## 📂 Pre-Loaded Fictional Demonstration Cases

The prototype includes two distinct, fully populated investigation dossiers stored as external JSON files in `public/demo-data/`:

1. **`case-001.json` — Operation Falcon: Inter-State Arms & Narcotics Supply Chain**
   - Category: Organized Crime / Arms Trafficking
   - Focus: Cross-border weapons pipeline, vehicle logistics tracking, and hawala pool clearing.
   - Entities: 15 nodes (Rahim Khan, Vikram Solanki, Scorpio DL-01-AB-4491, etc.)

2. **`case-002.json` — Operation Ghost Ledger: Cyber Mule & USDT Layering Network**
   - Category: Cyber Financial Fraud / Mule Networks
   - Focus: Telegram task fraud, rapid 3-tier bank layering, and P2P cryptocurrency conversion.
   - Entities: 15 nodes (Aniket Verma, SBI Mule Tier-1, USDT ERC-20 hot wallet, etc.)

*Switching between cases dynamically updates all dashboard statistics, entity rosters, graph topologies, timelines, and review queues.*

---

## 🛠️ Local Development & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/Shakyavinit/sutra-ai.git
cd sutra-ai

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🔌 Connecting to Local Backend & Neo4j

When running in production on GitHub Pages, SUTRA automatically falls back to **Demo Mode** using isolated demonstration dossiers. To connect the frontend to a live Neo4j database and backend API:

### 1. Start Neo4j Database
```bash
docker run -d \
  --name sutra-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/sutra_secure_password \
  neo4j:5.18-community
```

### 2. Configure Backend Environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=3000
VITE_API_BASE_URL=http://localhost:3000
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=sutra_secure_password
```

### 3. Launch Backend Service
```bash
npm run server
```

---

## 🔒 Security & Data Integrity Compliance

- **No Secrets Published**: Strict `.gitignore` policy excludes `.env`, private keys, certificates, database credentials, and raw logs.
- **Fictional Data**: All names, mobile numbers, vehicle registrations, and bank account numbers in the packaged demo cases are synthesized demonstration artifacts.
- **No Direct Gov Endorsement Claims**: Prototype is clearly branded as an academic / SIH hackathon demonstration developed by Team BLACKSWAN.

---

## 👨‍💻 Project Team & Attribution

- **Product**: SUTRA (Smart Unified Threat Relationship Analytics)
- **SIH Team**: BLACKSWAN (Team ID: 133455)
- **Problem Statement ID**: 26189
- **Repository Owner**: [Shakya Vinit (@Shakyavinit)](https://github.com/Shakyavinit)
- **Upstream Source Remote**: Preserved under `upstream` remote reference.

---

## 📄 License
This project is released under the [MIT License](LICENSE).
