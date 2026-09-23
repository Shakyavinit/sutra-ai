/**
 * SUTRA - Printable Intelligence Dossier & Court-Ready Report Generator
 */

export class ReportGenerator {
  static renderReportHTML(caseData, reviewItems, identityRecords) {
    const verifiedEntities = caseData.entities.filter(e => e.status === 'Verified');
    const verifiedRels = caseData.relationships.filter(r => r.status === 'Verified');

    return `
      <div class="print-dossier-wrapper">
        <header class="dossier-header">
          <div class="dossier-seal-banner">
            <div class="dossier-emblem">SUTRA INTELLIGENCE CORE</div>
            <div class="dossier-classification">RESTRICTED // LAW ENFORCEMENT INTELLIGENCE ONLY</div>
          </div>
          <h1 class="dossier-title">CRIMINAL NETWORK INVESTIGATION REPORT</h1>
          <div class="dossier-meta-grid">
            <div><strong>Case Reference:</strong> ${caseData.caseId}</div>
            <div><strong>FIR Reference:</strong> ${caseData.firRef || 'FIR-142/2026 Special Cell'}</div>
            <div><strong>Operation Title:</strong> ${caseData.title}</div>
            <div><strong>Classification:</strong> ${caseData.category}</div>
            <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
            <div><strong>System Platform:</strong> SUTRA v3.4 (SIH PS-26189 | Team BLACKSWAN)</div>
          </div>
        </header>

        <section class="dossier-section">
          <h2 class="dossier-section-title">1. EXECUTIVE INTELLIGENCE SUMMARY</h2>
          <p class="dossier-text">${caseData.summary}</p>
        </section>

        <section class="dossier-section">
          <h2 class="dossier-section-title">2. VERIFIED ENTITY INVENTORY (${verifiedEntities.length} NODES)</h2>
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

        <section class="dossier-section">
          <h2 class="dossier-section-title">3. DETECTED RELATIONSHIP &amp; CHOKEPOINT CONDUITS (${verifiedRels.length} EDGES)</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Source Node</th>
                <th>Relationship</th>
                <th>Target Node</th>
                <th>Confidence</th>
                <th>Investigative Context</th>
              </tr>
            </thead>
            <tbody>
              ${verifiedRels.map(r => {
                const s = caseData.entities.find(e => e.id === r.source);
                const t = caseData.entities.find(e => e.id === r.target);
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

        <section class="dossier-section">
          <h2 class="dossier-section-title">4. CHRONOLOGICAL EVENT TIMELINE</h2>
          <div class="dossier-timeline-list">
            ${caseData.timeline.map(t => `
              <div class="dossier-timeline-item">
                <span class="dossier-timeline-date">${t.date}</span>
                <span class="dossier-timeline-title"><strong>[${t.eventType}]</strong> ${t.title}</span>
                <span class="dossier-timeline-desc">${t.description} (Ref: ${t.source})</span>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="dossier-section">
          <h2 class="dossier-section-title">5. ANALYST VALIDATION AUDIT CHAIN</h2>
          <table class="dossier-table">
            <thead>
              <tr>
                <th>Flagged Subject</th>
                <th>Status</th>
                <th>Analyst Notes</th>
              </tr>
            </thead>
            <tbody>
              ${reviewItems.map(item => `
                <tr>
                  <td><strong>${item.subject}</strong></td>
                  <td>${item.status}</td>
                  <td>${item.analystNotes || 'Pending officer confirmation.'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <footer class="dossier-footer">
          <p><strong>STATUTORY DISCLAIMER:</strong> This report is synthesized by SUTRA (Smart Unified Threat Relationship Analytics) based on ingested digital evidence. All machine-inferred associations constitute investigative leads and require independent evidentiary corroboration pursuant to the Indian Evidence Act.</p>
          <div class="signature-grid">
            <div class="signature-box">
              <div class="sig-line"></div>
              <span>Case Investigating Officer</span>
            </div>
            <div class="signature-box">
              <div class="sig-line"></div>
              <span>Supervisory Cyber / Special Cell In-Charge</span>
            </div>
          </div>
        </footer>
      </div>
    `;
  }
}
