/**
 * SUTRA - Printable Intelligence Dossier & Investigative Leads Report Generator
 * SIH 2026 Problem Statement ID: 26189 | Team BLACKSWAN (ID: 133455)
 *
 * Generates an explainable, structured dossier adhering to:
 * - Bharatiya Sakshya Adhiniyam, 2023 (Section 63: Admissibility of Electronic Records)
 * - Cryptographic audit chain verification status
 * - Calculated centrality metrics & Investigative Priority Scores (IPS)
 * - Academic synthetic demonstration watermark
 */

import { GraphAnalytics } from './graphAnalytics.js';

export class ReportGenerator {
  static renderReportHTML(caseData, reviewItems = [], identityRecords = [], auditVerification = null) {
    if (!caseData) return '<div class="empty-state">No case data loaded for dossier generation.</div>';

    // Compute graph centrality metrics
    const analytics = GraphAnalytics.analyze(caseData.entities || [], caseData.relationships || [], caseData);
    const topPriorities = analytics.topPriorityNodes || [];

    const verifiedEntities = (caseData.entities || []).filter(e => e.status === 'Verified');
    const verifiedRels = (caseData.relationships || []).filter(r => r.status === 'Verified');

    // Audit verification status string
    const auditStatusText = auditVerification && auditVerification.isValid
      ? `Cryptographically Verified (${auditVerification.count} entries intact | Latest SHA-256: ${auditVerification.latestHash ? auditVerification.latestHash.substring(0, 16) + '...' : 'GENESIS'})`
      : (auditVerification && !auditVerification.isValid
          ? `WARNING: Audit Chain Discrepancy (${auditVerification.message})`
          : 'Chain Integrity: Active Client-Side Hash Chaining (SHA-256)');

    return `
      <div class="print-dossier-wrapper">
        <!-- Watermark for academic demonstration honesty -->
        <div class="dossier-watermark hide-on-screen">SYNTHETIC DEMO // ACADEMIC PROTOTYPE ONLY</div>

        <header class="dossier-header">
          <div class="dossier-seal-banner">
            <div class="dossier-emblem">SIH 2026 EVALUATION DOSSIER</div>
            <div class="dossier-classification">SYNTHETIC DEMONSTRATION INTELLIGENCE // INVESTIGATIVE LEADS</div>
          </div>
          <h1 class="dossier-title">INVESTIGATIVE INTELLIGENCE DOSSIER (DRAFT LEADS)</h1>
          <div class="dossier-meta-grid">
            <div><strong>Project Solution:</strong> AI-Powered Criminal Network Analysis System</div>
            <div><strong>Prototype Codename:</strong> SUTRA (PS26189 | Team BLACKSWAN #133455)</div>
            <div><strong>Case Reference:</strong> ${caseData.caseId} (${caseData.title})</div>
            <div><strong>FIR Reference:</strong> ${caseData.firRef || 'FIR-142/2026 Special Cell'}</div>
            <div><strong>Data Nature:</strong> 100% Synthetic / Fictional Demonstration Dataset</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })} at ${new Date().toLocaleTimeString('en-IN')}</div>
            <div><strong>Cryptographic Audit:</strong> ${auditStatusText}</div>
          </div>
        </header>

        <!-- Section 1: Executive Summary -->
        <section class="dossier-section">
          <h2 class="dossier-section-title">1. EXECUTIVE INTELLIGENCE SUMMARY</h2>
          <p class="dossier-text">${caseData.summary}</p>
        </section>

        <!-- Section 2: Calculated Graph Centrality & Priority Scoring -->
        <section class="dossier-section">
          <h2 class="dossier-section-title">2. NETWORK INFLUENCE &amp; CENTRALITY METRICS (CALCULATED)</h2>
          <p class="dossier-meta-note">
            Calculated via Brandes Unweighted Betweenness Centrality, Normalized Degree Centrality, and Explainable Investigative Priority Scoring (IPS 0–100). Higher scores denote structural intermediaries or high-frequency conduits.
          </p>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Entity Identifier</th>
                <th>Type</th>
                <th>Deg. Centrality</th>
                <th>Betweenness (Brandes)</th>
                <th>Community Cluster</th>
                <th>Priority Score (IPS)</th>
              </tr>
            </thead>
            <tbody>
              ${topPriorities.map(node => `
                <tr>
                  <td><strong>${node.name}</strong> (${node.id})</td>
                  <td>${node.type}</td>
                  <td>${(node.metrics.degree.normalized).toFixed(3)} (${node.metrics.degree.degree} conns)</td>
                  <td>${(node.metrics.betweenness.normalized).toFixed(4)}</td>
                  <td>Cluster #${node.metrics.community}</td>
                  <td><span class="ips-score-badge">${node.metrics.priorityScore}/100</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <!-- Section 3: Verified Entity Inventory -->
        <section class="dossier-section">
          <h2 class="dossier-section-title">3. VERIFIED ENTITY INVENTORY (${verifiedEntities.length} NODES)</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Identifier / Name</th>
                <th>Type</th>
                <th>Investigative Role</th>
                <th>Source Document</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              ${verifiedEntities.map(e => `
                <tr>
                  <td><strong>${e.name}</strong></td>
                  <td>${e.type}</td>
                  <td>${e.role || e.type}</td>
                  <td>${e.source}</td>
                  <td>${e.confidence}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <!-- Section 4: Relationship & Conduit Inventory -->
        <section class="dossier-section">
          <h2 class="dossier-section-title">4. DETECTED RELATIONSHIP &amp; CHOKEPOINT CONDUITS (${verifiedRels.length} EDGES)</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Source Entity</th>
                <th>Relationship Type</th>
                <th>Target Entity</th>
                <th>Confidence</th>
                <th>Investigative Context</th>
              </tr>
            </thead>
            <tbody>
              ${verifiedRels.map(r => {
                const s = (caseData.entities || []).find(e => e.id === r.source);
                const t = (caseData.entities || []).find(e => e.id === r.target);
                return `
                  <tr>
                    <td>${s ? s.name : r.source}</td>
                    <td><strong>${r.type.replace(/_/g, ' ')}</strong></td>
                    <td>${t ? t.name : r.target}</td>
                    <td>${r.confidence}%</td>
                    <td>${r.details || 'Documented connection in case file.'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </section>

        <!-- Section 5: Chronological Event Timeline -->
        <section class="dossier-section">
          <h2 class="dossier-section-title">5. CHRONOLOGICAL EVENT TIMELINE</h2>
          <div class="dossier-timeline-list">
            ${(caseData.timeline || []).map(t => `
              <div class="dossier-timeline-item">
                <span class="dossier-timeline-date">${t.date}</span>
                <span class="dossier-timeline-title"><strong>[${t.eventType}]</strong> ${t.title}</span>
                <span class="dossier-timeline-desc">${t.description} (Ref: ${t.source})</span>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Section 6: Analyst Validation & Identity Deduplication Audit -->
        <section class="dossier-section">
          <h2 class="dossier-section-title">6. HUMAN-IN-THE-LOOP TRIAGE &amp; AUDIT LOG</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Item / Subject</th>
                <th>Action Type</th>
                <th>Triage Status</th>
                <th>Investigator Annotation</th>
              </tr>
            </thead>
            <tbody>
              ${reviewItems.map(item => `
                <tr>
                  <td><strong>${item.subject}</strong></td>
                  <td>Lead Review</td>
                  <td>${item.status}</td>
                  <td>${item.analystNotes || 'Pending investigator confirmation.'}</td>
                </tr>
              `).join('')}
              ${identityRecords.map(rec => `
                <tr>
                  <td><strong>${rec.primaryEntity} &harr; ${rec.candidateEntity}</strong></td>
                  <td>Alias Disambiguation</td>
                  <td>${rec.status}</td>
                  <td>${rec.analystDecision || 'Heuristic overlap evaluation recorded.'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <!-- Section 7: Chain of Custody & Statutory Disclaimer -->
        <footer class="dossier-footer">
          <div class="evidentiary-legal-banner">
            <h4>EVIDENTIARY STATUS &amp; STATUTORY ADMISSIBILITY NOTICE</h4>
            <p>
              <strong>Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023) — Section 63:</strong>
              This document is an algorithmically synthesized investigative intelligence dossier generated by the <em>AI-Powered Criminal Network Analysis System (Prototype: SUTRA)</em>. All relationship conduits, betweenness centrality rankings, and prioritized nodes constitute <strong>investigative hypotheses and leads</strong> designed to accelerate forensic triaging.
            </p>
            <p style="margin-top: 6px;">
              They do not constitute judicial proof of culpability or self-authenticating digital evidence. Formal submission before a court of law requires independent evidentiary corroboration by an authorized Investigating Officer accompanied by a statutory Certificate under Section 63 of BSA 2023.
            </p>
          </div>

          <div class="signature-grid">
            <div class="signature-box">
              <div class="sig-line"></div>
              <span>Investigating Officer (I.O.)</span>
              <span class="sig-title">Special Investigation Cell</span>
            </div>
            <div class="signature-box">
              <div class="sig-line"></div>
              <span>Cyber Forensic Examiner</span>
              <span class="sig-title">Digital Evidence Unit</span>
            </div>
          </div>
        </footer>
      </div>
    `;
  }
}
