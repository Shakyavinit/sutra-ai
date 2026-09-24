/**
 * SUTRA - Master Application Controller
 * AI-Powered Criminal Network Analysis System (Prototype Codename: SUTRA)
 * SIH 2026 Problem Statement ID: PS26189 | Team BLACKSWAN (ID: 133455)
 */

import DOMPurify from 'dompurify';
import { GraphEngine } from './graphEngine.js';
import { EvidenceParser } from './uploadParser.js';
import { IdentityResolver } from './identityResolver.js';
import { ReviewQueue } from './reviewQueue.js';
import { ReportGenerator } from './reportGenerator.js';
import { GraphAnalytics } from './graphAnalytics.js';
import { AuditChain } from './auditChain.js';

// Safe HTML sanitizer fallback
function sanitize(str) {
  if (str === null || str === undefined) return '';
  const text = String(str);
  if (typeof DOMPurify !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(text);
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class SutraApp {
  constructor() {
    this.currentCaseId = 'case-001';
    this.activeCaseData = null;
    this.graphEngine = null;
    this.identityResolver = null;
    this.reviewQueue = null;
    this.auditChain = new AuditChain('case-001');
    this.currentAuditVerification = null;
    this.guidedDemoStep = 0;
    this.isGuidedDemoActive = false;

    // Detect base URL path for demo-data
    const isPages = window.location.pathname.includes('/sutra-ai');
    this.baseDataUrl = isPages ? '/sutra-ai/demo-data/' : './demo-data/';

    this.init();
  }

  async init() {
    this.setupRouter();
    this.setupGlobalEvents();
    await this.loadCase(this.currentCaseId);
    this.initGraph();
    await this.initAuditChain();
    this.setupGuidedDemo();
  }

  // --- Router & View Navigation ---
  setupRouter() {
    const handleRoute = () => {
      const hash = window.location.hash || '#landing';
      const route = hash.replace('#', '');
      this.switchView(route);
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  switchView(viewName) {
    const views = document.querySelectorAll('.sutra-view-section');
    views.forEach(v => v.classList.remove('active-view'));

    const targetView = document.getElementById(`view-${viewName}`) || document.getElementById('view-landing');
    if (targetView) {
      targetView.classList.add('active-view');
    }

    // Update active nav links
    const navLinks = document.querySelectorAll('.nav-tab-btn, .sidebar-nav-item');
    navLinks.forEach(link => {
      const linkHash = link.getAttribute('href');
      if (linkHash === `#${viewName}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // If graph view opened, trigger resize to prevent clipping and fit view
    if (viewName === 'graph' && this.graphEngine) {
      setTimeout(() => {
        this.graphEngine.handleResize();
        this.graphEngine.fitToView();
      }, 50);
    }

    // If report view opened, refresh dossier with latest metrics & audit verification
    if (viewName === 'report') {
      this.renderReportView();
    }
  }

  // --- Case Data Ingestion & Switcher ---
  async loadCase(caseId) {
    this.currentCaseId = caseId;
    this.auditChain.setCase(caseId);

    const candidateUrls = [
      `${this.baseDataUrl}${caseId}.json`,
      `/sutra-ai/demo-data/${caseId}.json`,
      `./demo-data/${caseId}.json`,
      `demo-data/${caseId}.json`,
      `./public/demo-data/${caseId}.json`
    ];

    let loaded = false;
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          this.activeCaseData = await res.json();
          loaded = true;
          break;
        }
      } catch (e) {
        // try next candidate
      }
    }

    if (!loaded) {
      console.error('[SUTRA] Failed to load case data from any candidate URL for:', caseId);
      return;
    }

    // Initialize sub-controllers
    this.identityResolver = new IdentityResolver(
      this.activeCaseData.identityResolution || [],
      (record, action) => this.onIdentityUpdated(record, action)
    );

    this.reviewQueue = new ReviewQueue(
      this.activeCaseData.reviewQueue || [],
      (item, action) => this.onReviewQueueUpdated(item, action)
    );

    // Refresh UI components
    this.renderDashboardStats();
    this.renderEntitiesTable();
    this.renderIdentityView();
    this.renderReviewView();
    this.renderTimelineView();
    this.renderEvidenceFilesList();
    this.updateCaseSelectors();
    this.populateShortestPathDropdowns();

    // Update Graph if initialized
    if (this.graphEngine) {
      this.graphEngine.setData(this.activeCaseData.entities, this.activeCaseData.relationships);
    }

    // Update audit chain verification telemetry
    this.updateAuditWidget();
  }

  updateCaseSelectors() {
    const selectors = document.querySelectorAll('.case-picker-select');
    selectors.forEach(sel => {
      sel.value = this.currentCaseId;
    });

    const badge = document.getElementById('activeCaseBadge');
    if (badge && this.activeCaseData) {
      badge.textContent = `${this.activeCaseData.caseId}: ${this.activeCaseData.title}`;
    }

    // Sync hero active dossier cards
    const heroDossierCards = document.querySelectorAll('.dossier-quick-card');
    heroDossierCards.forEach(card => {
      const caseId = card.getAttribute('data-case');
      const ind = card.querySelector('.dossier-indicator');
      if (caseId === this.currentCaseId) {
        card.classList.add('active');
        if (ind) { ind.classList.add('active-dot'); ind.innerHTML = '&#9679;'; }
      } else {
        card.classList.remove('active');
        if (ind) { ind.classList.remove('active-dot'); ind.innerHTML = '&#9675;'; }
      }
    });
  }

  // --- Graph Initialization ---
  initGraph() {
    const container = document.getElementById('graphCanvasContainer');
    if (!container) return;

    this.graphEngine = new GraphEngine(
      'graphCanvasContainer',
      (node) => this.openEvidenceDrawerForNode(node),
      (edge) => this.openEvidenceDrawerForEdge(edge)
    );

    if (this.activeCaseData) {
      this.graphEngine.setData(this.activeCaseData.entities, this.activeCaseData.relationships);
    }

    this.setupGraphControls();
    if (window.location.hash.includes('graph')) {
      setTimeout(() => {
        this.graphEngine.handleResize();
        this.graphEngine.fitToView();
      }, 100);
    }
  }

  setupGraphControls() {
    // Viewport manipulation
    const btnFit = document.getElementById('btnFitGraph');
    if (btnFit) btnFit.addEventListener('click', () => this.graphEngine.fitToView());

    const btnReset = document.getElementById('btnResetGraph');
    if (btnReset) btnReset.addEventListener('click', () => this.graphEngine.resetView());

    const btnZoomIn = document.getElementById('btnZoomIn');
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.graphEngine.zoomBy(1.2));

    const btnZoomOut = document.getElementById('btnZoomOut');
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.graphEngine.zoomBy(0.8));

    // Entity Type Checkboxes
    const typeBoxes = document.querySelectorAll('.graph-type-filter');
    typeBoxes.forEach(box => {
      box.addEventListener('change', () => {
        const type = box.value;
        if (box.checked) {
          this.graphEngine.filters.types.add(type);
        } else {
          this.graphEngine.filters.types.delete(type);
        }
      });
    });

    // Relationship Type Checkboxes
    const relBoxes = document.querySelectorAll('.graph-rel-filter');
    relBoxes.forEach(box => {
      box.addEventListener('change', () => {
        const relType = box.value;
        if (box.checked) {
          this.graphEngine.filters.relationshipTypes.add(relType);
        } else {
          this.graphEngine.filters.relationshipTypes.delete(relType);
        }
      });
    });

    // Confidence Slider
    const confSlider = document.getElementById('confSlider');
    const confValLabel = document.getElementById('confSliderVal');
    if (confSlider) {
      confSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (confValLabel) confValLabel.textContent = `${val}%`;
        this.graphEngine.filters.minConfidence = val;
      });
    }

    // Search Box
    const searchBox = document.getElementById('graphSearchInput');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.graphEngine.filters.searchQuery = e.target.value;
      });
    }

    // Shortest Path Controls
    const btnFindPath = document.getElementById('btnFindPath');
    const btnClearPath = document.getElementById('btnClearPath');
    const sourceSelect = document.getElementById('pathSourceSelect');
    const targetSelect = document.getElementById('pathTargetSelect');
    const pathBanner = document.getElementById('pathResultBanner');

    if (btnFindPath && sourceSelect && targetSelect) {
      btnFindPath.addEventListener('click', () => {
        const src = sourceSelect.value;
        const tgt = targetSelect.value;
        if (!src || !tgt) {
          if (pathBanner) {
            pathBanner.style.display = 'block';
            pathBanner.textContent = 'Please select both origin and target entities to trace path.';
          }
          return;
        }

        const path = this.graphEngine.findAndHighlightShortestPath(src, tgt);
        if (pathBanner) {
          pathBanner.style.display = 'block';
          if (path && path.length > 0) {
            const names = path.map(id => {
              const node = this.activeCaseData.entities.find(e => e.id === id);
              return node ? node.name : id;
            });
            pathBanner.innerHTML = `<strong>Shortest Path Found (${path.length - 1} hops):</strong><br>${names.join(' &rarr; ')}`;
          } else {
            pathBanner.innerHTML = `<strong>No Connecting Path Found</strong> between selected entities.`;
          }
        }
      });
    }

    if (btnClearPath) {
      btnClearPath.addEventListener('click', () => {
        this.graphEngine.clearShortestPath();
        if (pathBanner) {
          pathBanner.style.display = 'none';
          pathBanner.textContent = '';
        }
        if (sourceSelect) sourceSelect.value = '';
        if (targetSelect) targetSelect.value = '';
      });
    }
  }

  populateShortestPathDropdowns() {
    const sourceSelect = document.getElementById('pathSourceSelect');
    const targetSelect = document.getElementById('pathTargetSelect');
    if (!sourceSelect || !targetSelect || !this.activeCaseData) return;

    const entities = this.activeCaseData.entities || [];
    const optionsHtml = '<option value="">Select Entity...</option>' + entities.map(e => `
      <option value="${sanitize(e.id)}">${sanitize(e.name)} (${sanitize(e.type)})</option>
    `).join('');

    sourceSelect.innerHTML = optionsHtml;
    targetSelect.innerHTML = optionsHtml;
  }

  // --- Evidence Details Drawer ---
  openEvidenceDrawerForNode(node) {
    const drawer = document.getElementById('evidenceDrawer');
    if (!drawer) return;

    document.getElementById('drawerTitle').textContent = node.name;
    document.getElementById('drawerType').textContent = node.type;
    document.getElementById('drawerRole').textContent = node.role || node.type;
    document.getElementById('drawerSource').textContent = node.source || 'Case File';
    document.getElementById('drawerConfidence').textContent = `${node.confidence}%`;
    document.getElementById('drawerConfidenceBar').style.width = `${node.confidence}%`;
    document.getElementById('drawerStatus').textContent = node.status;
    document.getElementById('drawerStatus').className = `status-pill status-${node.status.toLowerCase().replace(/\s+/g, '-')}`;
    document.getElementById('drawerDetails').textContent = node.details || 'No additional field annotations logged.';
    document.getElementById('drawerEvidenceCount').textContent = `${node.evidenceCount || 1} independent records`;

    drawer.classList.add('open');
  }

  openEvidenceDrawerForEdge(edge) {
    const drawer = document.getElementById('evidenceDrawer');
    if (!drawer) return;

    const s = this.activeCaseData.entities.find(e => e.id === edge.source);
    const t = this.activeCaseData.entities.find(e => e.id === edge.target);

    document.getElementById('drawerTitle').textContent = `${s ? s.name : edge.source} ➔ ${t ? t.name : edge.target}`;
    document.getElementById('drawerType').textContent = 'Relationship Conduit';
    document.getElementById('drawerRole').textContent = edge.type.replace(/_/g, ' ');
    document.getElementById('drawerSource').textContent = edge.sourceDoc || 'Forensic Ledger';
    document.getElementById('drawerConfidence').textContent = `${edge.confidence}%`;
    document.getElementById('drawerConfidenceBar').style.width = `${edge.confidence}%`;
    document.getElementById('drawerStatus').textContent = edge.status;
    document.getElementById('drawerStatus').className = `status-pill status-${edge.status.toLowerCase().replace(/\s+/g, '-')}`;
    document.getElementById('drawerDetails').textContent = `${edge.details} | Event Date: ${edge.date || 'Undated'}`;
    document.getElementById('drawerEvidenceCount').textContent = 'Verified Intercept';

    drawer.classList.add('open');
  }

  closeEvidenceDrawer() {
    const drawer = document.getElementById('evidenceDrawer');
    if (drawer) drawer.classList.remove('open');
  }

  // --- Telemetry Dashboard Stats & Top Influencer Cards ---
  renderDashboardStats() {
    if (!this.activeCaseData) return;

    const totalFiles = (this.activeCaseData.evidenceFiles || []).length;
    const totalEntities = (this.activeCaseData.entities || []).length;
    const totalRelationships = (this.activeCaseData.relationships || []).length;
    const pendingReview = this.reviewQueue ? this.reviewQueue.getPendingCount() : 0;

    const elFiles = document.getElementById('statTotalFiles');
    if (elFiles) elFiles.textContent = totalFiles;

    const elEntities = document.getElementById('statTotalEntities');
    if (elEntities) elEntities.textContent = totalEntities;

    const elRels = document.getElementById('statTotalRelationships');
    if (elRels) elRels.textContent = totalRelationships;

    const elReview = document.getElementById('statPendingReview');
    if (elReview) elReview.textContent = pendingReview;

    const badgeReview = document.getElementById('navReviewBadge');
    if (badgeReview) badgeReview.textContent = pendingReview;

    // Render Top Influencers
    this.renderTopInfluencers();

    // Render Recent Cases Table
    const recentTable = document.getElementById('recentCasesTableBody');
    if (recentTable) {
      recentTable.innerHTML = `
        <tr class="${this.currentCaseId === 'case-001' ? 'row-active' : ''}">
          <td><strong>CR-2026-0891</strong></td>
          <td>Operation Falcon: Arms &amp; Narcotics Syndicate</td>
          <td><span class="badge-cat">Organized Crime</span></td>
          <td>15 Entities / 14 Conduits</td>
          <td><span class="status-pill status-active">Active</span></td>
          <td><button class="btn btn-sm btn-outline switch-case-btn" data-case="case-001">Load Case</button></td>
        </tr>
        <tr class="${this.currentCaseId === 'case-002' ? 'row-active' : ''}">
          <td><strong>CR-2026-1144</strong></td>
          <td>Operation Ghost Ledger: Mule &amp; USDT Layering</td>
          <td><span class="badge-cat">Cyber Fraud</span></td>
          <td>15 Entities / 12 Conduits</td>
          <td><span class="status-pill status-priority">High Priority</span></td>
          <td><button class="btn btn-sm btn-outline switch-case-btn" data-case="case-002">Load Case</button></td>
        </tr>
      `;

      recentTable.querySelectorAll('.switch-case-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetCase = btn.getAttribute('data-case');
          this.loadCase(targetCase);
        });
      });
    }
  }

  renderTopInfluencers() {
    const grid = document.getElementById('topInfluencersGrid');
    if (!grid || !this.activeCaseData) return;

    const analytics = GraphAnalytics.analyze(
      this.activeCaseData.entities || [],
      this.activeCaseData.relationships || [],
      this.activeCaseData
    );

    const topNodes = (analytics.topPriorityNodes || []).slice(0, 3);
    if (topNodes.length === 0) {
      grid.innerHTML = '<div class="empty-state">No graph entities available to rank.</div>';
      return;
    }

    grid.innerHTML = topNodes.map((node, index) => {
      const rankNum = index + 1;
      const rankTitles = ['Primary Kingpin / Network Hub', 'Conduit Bridge / Mule Operator', 'Key Operative / Layering Node'];
      const rankTitle = rankTitles[index] || `Influencer #${rankNum}`;

      return `
        <div class="influencer-card card-rank-${rankNum}">
          <div>
            <div class="influencer-header">
              <span class="influencer-rank">RANK #${rankNum} &bull; ${rankTitle}</span>
              <div class="influencer-ips">
                <div class="ips-val">${node.metrics.priorityScore}</div>
                <div class="ips-label">Priority Score (IPS)</div>
              </div>
            </div>
            <div class="influencer-name">${sanitize(node.name)}</div>
            <div class="influencer-role">${sanitize(node.role || node.type)} &bull; <code>${sanitize(node.id)}</code></div>

            <div class="influencer-metrics">
              <div>
                <span class="metric-label">Betweenness (Brandes):</span><br>
                <span class="metric-val">${node.metrics.betweenness.normalized.toFixed(4)}</span>
              </div>
              <div>
                <span class="metric-label">Degree Centrality:</span><br>
                <span class="metric-val">${node.metrics.degree.normalized.toFixed(3)} (${node.metrics.degree.degree} conns)</span>
              </div>
            </div>
          </div>

          <button class="btn btn-sm btn-outline inspect-influencer-btn" data-id="${sanitize(node.id)}" style="width: 100%; margin-top: 8px;">
            Inspect in Graph &amp; View Leads
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.inspect-influencer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const node = this.activeCaseData.entities.find(e => e.id === id);
        if (node) {
          window.location.hash = '#graph';
          setTimeout(() => {
            this.openEvidenceDrawerForNode(node);
            if (this.graphEngine) {
              this.graphEngine.selectedNodeId = node.id;
              const gNode = this.graphEngine.nodeMap.get(node.id);
              if (gNode) {
                this.graphEngine.camera.x = gNode.x;
                this.graphEngine.camera.y = gNode.y;
              }
            }
          }, 150);
        }
      });
    });
  }

  // --- Entities Table ---
  renderEntitiesTable() {
    const tbody = document.getElementById('entitiesTableBody');
    if (!tbody || !this.activeCaseData) return;

    tbody.innerHTML = (this.activeCaseData.entities || []).map(e => `
      <tr>
        <td><strong>${sanitize(e.name)}</strong></td>
        <td><span class="entity-type-tag type-${sanitize(e.type.toLowerCase().replace(/[\s\/]+/g, '-'))}">${sanitize(e.type)}</span></td>
        <td>${sanitize(e.role || e.type)}</td>
        <td><code>${sanitize(e.source)}</code></td>
        <td>
          <div class="confidence-pill">
            <span class="conf-bar" style="width:${e.confidence}%"></span>
            <span class="conf-text">${e.confidence}%</span>
          </div>
        </td>
        <td><span class="status-pill status-${sanitize(e.status.toLowerCase().replace(/\s+/g, '-'))}">${sanitize(e.status)}</span></td>
        <td>
          <button class="btn-icon inspect-entity-btn" data-id="${sanitize(e.id)}" title="Inspect in Graph &amp; Evidence">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.inspect-entity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const node = this.activeCaseData.entities.find(e => e.id === id);
        if (node) {
          window.location.hash = '#graph';
          setTimeout(() => {
            this.openEvidenceDrawerForNode(node);
            if (this.graphEngine) {
              this.graphEngine.selectedNodeId = node.id;
              const gNode = this.graphEngine.nodeMap.get(node.id);
              if (gNode) {
                this.graphEngine.camera.x = gNode.x;
                this.graphEngine.camera.y = gNode.y;
              }
            }
          }, 150);
        }
      });
    });
  }

  // --- Evidence Files List ---
  renderEvidenceFilesList() {
    const container = document.getElementById('evidenceFilesList');
    if (!container || !this.activeCaseData) return;

    container.innerHTML = (this.activeCaseData.evidenceFiles || []).map(f => `
      <div class="evidence-file-card">
        <div class="file-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="file-info">
          <div class="file-name"><strong>${sanitize(f.name)}</strong></div>
          <div class="file-meta">${sanitize(f.type)} &bull; ${sanitize(f.size)} &bull; ${f.recordsExtracted} records parsed</div>
        </div>
        <div class="file-status">
          <span class="status-pill status-verified">${sanitize(f.status)}</span>
        </div>
      </div>
    `).join('');
  }

  // --- Identity Resolution View ---
  renderIdentityView() {
    const container = document.getElementById('identityResolutionContainer');
    if (!container || !this.identityResolver) return;

    const records = this.identityResolver.getRecords();
    if (records.length === 0) {
      container.innerHTML = `<div class="empty-state">No ambiguous identity matches detected for this case.</div>`;
      return;
    }

    container.innerHTML = records.map(rec => `
      <div class="identity-card ${rec.status.includes('Approved') ? 'card-approved' : (rec.status.includes('Rejected') ? 'card-rejected' : '')}">
        <div class="identity-card-header">
          <div class="identity-title">
            <span class="identity-badge">Disambiguation Candidate</span>
            <h3>${sanitize(rec.primaryEntity)} <span class="vs-label">VS</span> ${sanitize(rec.candidateEntity)}</h3>
          </div>
          <div class="match-score">
            <span class="score-number">${rec.matchScore}%</span>
            <span class="score-label">Fuzzy Overlap</span>
          </div>
        </div>

        <div class="matching-factors">
          <h4>Corroborated Correlation Factors:</h4>
          <ul>
            ${(rec.matchingFactors || []).map(f => `<li>&check; ${sanitize(f)}</li>`).join('')}
          </ul>
        </div>

        <div class="identity-footer">
          <div class="identity-meta">
            <span><strong>Supporting Files:</strong> ${sanitize(rec.supportingRecords)}</span>
            <span><strong>Status:</strong> ${sanitize(rec.status)}</span>
          </div>
          ${rec.status === 'Needs Review' ? `
            <div class="identity-actions">
              <button class="btn btn-sm btn-primary approve-merge-btn" data-id="${sanitize(rec.id)}">Approve Merge</button>
              <button class="btn btn-sm btn-secondary reject-merge-btn" data-id="${sanitize(rec.id)}">Reject Merge</button>
            </div>
          ` : `
            <div class="action-recorded-msg">
              <strong>${sanitize(rec.analystDecision || 'Decision recorded in audit chain.')}</strong>
            </div>
          `}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.approve-merge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.identityResolver.approveMerge(id);
      });
    });

    container.querySelectorAll('.reject-merge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.identityResolver.rejectMerge(id);
      });
    });
  }

  async onIdentityUpdated(record, action) {
    this.renderIdentityView();
    await this.auditChain.append(
      'IDENTITY_RESOLUTION_DECISION',
      record.id,
      `${record.primaryEntity} <-> ${record.candidateEntity}`,
      'Needs Review',
      record.status,
      record.analystDecision
    );
    this.updateAuditWidget();
  }

  // --- Review Queue View ---
  renderReviewView() {
    const container = document.getElementById('reviewQueueContainer');
    if (!container || !this.reviewQueue) return;

    const items = this.reviewQueue.getItems();
    container.innerHTML = items.map(item => `
      <div class="review-card ${item.status === 'Approved (Verified)' ? 'card-approved' : (item.status.includes('Rejected') ? 'card-rejected' : '')}">
        <div class="review-header">
          <span class="review-type-badge">${sanitize(item.type)}</span>
          <span class="review-conf">Confidence: ${item.confidence}%</span>
        </div>
        <div class="review-subject"><strong>${sanitize(item.subject)}</strong></div>
        <p class="review-reason"><strong>Trigger Reason:</strong> ${sanitize(item.flagReason)}</p>
        <div class="review-source">Source Reference: <code>${sanitize(item.sourceDoc)}</code></div>

        <div class="review-notes-section">
          <input type="text" class="input-notes" id="notes-${sanitize(item.id)}" placeholder="Enter investigator verification note..." value="${sanitize(item.analystNotes || '')}">
        </div>

        <div class="review-footer">
          <span class="review-status-label">Status: <strong>${sanitize(item.status)}</strong></span>
          ${item.status === 'Pending' ? `
            <div class="review-btn-group">
              <button class="btn btn-sm btn-primary approve-queue-btn" data-id="${sanitize(item.id)}">Approve Lead</button>
              <button class="btn btn-sm btn-danger reject-queue-btn" data-id="${sanitize(item.id)}">Reject Lead</button>
            </div>
          ` : `
            <span class="badge-done">&check; Logged to Audit Trail</span>
          `}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.approve-queue-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const noteInput = document.getElementById(`notes-${id}`);
        const notes = noteInput ? noteInput.value : '';
        this.reviewQueue.approveItem(id, notes);
      });
    });

    container.querySelectorAll('.reject-queue-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const noteInput = document.getElementById(`notes-${id}`);
        const notes = noteInput ? noteInput.value : '';
        this.reviewQueue.rejectItem(id, notes);
      });
    });
  }

  async onReviewQueueUpdated(item, action) {
    this.renderReviewView();
    this.renderDashboardStats();
    await this.auditChain.append(
      'LEAD_REVIEW_DECISION',
      item.id,
      item.subject,
      'Pending',
      item.status,
      item.analystNotes
    );
    this.updateAuditWidget();
  }

  // --- Timeline View ---
  renderTimelineView() {
    const container = document.getElementById('timelineContainer');
    if (!container || !this.activeCaseData) return;

    container.innerHTML = `
      <div class="timeline-vertical">
        ${(this.activeCaseData.timeline || []).map(item => `
          <div class="timeline-entry">
            <div class="timeline-marker"></div>
            <div class="timeline-content-box">
              <div class="timeline-timestamp">${sanitize(item.date)}</div>
              <div class="timeline-badge badge-${sanitize(item.eventType.toLowerCase().replace(/\s+/g, '-'))}">${sanitize(item.eventType)}</div>
              <h4 class="timeline-heading">${sanitize(item.title)}</h4>
              <p class="timeline-desc">${sanitize(item.description)}</p>
              <div class="timeline-source">Citing Evidence: <code>${sanitize(item.source)}</code></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- Report View ---
  async renderReportView() {
    const container = document.getElementById('reportPreviewContent');
    if (!container || !this.activeCaseData) return;

    const reviewItems = this.reviewQueue ? this.reviewQueue.getItems() : [];
    const idRecords = this.identityResolver ? this.identityResolver.getRecords() : [];
    const verification = await this.auditChain.verifyChain();

    container.innerHTML = ReportGenerator.renderReportHTML(
      this.activeCaseData,
      reviewItems,
      idRecords,
      verification
    );

    const btnPrint = document.getElementById('btnPrintReport');
    if (btnPrint) {
      btnPrint.onclick = () => window.print();
    }
  }

  // --- Tamper-Evident Audit Chain Controller ---
  async initAuditChain() {
    const btnVerify = document.getElementById('btnVerifyAuditChain');
    const btnView = document.getElementById('btnViewAuditChain');
    const btnReset = document.getElementById('btnResetAuditChain');
    const btnCloseModal = document.getElementById('btnCloseAuditModal');
    const btnModalClose = document.getElementById('btnModalClose');
    const btnModalVerifyNow = document.getElementById('btnModalVerifyNow');
    const modal = document.getElementById('auditChainModal');

    if (btnVerify) {
      btnVerify.addEventListener('click', async () => {
        const res = await this.auditChain.verifyChain();
        this.updateAuditWidget(res);
        alert(`[SUTRA Audit Verification]\nStatus: ${res.isValid ? 'VALID' : 'TAMPER DETECTED'}\n${res.message}`);
      });
    }

    if (btnView && modal) {
      btnView.addEventListener('click', () => {
        this.renderAuditModal();
        modal.classList.add('open');
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', async () => {
        if (confirm('Reset demonstration audit log to initial genesis state?')) {
          await this.auditChain.resetChain();
          this.updateAuditWidget();
          alert('Audit log reset to Genesis block.');
        }
      });
    }

    const closeModal = () => {
      if (modal) modal.classList.remove('open');
    };

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeModal);

    if (btnModalVerifyNow) {
      btnModalVerifyNow.addEventListener('click', async () => {
        const res = await this.auditChain.verifyChain();
        this.renderAuditModal(res);
      });
    }

    await this.updateAuditWidget();
  }

  async updateAuditWidget(cachedRes = null) {
    const badge = document.getElementById('auditBadgeStatus');
    const detail = document.getElementById('auditStatusDetail');
    const shield = document.getElementById('auditShieldIcon');

    const res = cachedRes || await this.auditChain.verifyChain();
    this.currentAuditVerification = res;

    if (res.isValid) {
      if (badge) {
        badge.textContent = `VERIFIED (${res.count} BLOCKS)`;
        badge.className = 'status-pill status-verified';
      }
      if (detail) {
        detail.textContent = `Cryptographically intact. Latest Block SHA-256: ${res.latestHash ? res.latestHash.substring(0, 20) + '...' : 'GENESIS'}`;
      }
      if (shield) shield.classList.remove('tampered');
    } else {
      if (badge) {
        badge.textContent = 'TAMPER DETECTED';
        badge.className = 'status-pill status-priority';
      }
      if (detail) {
        detail.textContent = res.message;
      }
      if (shield) shield.classList.add('tampered');
    }
  }

  async renderAuditModal(verificationRes = null) {
    const body = document.getElementById('auditModalBody');
    if (!body) return;

    const res = verificationRes || await this.auditChain.verifyChain();
    const entries = this.auditChain.getEntries();

    body.innerHTML = `
      <div style="margin-bottom: 16px; padding: 12px; background: ${res.isValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; border-left: 4px solid ${res.isValid ? 'var(--accent-emerald)' : 'var(--accent-red)'}; border-radius: 4px;">
        <strong>Verification Status:</strong> ${res.message}
      </div>
      <div>
        ${entries.map((entry, idx) => `
          <div class="audit-block-card">
            <div class="audit-block-header">
              <span>BLOCK #${idx} &bull; ${sanitize(entry.action)}</span>
              <span>${new Date(entry.timestamp).toLocaleTimeString('en-IN')}</span>
            </div>
            <div><strong>Actor:</strong> ${sanitize(entry.analyst)}</div>
            <div><strong>Target:</strong> ${sanitize(entry.targetName)} (<code>${sanitize(entry.targetId)}</code>)</div>
            <div><strong>Transition:</strong> <code>${sanitize(entry.previousState)}</code> &rarr; <code>${sanitize(entry.newState)}</code></div>
            <div><strong>Notes:</strong> ${sanitize(entry.notes)}</div>
            <div class="audit-block-prev" style="margin-top: 6px;">
              <strong>Prev Hash:</strong> ${sanitize(entry.prevHash)}
            </div>
            <div class="audit-block-hash">
              <strong>Block Hash:</strong> ${sanitize(entry.hash)}
            </div>
          </div>
        `).reverse().join('')}
      </div>
    `;
  }

  // --- Guided SIH Demo Walkthrough Controller ---
  setupGuidedDemo() {
    const btnStart = document.getElementById('btnStartGuidedDemo');
    const btnLanding = document.getElementById('btnLandingGuidedDemo');
    const btnExit = document.getElementById('btnExitGuidedDemo');
    const btnNext = document.getElementById('btnGuidedNext');
    const btnPrev = document.getElementById('btnGuidedPrev');

    const steps = [
      {
        step: 1,
        title: 'Step 1: Multi-Source Case Telemetry',
        route: 'dashboard',
        body: 'SUTRA opens on Operation Falcon (CR-2026-0891). Notice the telemetry KPI grid displaying ingested evidence files, extracted entities, and algorithmic influencer ranking.',
        action: () => {
          this.switchView('dashboard');
        }
      },
      {
        step: 2,
        title: 'Step 2: In-Browser Evidence Ingestion',
        route: 'upload',
        body: 'Watch client-side RFC 4180 parsing in action. We ingest a field telecom CDR dump. Each record receives a deterministic stable ID and is cryptographically hashed for chain-of-custody.',
        action: () => {
          this.switchView('upload');
          this.loadMockSample('CDR');
        }
      },
      {
        step: 3,
        title: 'Step 3: Centrality & Influence Discovery',
        route: 'graph',
        body: 'The live canvas visualizes relationships using force-directed layout and spatial culling. Brandes betweenness centrality and degree algorithms highlight Tariq (IPS 96) as the syndicate kingpin.',
        action: () => {
          this.switchView('graph');
          const tariq = this.activeCaseData.entities.find(e => e.id === 'E-001' || e.name.includes('Tariq'));
          if (tariq) {
            setTimeout(() => {
              this.openEvidenceDrawerForNode(tariq);
              if (this.graphEngine) {
                this.graphEngine.selectedNodeId = tariq.id;
                const gNode = this.graphEngine.nodeMap.get(tariq.id);
                if (gNode) {
                  this.graphEngine.camera.x = gNode.x;
                  this.graphEngine.camera.y = gNode.y;
                }
              }
            }, 300);
          }
        }
      },
      {
        step: 4,
        title: 'Step 4: Trace Hawala Money Trail',
        route: 'graph',
        body: 'Using the Shortest Path engine, we automatically discover the conduit between Kingpin Tariq and the Dubai Hawala Escrow account, revealing the intermediary mule conduit.',
        action: () => {
          this.switchView('graph');
          setTimeout(() => {
            const sourceSelect = document.getElementById('pathSourceSelect');
            const targetSelect = document.getElementById('pathTargetSelect');
            const btnFind = document.getElementById('btnFindPath');

            if (sourceSelect && targetSelect && btnFind) {
              const isCase2 = this.currentCaseId === 'case-002';
              sourceSelect.value = isCase2 ? 'E101' : 'E03';
              targetSelect.value = isCase2 ? 'E107' : 'E10';
              btnFind.click();
            }
          }, 200);
        }
      },
      {
        step: 5,
        title: 'Step 5: Identity Disambiguation',
        route: 'identity',
        body: 'Probabilistic matching identifies that alias SIM (+91-98711-20914) matches Vikram Malhotra based on shared IMEI and co-location. The investigator approves the merge.',
        action: () => {
          this.switchView('identity');
        }
      },
      {
        step: 6,
        title: 'Step 6: Human-in-the-Loop Lead Triage',
        route: 'review',
        body: 'In the Analyst Review Queue, AI-flagged anomalous money transfers and rapid SIM churn are triaged. Decisions are digitally logged with investigator rationale.',
        action: () => {
          this.switchView('review');
        }
      },
      {
        step: 7,
        title: 'Step 7: Section 63 BSA 2023 Intelligence Dossier',
        route: 'report',
        body: 'The court-admissible draft dossier synthesizes all graph centrality metrics, verified leads, and SHA-256 audit verification under the Bharatiya Sakshya Adhiniyam, 2023.',
        action: () => {
          this.switchView('report');
        }
      }
    ];

    const showStep = (idx) => {
      if (idx < 0 || idx >= steps.length) return;
      this.guidedDemoStep = idx;
      const s = steps[idx];

      const banner = document.getElementById('guidedDemoBanner');
      const badge = document.getElementById('guidedDemoStepBadge');
      const title = document.getElementById('guidedDemoTitle');
      const body = document.getElementById('guidedDemoBody');

      if (badge) badge.textContent = `Step ${s.step} of ${steps.length}`;
      if (title) title.textContent = s.title;
      if (body) body.textContent = s.body;
      if (banner) banner.style.display = 'block';

      s.action();
    };

    const startTour = () => {
      this.isGuidedDemoActive = true;
      showStep(0);
    };

    if (btnStart) btnStart.addEventListener('click', startTour);
    if (btnLanding) btnLanding.addEventListener('click', startTour);

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.guidedDemoStep < steps.length - 1) {
          showStep(this.guidedDemoStep + 1);
        } else {
          alert('Guided SIH Walkthrough Complete! You can now freely explore the prototype or export the dossier.');
          const banner = document.getElementById('guidedDemoBanner');
          if (banner) banner.style.display = 'none';
          this.isGuidedDemoActive = false;
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.guidedDemoStep > 0) {
          showStep(this.guidedDemoStep - 1);
        }
      });
    }

    if (btnExit) {
      btnExit.addEventListener('click', () => {
        const banner = document.getElementById('guidedDemoBanner');
        if (banner) banner.style.display = 'none';
        this.isGuidedDemoActive = false;
      });
    }
  }

  // --- Global Event Handlers ---
  setupGlobalEvents() {
    // Drawer close
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => this.closeEvidenceDrawer());
    }

    // Dashboard jump buttons
    const btnDashIngest = document.getElementById('btnDashIngest');
    if (btnDashIngest) {
      btnDashIngest.addEventListener('click', () => {
        window.location.hash = '#upload';
      });
    }

    const btnDashGraph = document.getElementById('btnDashGraph');
    if (btnDashGraph) {
      btnDashGraph.addEventListener('click', () => {
        window.location.hash = '#graph';
      });
    }

    // Case Selector changes
    const selectors = document.querySelectorAll('.case-picker-select');
    selectors.forEach(sel => {
      sel.addEventListener('change', (e) => {
        this.loadCase(e.target.value);
      });
    });

    // Hero Quick Dossier Card clicks
    const heroDossierCards = document.querySelectorAll('.dossier-quick-card');
    heroDossierCards.forEach(card => {
      card.addEventListener('click', () => {
        const caseId = card.getAttribute('data-case');
        if (caseId && caseId !== this.currentCaseId) {
          this.loadCase(caseId);
        }
      });
    });

    // Mobile Navigation Toggle
    const btnMobileNavToggle = document.getElementById('btnMobileNavToggle');
    const workspaceNav = document.getElementById('workspaceNav');
    if (btnMobileNavToggle && workspaceNav) {
      btnMobileNavToggle.addEventListener('click', () => {
        workspaceNav.classList.toggle('mobile-open');
      });
      workspaceNav.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          workspaceNav.classList.remove('mobile-open');
        });
      });
    }

    // File Upload handling
    const fileInput = document.getElementById('evidenceFileInput');
    const dropZone = document.getElementById('evidenceDropZone');

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
      });

      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        if (e.dataTransfer.files.length > 0) {
          this.processUploadedFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.processUploadedFile(e.target.files[0]);
        }
      });
    }

    // Quick Sample Buttons
    const btnSampleCDR = document.getElementById('btnLoadSampleCDR');
    if (btnSampleCDR) {
      btnSampleCDR.addEventListener('click', () => this.loadMockSample('CDR'));
    }

    const btnSampleBank = document.getElementById('btnLoadSampleBank');
    if (btnSampleBank) {
      btnSampleBank.addEventListener('click', () => this.loadMockSample('BANK'));
    }
  }

  processUploadedFile(file) {
    const statusBox = document.getElementById('uploadStatusBox');
    if (!statusBox) return;

    statusBox.style.display = 'block';
    statusBox.innerHTML = `
      <div class="upload-progress-state">
        <div class="spinner"></div>
        <span>Processing <strong>${sanitize(file.name)}</strong> through SUTRA Client-Side Extractor...</span>
      </div>
    `;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      const result = await EvidenceParser.parseFile(file, content);

      setTimeout(async () => {
        if (result.status === 'SUCCESS') {
          // Merge newly extracted entities into active case
          result.entities.forEach(newEnt => {
            if (!this.activeCaseData.entities.some(e => e.id === newEnt.id || e.name === newEnt.name)) {
              this.activeCaseData.entities.push(newEnt);
            }
          });

          result.relationships.forEach(newRel => {
            this.activeCaseData.relationships.push(newRel);
          });

          // Add to files list
          this.activeCaseData.evidenceFiles.push({
            id: `DOC-UP-${Date.now()}`,
            name: file.name,
            type: result.detectedType,
            size: `${Math.round(file.size / 1024) || 1} KB`,
            recordsExtracted: result.count,
            status: 'Client Parsed'
          });

          // Append to audit trail
          await this.auditChain.append(
            'EVIDENCE_INGESTED',
            `DOC-${Date.now()}`,
            file.name,
            'RAW_FILE',
            'PARSED_ENTITIES',
            `Extracted ${result.count} entities & links. File SHA-256: ${result.fileHash ? result.fileHash.substring(0, 16) + '...' : 'computed'}`
          );

          this.renderDashboardStats();
          this.renderEntitiesTable();
          this.renderEvidenceFilesList();
          this.populateShortestPathDropdowns();
          this.updateAuditWidget();

          if (this.graphEngine) {
            this.graphEngine.setData(this.activeCaseData.entities, this.activeCaseData.relationships);
          }

          statusBox.innerHTML = `
            <div class="upload-success-state">
              <span class="badge-success">&check; Success: ${sanitize(result.detectedType)}</span>
              <p>Successfully extracted <strong>${result.count} entities &amp; relationships</strong> and updated the live investigation graph!</p>
              <div style="font-size: 0.75rem; font-family: monospace; color: var(--text-secondary); margin-top: 4px;">SHA-256: ${sanitize(result.fileHash || 'Computed')}</div>
              <button class="btn btn-sm btn-primary view-graph-btn" style="margin-top: 8px;">View Updated Network Graph</button>
            </div>
          `;

          const viewGraphBtn = statusBox.querySelector('.view-graph-btn');
          if (viewGraphBtn) {
            viewGraphBtn.addEventListener('click', () => {
              window.location.hash = '#graph';
            });
          }
        } else if (result.status === 'BACKEND_REQUIRED') {
          statusBox.innerHTML = `
            <div class="upload-warning-state">
              <span class="badge-warning">Notice: ${sanitize(result.detectedType)}</span>
              <p>${sanitize(result.message)}</p>
            </div>
          `;
        } else {
          statusBox.innerHTML = `
            <div class="upload-error-state">
              <span class="badge-error">Parsing Notice:</span>
              <p>${sanitize(result.message)}</p>
            </div>
          `;
        }
      }, 350);
    };

    reader.readAsText(file);
  }

  loadMockSample(type) {
    let filename, mockContent;
    if (type === 'CDR') {
      filename = 'Field_CDR_TowerDump_98201.csv';
      mockContent = `Caller,Callee,Duration,TowerID\n+91-98201-44019,+91-98711-20914,84s,DEL-NDLS-04\n+91-98201-44019,+91-97110-39182,120s,DEL-NDLS-04\n+91-98711-20914,+91-99991-88120,45s,RAJ-NMR-01`;
    } else {
      filename = 'RTGS_Escrow_Batch_Trace.csv';
      mockContent = `SenderAccount,ReceiverAccount,Amount,TxRef\nSBI-40918230192,HDFC-99182049102,Rs. 8,50,000,RTGS-0918240\nHDFC-99182049102,ICICI-10293847561,Rs. 8,20,000,IMPS-1192830`;
    }

    // Create real File object for FileReader compatibility
    const file = new File([mockContent], filename, { type: 'text/csv' });
    this.processUploadedFile(file);
  }
}

// Instantiate SUTRA on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  window.sutraApp = new SutraApp();
});
