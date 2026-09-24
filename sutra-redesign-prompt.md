# SUTRA AI — Complete UI/UX Redesign Prompt
## For: Antigravity / Claude Code / Any AI Coding Agent
## Project: https://shakyavinit.github.io/sutra-ai/
## Stack: Vite + Vanilla JS + CSS (single `style.css`)

---

## CONTEXT — What is SUTRA?

SUTRA (Smart Unified Threat Relationship Analytics) is an AI-powered Criminal Network Analysis tool built for Indian Law Enforcement Agencies (LEAs). It is a SIH 2026 hackathon project (Problem Statement ID: 26189, Team BLACKSWAN, ID: 133455). It ingests multi-source evidence (FIRs, CDRs, bank records), extracts entities, resolves identities, builds an interactive criminal network graph, and exports court-ready dossiers.

**Target audience:** State police cyber cells, crime branch investigators, central LEAs.  
**Tone:** Government-grade authority, precision, and trust. NOT a consumer app.

---

## DESIGN PHILOSOPHY (UI UX Pro Max — Cybersecurity/Government Pattern)

Product type: **Cybersecurity Intelligence Platform**  
UI Style: **Dark Ops / Technical Dark** — deep navy-black base, precise data-dense layout, surgical use of semantic color.  
Pattern: **Command-Center Dashboard** — data-forward hero, immediate credibility, workflow clarity.  
Anti-patterns to AVOID: 
- Bright neon glows / gaming aesthetic
- AI purple/pink gradients
- Glassmorphism (too decorative for law enforcement)
- Friendly rounded consumer cards
- Empty white space sections

**SUTRA design must feel like:** Palantir Gotham + Recorded Future + a serious DRDO product. Cold, precise, trustworthy.

---

## DESIGN SYSTEM TOKENS

### Colors
```css
:root {
  /* Base surfaces — dark ops */
  --bg-deep:     #050A14;   /* deepest background */
  --bg-base:     #080E1C;   /* page base */
  --bg-panel:    #0D1526;   /* panel/card bg */
  --bg-elevated: #111D33;   /* elevated cards */
  --bg-border:   rgba(255,255,255,0.07); /* default border */
  --bg-border-strong: rgba(255,255,255,0.14);

  /* Semantic — critical for law enforcement UI */
  --red-threat:  #FF3B3B;   /* CRITICAL / THREAT / HIGH RISK */
  --red-soft:    rgba(255,59,59,0.12);
  --amber-review:#F59E0B;   /* PENDING REVIEW / MEDIUM */
  --amber-soft:  rgba(245,158,11,0.12);
  --green-verify:#10B981;   /* VERIFIED / SAFE / CONFIRMED */
  --green-soft:  rgba(16,185,129,0.12);
  --blue-ai:     #3B82F6;   /* AI SUGGESTED / SYSTEM */
  --blue-soft:   rgba(59,130,246,0.10);
  --cyan-accent: #06B6D4;   /* primary accent — interactive */
  --cyan-soft:   rgba(6,182,212,0.10);

  /* Text */
  --text-primary:   #F0F4FF;
  --text-secondary: #8896AE;
  --text-muted:     #4A5568;
  --text-on-accent: #FFFFFF;

  /* Status badge backgrounds */
  --badge-critical: #FF3B3B;
  --badge-review:   #F59E0B;
  --badge-verified: #10B981;
  --badge-ai:       #3B82F6;
  --badge-rejected: #6B7280;
}
```

### Typography
```css
/* Import in index.html <head> */
/* fonts: JetBrains Mono (data/code labels), Space Grotesk (headings), Inter (body) */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

--font-display: 'Space Grotesk', sans-serif;  /* ALL headings */
--font-body:    'Inter', sans-serif;           /* body, labels */
--font-mono:    'JetBrains Mono', monospace;   /* IDs, codes, case numbers, confidence %, entity IDs */
```

### Spacing scale
```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 96px
```

### Border radius
```
4px  — data tables, code blocks
8px  — small badges, chips
12px — metric cards, panels
16px — section containers
24px — hero elements
```

---

## SECTION-BY-SECTION REDESIGN INSTRUCTIONS

---

### 1. TOP NAV BAR

**Current problem:** Plain HTML anchor list, no visual distinction.

**New design:**
```
Height: 56px
Background: rgba(5,10,20,0.95) with backdrop-filter: blur(20px)
Border-bottom: 1px solid var(--bg-border)
Position: fixed top

Left side:
  [SUTRA wordmark — Space Grotesk 700, 18px, letter-spacing: -0.3px, color: #F0F4FF]
  [v3.4 chip — JetBrains Mono, 10px, background: var(--cyan-soft), color: var(--cyan-accent), border: 1px solid rgba(6,182,212,0.25), border-radius: 4px, padding: 2px 8px]
  [RESTRICTED PROTOTYPE chip — 10px, background: var(--red-soft), color: var(--red-threat), border-radius: 4px]

Center (desktop only):
  Scrollspy nav links — Inter 13px 500, color: var(--text-secondary)
  Active link: color var(--cyan-accent), border-bottom: 2px solid var(--cyan-accent)
  Links: Overview | Dashboard | Network Graph | Evidence | Entities | Timeline | Dossier

Right side:
  [Case selector dropdown — shows "CR-2026-0891: Op Falcon" with a chevron-down]
  [GitHub icon button]
```

---

### 2. LANDING / HERO SECTION

**Current problem:** Wall of text, no visual anchor, bland layout, no authority.

**New design:**

```
Background: var(--bg-deep)
Padding: 120px 0 80px (accounts for fixed nav)

Layout — 2-column grid on desktop (60% | 40%):

LEFT COLUMN:
  [classification badge]
  "RESTRICTED // LAW ENFORCEMENT PROTOTYPE"
  Style: JetBrains Mono 11px, color: var(--red-threat), letter-spacing: 2px
  left-border: 2px solid var(--red-threat), padding-left: 12px
  margin-bottom: 32px

  [SIH label]
  "SIH 2026 — Problem Statement 26189"
  Style: JetBrains Mono 11px, color: var(--text-muted), letter-spacing: 1px
  margin-bottom: 20px

  [Main headline — Space Grotesk 800, 56px desktop / 36px mobile]
  Line 1: "Fragmented Evidence."  (color: var(--text-secondary))
  Line 2: "Verified Networks."    (color: var(--text-primary))
  letter-spacing: -2px, line-height: 1.0
  margin-bottom: 24px

  [Sub headline — Inter 18px 400, color: var(--text-secondary), max-width: 480px]
  "SUTRA unifies FIRs, CDR dumps, bank records and surveillance logs into an explainable criminal knowledge graph — with human-in-the-loop verification."
  margin-bottom: 40px

  [Team identity row]
  "Team BLACKSWAN  ·  ID: 133455  ·  Category: Software  ·  Theme: Blockchain & Cybersecurity"
  JetBrains Mono 11px, color: var(--text-muted), margin-bottom: 40px

  [CTA buttons row]
  Primary CTA: "Launch Investigation Workspace"
    background: var(--cyan-accent), color: #000, font: Inter 14px 600
    padding: 12px 28px, border-radius: 8px
    hover: brightness(1.1), transform: translateY(-1px)
  
  Secondary CTA: "Explore Network Graph"
    background: transparent, color: var(--text-primary)
    border: 1px solid var(--bg-border-strong)
    padding: 12px 24px, border-radius: 8px

RIGHT COLUMN:
  [Identity card — dark panel]
  Background: var(--bg-panel)
  Border: 1px solid var(--bg-border)
  Border-top: 2px solid var(--cyan-accent)
  Border-radius: 12px
  Padding: 24px

  Header: "ACTIVE CASE DOSSIER" — JetBrains Mono 10px, color: var(--cyan-accent), letter-spacing: 2px
  
  Two dossier entries styled like classified files:
  ┌─────────────────────────────────────────┐
  │ [●] CR-2026-0891                        │
  │ Op Falcon                               │
  │ Interstate Arms & Narcotics             │
  │ ACTIVE • 15 entities • 28 relationships │
  └─────────────────────────────────────────┘
  ┌─────────────────────────────────────────┐
  │ [○] CR-2026-1144                        │
  │ Op Ghost Ledger                         │
  │ Cyber Mule & USDT Layering             │
  │ ACTIVE • 15 entities • 31 relationships │
  └─────────────────────────────────────────┘
  Active dossier gets cyan left-border + bg-elevated bg
```

---

### 3. INVESTIGATIVE WORKFLOW STRIP

**Current problem:** Plain text "1 → 2 → 3" with no visual weight.

**New design:**
```
Background: var(--bg-panel)
Border-top: 1px solid var(--bg-border)
Border-bottom: 1px solid var(--bg-border)
Padding: 40px 0

Section label: "DETERMINISTIC INVESTIGATIVE WORKFLOW" — JetBrains Mono 10px letter-spacing:2px color:var(--text-muted)
margin-bottom: 32px, text-align: center

8-step horizontal stepper (scrollable on mobile):

Each step:
  Step number circle: 28px diameter
    - Completed steps: bg var(--green-verify), color white, checkmark icon
    - Active step: bg var(--cyan-accent), color black, bold number
    - Future steps: bg var(--bg-elevated), color var(--text-muted), number
  Step label: Inter 12px 500, color var(--text-secondary), text-align: center, max-width: 80px
  Arrow connector: 40px wide, color var(--bg-border-strong)

Steps:
  01 Evidence Upload → 02 Text Extraction → 03 Entity Extraction → 
  04 Identity Resolution → 05 Network Graph → 06 Evidence Verification → 
  07 Human Approval → 08 Court Dossier
```

---

### 4. COMMAND DASHBOARD SECTION

**Current problem:** Empty metric cards, no visual status, looks unfinished.

**New design:**

**4a. Section header:**
```
"INVESTIGATION COMMAND DASHBOARD" — Space Grotesk 700 28px, color: var(--text-primary)
Sub: "Active Case Telemetry • CR-2026-0891: Op Falcon"
     JetBrains Mono 12px, color: var(--cyan-accent)

Right side: [+ Ingest Evidence button] [View Full Graph button]
Both buttons: small, 32px height, border: 1px solid var(--bg-border-strong)
Ingest button gets green left-accent color
```

**4b. Metric cards — 4 in a row:**
```
Each card:
  Background: var(--bg-panel)
  Border: 1px solid var(--bg-border)
  Border-top: 2px solid [accent-color-per-card]
  Border-radius: 12px
  Padding: 20px 24px

Card 1 — Evidence Files (accent: var(--blue-ai))
  Icon: 📁 blue
  Big number: "0" — Space Grotesk 700 36px, color: var(--text-primary)
  Label: "Evidence Files" — Inter 12px, color: var(--text-secondary)
  Sub-label: "FIRs, CDRs & Bank Logs" — Inter 11px, color: var(--text-muted)

Card 2 — Extracted Entities (accent: var(--cyan-accent))
  Big number: "0"
  Label: "Extracted Entities"
  Sub: "Persons, Phones, Vehicles, Accounts"

Card 3 — Detected Relationships (accent: var(--amber-review))
  Big number: "0"
  Label: "Detected Relationships"
  Sub: "Calls, Transfers & Sightings"

Card 4 — Pending Review (accent: var(--red-threat))
  Big number: "0"
  Label: "Pending Analyst Review"
  Sub: "Low-confidence & anomalous links"
  [If >0: add pulsing red dot animation to card border]
```

**4c. Case dossier table:**
```
Header: "REGISTERED INVESTIGATION DOSSIERS"
Sub: "Demonstration Mode: Select to switch active intelligence graph"
JetBrains Mono 10px letter-spacing, color: var(--text-muted)

Table:
  Background: var(--bg-panel)
  Border: 1px solid var(--bg-border)
  Border-radius: 12px
  Overflow: hidden

  Header row: bg var(--bg-elevated), text: JetBrains Mono 10px letter-spacing:1px, color: var(--text-muted)
  
  Columns: Case ID | Operation | Category | Graph Complexity | Status | Action

  Row styling:
    - border-bottom: 1px solid var(--bg-border)
    - hover: bg var(--bg-elevated)
    
  Status badge variants:
    ACTIVE: bg var(--green-soft), color var(--green-verify), border-radius 4px
    REVIEWING: bg var(--amber-soft), color var(--amber-review)
    CLOSED: bg transparent, color var(--text-muted), border 1px solid var(--bg-border)

  Case ID column: JetBrains Mono font
  Action column: "Activate" button — small, outline style
    Active case gets: "Active ✓" badge (cyan) instead of button
```

---

### 5. NETWORK GRAPH SECTION

**Current problem:** Controls are unstyled, instructions are plain text.

**New design:**
```
Section header bar:
  Left: "CRIMINAL NETWORK GRAPH" title
  Right: control toolbar (horizontal row of icon-buttons)
  
Control toolbar buttons:
  [Fit View] [Reset] [Zoom +] [Zoom -] [Screenshot]
  Style: 32px height, border: 1px solid var(--bg-border-strong)
  background: var(--bg-panel), color: var(--text-secondary)
  border-radius: 6px, padding: 0 12px
  hover: bg var(--bg-elevated), color var(--text-primary)

Left sidebar — filters panel:
  Width: 240px
  Background: var(--bg-panel)
  Border-right: 1px solid var(--bg-border)
  
  "FILTERS" — JetBrains Mono 10px, letter-spacing:2px, color: var(--text-muted)
  
  [Search input]
  background: var(--bg-deep), border: 1px solid var(--bg-border)
  border-radius: 6px, JetBrains Mono 13px
  placeholder: "Search node ID..."
  
  "MIN CONFIDENCE"
  Slider — styled with cyan thumb and track
  Value shown as: "0%" in JetBrains Mono
  
  "ENTITY TYPES"
  Checkboxes as styled toggle chips:
    [●] Person — cyan chip when active
    [●] Phone Number
    [●] Vehicle
    [●] Bank Account
    [●] Organization
    [●] Location
    [●] Event
  
  Each chip: border-radius:6px, padding:6px 12px
  Active: bg var(--cyan-soft), border: 1px solid rgba(6,182,212,0.3), color: var(--cyan-accent)
  Inactive: bg var(--bg-elevated), border: 1px solid var(--bg-border), color: var(--text-muted)

Graph canvas:
  Background: var(--bg-deep)
  Grid dot overlay (CSS): radial-gradient dots for "intelligence ops" feel
  
Graph node color coding (CRITICAL — implement this):
  Person node: circle, border: 2px solid var(--cyan-accent), fill: var(--bg-panel)
    Kingpin: border 3px solid var(--red-threat), fill: var(--red-soft)
  Phone node: hexagon, color: var(--amber-review)
  Vehicle node: rectangle, color: var(--blue-ai)
  Bank Account: diamond, color: var(--green-verify)
  Organization: pentagon, color: #A855F7 (purple)
  Location: pin shape, color: #F97316 (orange)

Edge color coding:
  Call relationship: var(--amber-review) dashed line
  Financial transfer: var(--green-verify) solid line with arrow
  Co-location: var(--text-muted) dotted line
  Arms/narcotics link: var(--red-threat) solid thick line

Evidence drawer (right side panel on node click):
  Width: 320px
  Background: var(--bg-panel)
  Border-left: 1px solid var(--bg-border)
  Border-top-left-radius: 12px
  
  Header:
    Entity name — Space Grotesk 700 18px
    Type badge (e.g. KINGPIN) — red badge
    Close [×] button
  
  Sections with JetBrains Mono 10px labels:
    INVESTIGATIVE ROLE / SOURCE DOCUMENT / EVIDENTIARY CONFIDENCE
  
  Confidence meter:
    Progress bar — full width, height 8px, border-radius 4px
    <70%: fill var(--red-threat)
    70-90%: fill var(--amber-review)
    >90%: fill var(--green-verify)
    Number: JetBrains Mono 700 28px, same color
  
  Analyst status chip:
    Verified: green chip
    Needs Review: amber chip
    AI Suggested: blue chip
    Rejected: gray chip
  
  Statutory notice:
    Background: var(--amber-soft)
    Border-left: 3px solid var(--amber-review)
    Border-radius: 6px, padding: 10px 14px
    Text: Inter 12px italic, color: var(--amber-review)
    "AI-generated relationships remain investigative leads until verified by an authorized analyst."
```

---

### 6. EVIDENCE INGESTION SECTION

**Current problem:** Upload area is plain with no visual distinction between file types.

**New design:**
```
Section header:
  "MULTI-SOURCE EVIDENCE INGESTION" title
  Sub: "Upload raw files for safe client-side entity extraction & graph enrichment"

Upload drop zone:
  Background: var(--bg-panel)
  Border: 2px dashed var(--bg-border-strong)
  Border-radius: 16px
  Padding: 48px
  text-align: center
  
  On hover: border-color var(--cyan-accent), bg var(--cyan-soft) subtle
  
  Upload icon: large SVG cloud-upload icon, color: var(--text-muted)
  Primary text: "Drop evidence files here" — Space Grotesk 600 18px
  Sub text: "or click to browse" — Inter 14px, color: var(--text-muted)
  
  Accepted format chips (below):
  [CDR CSV] [Banking CSV] [JSON Dossier] [Police FIR PDF] [TXT/LOG]
  Each chip: JetBrains Mono 11px, bg var(--bg-elevated)
  border: 1px solid var(--bg-border), border-radius: 4px, padding: 4px 10px

Pre-loaded samples — 2 cards side by side:

Card 1 — CDR Sample:
  Background: var(--bg-panel)
  Border: 1px solid var(--bg-border)
  Border-left: 3px solid var(--amber-review)
  Border-radius: 12px, padding: 20px
  
  Badge: "FIELD TOWER CDR" — JetBrains Mono 10px amber color
  Title: "Field Tower Dump CDR (CSV)"
  Meta: "4 telecom nodes • Nocturnal burst records"
  [Load CDR] button — small outline, amber accent

Card 2 — Banking Sample:
  Border-left: 3px solid var(--green-verify)
  Badge: "BANK LEDGER" — green
  Title: "Escrow Banking Batch (CSV)"
  Meta: "3 accounts • ₹16.7L RTGS trail"
  [Load Bank Ledger] button — green accent

Backend notice:
  Background: var(--blue-soft)
  Border: 1px solid rgba(59,130,246,0.2)
  Border-left: 3px solid var(--blue-ai)
  Border-radius: 8px, padding: 16px
  Icon: ℹ️ blue
  Text: Inter 13px, color: var(--text-secondary)
```

---

### 7. ENTITIES TABLE SECTION

**Current problem:** Plain HTML table with no styling.

**New design:**
```
Section: "EXTRACTED INTELLIGENCE ENTITIES"

Table redesign:
  Border: 1px solid var(--bg-border)
  Border-radius: 12px, overflow: hidden
  
  Header row:
    Background: var(--bg-elevated)
    JetBrains Mono 10px, letter-spacing: 1px, color: var(--text-muted)
    Uppercase column labels
    
  Data rows:
    bg: var(--bg-panel)
    border-bottom: 1px solid var(--bg-border)
    hover: bg var(--bg-elevated)
    
  Entity Type column — colored chip per type:
    Person: cyan chip
    Phone: amber chip
    Vehicle: blue chip
    Bank Account: green chip
    
  Investigative Role column:
    Kingpin: red badge with "KINGPIN" text
    Intermediary: amber badge
    Asset: blue badge
    
  Confidence column:
    <70%: JetBrains Mono, red colored number
    70-90%: amber
    >90%: green
    
  Review Status column:
    Verified: ● green dot + "Verified" text
    Needs Review: ● amber dot + "Needs Review"
    AI Suggested: ● blue dot + "AI Suggested"
    
  Action column:
    [View Details] small button per row
```

---

### 8. IDENTITY RESOLUTION SECTION

**New design:**
```
Section: "IDENTITY RESOLUTION & DEDUPLICATION"
Sub: "Probabilistic alias clustering, IMEI co-location & fuzzy record disambiguation"

Merge candidate cards:
  2-column grid on desktop
  
  Each card:
    Background: var(--bg-panel)
    Border: 1px solid var(--bg-border)
    Border-radius: 12px, padding: 24px
    
    Header: "MERGE CANDIDATE #X" — JetBrains Mono 10px, amber color
    Confidence score: large JetBrains Mono number (e.g. "87%") amber colored
    
    Two identity columns with "≡" (equals/merge) icon between them:
      Entity A: name, ID, sources
      Entity B: alias, sources, evidence
    
    Match factors list (small chips):
      [IMEI Overlap] [Co-location: 3x] [Same vehicle] etc.
      Each chip: 11px, bg var(--bg-elevated), border var(--bg-border)
    
    Action buttons:
      [✓ Approve Merge] — green outline, 12px
      [✗ Reject Merge] — red outline, 12px
    
    Status if actioned:
      "MERGED" — green badge over card
      "REJECTED" — gray badge with strikethrough styling
```

---

### 9. TIMELINE SECTION

**New design:**
```
Section: "CHRONOLOGICAL CASE TIMELINE"

Vertical timeline (left side is the time axis):
  Timeline line: 2px solid var(--bg-border-strong), left: 120px from left edge
  
  Each event:
    Time column (left): JetBrains Mono 11px, color: var(--text-muted), right-align
    
    Event dot on timeline:
      FIR registration: red dot (16px)
      Banking transfer: green dot
      CDR call burst: amber dot
      Vehicle sighting: blue dot
      Surveillance: purple dot
    
    Event card (right of dot):
      Background: var(--bg-panel)
      Border: 1px solid var(--bg-border)
      Border-left: 3px solid [event-type-color]
      Border-radius: 8px, padding: 14px 18px
      
      Event type chip at top
      Title: Inter 14px 600, color: var(--text-primary)
      Source: JetBrains Mono 11px, color: var(--text-muted)
      Details: Inter 13px, color: var(--text-secondary)
```

---

### 10. ANALYST REVIEW QUEUE

**New design:**
```
Section: "ANALYST HUMAN-IN-THE-LOOP REVIEW QUEUE"
Sub: "Triage flagged anomalies, low-confidence entities, and AI-inferred relationships"

Queue item cards:

  Each card:
    Background: var(--bg-panel)
    Border: 1px solid var(--bg-border)
    Border-radius: 12px, padding: 20px 24px
    
    Top row:
      Left: flag type chip
        "LOW CONFIDENCE" — amber
        "ANOMALOUS PATTERN" — red
        "AI INFERRED" — blue
      Right: confidence score (JetBrains Mono, color-coded)
    
    Title: Inter 15px 600
    Description: Inter 13px, color: var(--text-secondary)
    Source: JetBrains Mono 11px, color: var(--text-muted)
    
    Bottom row:
      Notes textarea: bg var(--bg-deep), border var(--bg-border), rounded 6px
      [✓ Approve] [✗ Reject] buttons
      
    Once actioned:
      Green "APPROVED ✓" or Red "REJECTED ✗" overlay
      card opacity reduced to 0.6
```

---

### 11. CASE DOSSIER SECTION

**New design:**
```
Section: "INVESTIGATION CASE DOSSIER"
Sub: "Court-ready intelligence report with verified evidence citations & audit trails"

Header row:
  Title (left)
  [Print / Export Dossier] button — cyan accent, right side
  
Dossier document preview:
  Background: var(--bg-panel)
  Border: 1px solid var(--bg-border)
  Border-radius: 12px, overflow: hidden
  
  Document header band:
    Background: var(--bg-elevated)
    Border-bottom: 2px solid var(--cyan-accent)
    Padding: 20px 28px
    
    "CLASSIFIED INTELLIGENCE DOSSIER" — JetBrains Mono 11px, letter-spacing:2px, red
    Case ID in big JetBrains Mono
    Date/time stamp
  
  Document body:
    Padding: 28px
    Sections separated by border-top: 1px solid var(--bg-border)
    
    Each section header: JetBrains Mono 10px, letter-spacing:1px, cyan color
    Content: Inter 14px, color: var(--text-secondary)
    
    Tables inside dossier inherit the same table styling (dark, bordered)
    
    Entity roster uses colored chips per type
    
  Sign-off block at bottom:
    Border: 1px dashed var(--bg-border-strong)
    Padding: 20px
    Border-radius: 8px
    "ANALYST SIGN-OFF / VERIFICATION PENDING" status
```

---

### 12. FOOTER

**New design:**
```
Background: var(--bg-deep)
Border-top: 1px solid var(--bg-border)
Padding: 40px

3-column layout:
  Left: SUTRA wordmark + v3.4 chip + one-liner description
  Center: SIH project metadata (mono font)
  Right: [GitHub repo link] button

Bottom bar (border-top inside footer):
  Left: "© 2026 SUTRA | Team BLACKSWAN | MIT License"
  Right: "Lead Developer: @Shakyavinit"
  Both: JetBrains Mono 11px, color: var(--text-muted)
```

---

## GLOBAL CSS RULES

```css
/* Apply globally in style.css */

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-body);
  background: var(--bg-base);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar — dark ops style */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* Selection */
::selection { background: rgba(6,182,212,0.25); color: var(--text-primary); }

/* Focus ring */
:focus-visible {
  outline: 2px solid var(--cyan-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Utility classes */
.mono { font-family: var(--font-mono); }
.display { font-family: var(--font-display); }

.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  letter-spacing: 0.8px; padding: 3px 10px; border-radius: 4px;
  text-transform: uppercase;
}
.badge-critical { background: var(--red-soft); color: var(--red-threat); }
.badge-review   { background: var(--amber-soft); color: var(--amber-review); }
.badge-verified { background: var(--green-soft); color: var(--green-verify); }
.badge-ai       { background: var(--blue-soft); color: var(--blue-ai); }
.badge-system   { background: var(--cyan-soft); color: var(--cyan-accent); }
.badge-muted    { background: rgba(255,255,255,0.06); color: var(--text-muted); }

/* Pulse animation for critical alerts */
@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,59,0.4); }
  50%       { box-shadow: 0 0 0 4px rgba(255,59,59,0); }
}
.pulse-critical { animation: pulse-border 2s ease-in-out infinite; }

/* Section wrappers */
.section-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
}
.section {
  padding: 80px 0;
  border-bottom: 1px solid var(--bg-border);
}
.section-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.section-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}
.section-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

/* Data table base */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table th {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 10px 16px;
  text-align: left;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--bg-border);
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--bg-border);
  color: var(--text-secondary);
  vertical-align: middle;
}
.data-table tbody tr:hover { background: var(--bg-elevated); }
.data-table tbody tr:last-child td { border-bottom: none; }

/* Button base */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-panel);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.btn:hover { background: var(--bg-elevated); }
.btn:active { transform: scale(0.98); }

.btn-primary {
  background: var(--cyan-accent);
  color: #000;
  border-color: var(--cyan-accent);
  font-weight: 600;
}
.btn-primary:hover { filter: brightness(1.1); }

.btn-danger { border-color: rgba(255,59,59,0.3); color: var(--red-threat); }
.btn-danger:hover { background: var(--red-soft); }

.btn-success { border-color: rgba(16,185,129,0.3); color: var(--green-verify); }
.btn-success:hover { background: var(--green-soft); }
```

---

## RESPONSIVE BREAKPOINTS

```
Desktop:  1440px max-width container, 48px side padding
Laptop:   1200px — same layout, tighter spacing
Tablet:   768px — nav collapses to hamburger menu, 2-col → 1-col grids
Mobile:   375px — single column, 16px side padding, nav hamburger
```

### Mobile hamburger menu:
```
Hamburger icon (top right)
Slide-down menu panel:
  Background: var(--bg-panel)
  Border: 1px solid var(--bg-border)
  All nav links stacked, 48px height each
  Border-bottom: 1px solid var(--bg-border) between each
```

---

## FINAL CHECKLIST BEFORE SUBMITTING

```
□ All text uses Inter (body) or Space Grotesk (headings) or JetBrains Mono (data)
□ No raw system font-family usage
□ ALL numeric IDs, percentages, case numbers, timestamps use JetBrains Mono
□ Status badges use the 6-color semantic system (critical/review/verified/ai/system/muted)
□ Network graph nodes have color-coding by entity type
□ Evidence confidence meter is colored (red<70, amber 70-90, green>90)
□ Nav is fixed + frosted glass + has scrollspy active states
□ Metric cards have colored top-border per data type
□ Tables have dark header row + hover states
□ Mobile nav has hamburger menu
□ Upload dropzone has hover state (cyan border glow)
□ Analyst review queue items show post-action state
□ Statutory warning notice is amber-styled (not plain text)
□ Footer has all three columns + bottom bar
□ prefers-reduced-motion respected
□ Scrollbar is dark-styled
□ Focus rings visible (cyan outline)
□ WCAG AA contrast — test --text-primary (#F0F4FF) on --bg-panel (#0D1526) ✓
```

---

## EXPECTED SCORE AFTER REDESIGN

| Dimension | Before | After |
|-----------|--------|-------|
| Visual Identity | 3/10 | 9/10 |
| Hero/First Impression | 4/10 | 9/10 |
| Layout & Hierarchy | 4/10 | 8/10 |
| Typography | 3/10 | 9/10 |
| Dashboard UX | 5/10 | 8/10 |
| Navigation | 5/10 | 9/10 |
| Mobile/Responsive | 3/10 | 7/10 |
| Color/Contrast | 4/10 | 9/10 |
| Professionalism | 5/10 | 9/10 |
| Component Quality | 2/10 | 8/10 |
| **TOTAL** | **38/100** | **~85/100** |

---

*Prompt prepared by Claude for SUTRA AI redesign — Team BLACKSWAN, SIH 2026*
