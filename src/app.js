/**
 * SUTRA - Master Application Controller
 * Smart Unified Threat Relationship Analytics
 * SIH 2026 Problem Statement ID: 26189 | Team BLACKSWAN (ID: 133455)
 */

import { GraphEngine } from './graphEngine.js';
import { EvidenceParser } from './uploadParser.js';
import { IdentityResolver } from './identityResolver.js';
import { ReviewQueue } from './reviewQueue.js';
import { ReportGenerator } from './reportGenerator.js';

class SutraApp {
  constructor() {
    this.currentCaseId = 'case-001';
    this.activeCaseData = null;
    this.allCases = [];
    this.graphEngine = null;
    this.identityResolver = null;
    this.reviewQueue = null;

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

    // If graph view opened, trigger resize to prevent any clipping
    if (viewName === 'graph' && this.graphEngine) {
      setTimeout(() => {
        this.graphEngine.handleResize();
        this.graphEngine.fitToView();
      }, 50);
    }

    // If report view opened, refresh dossier
    if (viewName === 'report') {
      this.renderReportView();
    }
  }

  // --- Case Data Ingestion & Switcher ---
  async loadCase(caseId) {
    this.currentCaseId = caseId;
    const url = `${this.baseDataUrl}${caseId}.json`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      this.activeCaseData = await res.json();
    } catch (err) {
      console.warn(`[SUTRA] Fetch from ${url} failed, trying fallback path:`, err);
      try {
        const fallbackRes = await fetch(`./public/demo-data/${caseId}.json`);
        this.activeCaseData = await fallbackRes.json();
      } catch (e2) {
        console.error('[SUTRA] Failed to load case data:', e2);
        return;
      }
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

    // Update Graph if initialized
    if (this.graphEngine) {
      this.graphEngine.setData(this.activeCaseData.entities, this.activeCaseData.relationships);
    }
  }

  updateCaseSelectors() {
    const selectors = document.querySelectorAll('.case-picker-select');
    selectors.forEach(sel => {
      sel.value = this.currentCaseId;
    });

    // Update header case badge
    const badge = document.getElementById('activeCaseBadge');
    if (badge && this.activeCaseData) {
      badge.textContent = `${this.activeCaseData.caseId}: ${this.activeCaseData.title}`;
    }
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
  }

  setupGraphControls() {
    // Zoom & View buttons
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

  // --- Dashboard Statistics Rendering ---
  renderDashboardStats() {
    if (!this.activeCaseData) return;

    // Numbers strictly derived from loaded demo data
    const totalFiles = this.activeCaseData.evidenceFiles.length;
    const totalEntities = this.activeCaseData.entities.length;
    const totalRelationships = this.activeCaseData.relationships.length;
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

  // --- Entities Table ---
  renderEntitiesTable() {
    const tbody = document.getElementById('entitiesTableBody');
    if (!tbody || !this.activeCaseData) return;

    tbody.innerHTML = this.activeCaseData.entities.map(e => `
      <tr>
        <td><strong>${e.name}</strong></td>
        <td><span class="entity-type-tag type-${e.type.toLowerCase().replace(/[\s\/]+/g, '-')}">${e.type}</span></td>
        <td>${e.role || e.type}</td>
        <td><code>${e.source}</code></td>
        <td>
          <div class="confidence-pill">
            <span class="conf-bar" style="width:${e.confidence}%"></span>
            <span class="conf-text">${e.confidence}%</span>
          </div>
        </td>
        <td><span class="status-pill status-${e.status.toLowerCase().replace(/\s+/g, '-')}">${e.status}</span></td>
        <td>
          <button class="btn-icon inspect-entity-btn" data-id="${e.id}" title="Inspect in Graph &amp; Evidence">
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

    container.innerHTML = this.activeCaseData.evidenceFiles.map(f => `
      <div class="evidence-file-card">
        <div class="file-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="file-info">
          <div class="file-name"><strong>${f.name}</strong></div>
          <div class="file-meta">${f.type} &bull; ${f.size} &bull; ${f.recordsExtracted} records parsed</div>
        </div>
        <div class="file-status">
          <span class="status-pill status-verified">${f.status}</span>
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
            <h3>${rec.primaryEntity} <span class="vs-label">VS</span> ${rec.candidateEntity}</h3>
          </div>
          <div class="match-score">
            <span class="score-number">${rec.matchScore}%</span>
            <span class="score-label">Fuzzy Overlap</span>
          </div>
        </div>

        <div class="matching-factors">
          <h4>Corroborated Correlation Factors:</h4>
          <ul>
            ${rec.matchingFactors.map(f => `<li>&check; ${f}</li>`).join('')}
          </ul>
        </div>

        <div class="identity-footer">
          <div class="identity-meta">
            <span><strong>Supporting Files:</strong> ${rec.supportingRecords}</span>
            <span><strong>Status:</strong> ${rec.status}</span>
          </div>
          ${rec.status === 'Needs Review' ? `
            <div class="identity-actions">
              <button class="btn btn-sm btn-primary approve-merge-btn" data-id="${rec.id}">Approve Merge</button>
              <button class="btn btn-sm btn-secondary reject-merge-btn" data-id="${rec.id}">Reject Merge</button>
            </div>
          ` : `
            <div class="action-recorded-msg">
              <strong>${rec.analystDecision || 'Decision recorded in audit chain.'}</strong>
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

  onIdentityUpdated(record, action) {
    this.renderIdentityView();
    // Also add notice to user
    alert(`[SUTRA Identity Resolution] Candidate ${record.primaryEntity} / ${record.candidateEntity} marked as: ${record.status}`);
  }

  // --- Review Queue View ---
  renderReviewView() {
    const container = document.getElementById('reviewQueueContainer');
    if (!container || !this.reviewQueue) return;

    const items = this.reviewQueue.getItems();
    container.innerHTML = items.map(item => `
      <div class="review-card ${item.status === 'Approved (Verified)' ? 'card-approved' : (item.status.includes('Rejected') ? 'card-rejected' : '')}">
        <div class="review-header">
          <span class="review-type-badge">${item.type}</span>
          <span class="review-conf">Confidence: ${item.confidence}%</span>
        </div>
        <div class="review-subject"><strong>${item.subject}</strong></div>
        <p class="review-reason"><strong>Trigger Reason:</strong> ${item.flagReason}</p>
        <div class="review-source">Source Reference: <code>${item.sourceDoc}</code></div>

        <div class="review-notes-section">
          <input type="text" class="input-notes" id="notes-${item.id}" placeholder="Enter investigator verification note..." value="${item.analystNotes || ''}">
        </div>

        <div class="review-footer">
          <span class="review-status-label">Status: <strong>${item.status}</strong></span>
          ${item.status === 'Pending' ? `
            <div class="review-btn-group">
              <button class="btn btn-sm btn-primary approve-queue-btn" data-id="${item.id}">Approve Lead</button>
              <button class="btn btn-sm btn-danger reject-queue-btn" data-id="${item.id}">Reject Lead</button>
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

  onReviewQueueUpdated(item, action) {
    this.renderReviewView();
    this.renderDashboardStats();
  }

  // --- Timeline View ---
  renderTimelineView() {
    const container = document.getElementById('timelineContainer');
    if (!container || !this.activeCaseData) return;

    container.innerHTML = `
      <div class="timeline-vertical">
        ${this.activeCaseData.timeline.map((item, idx) => `
          <div class="timeline-entry">
            <div class="timeline-marker"></div>
            <div class="timeline-content-box">
              <div class="timeline-timestamp">${item.date}</div>
              <div class="timeline-badge badge-${item.eventType.toLowerCase().replace(/\s+/g, '-')}">${item.eventType}</div>
              <h4 class="timeline-heading">${item.title}</h4>
              <p class="timeline-desc">${item.description}</p>
              <div class="timeline-source">Citing Evidence: <code>${item.source}</code></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- Report View ---
  renderReportView() {
    const container = document.getElementById('reportPreviewContent');
    if (!container || !this.activeCaseData) return;

    const reviewItems = this.reviewQueue ? this.reviewQueue.getItems() : [];
    const idRecords = this.identityResolver ? this.identityResolver.getRecords() : [];
    container.innerHTML = ReportGenerator.renderReportHTML(this.activeCaseData, reviewItems, idRecords);

    const btnPrint = document.getElementById('btnPrintReport');
    if (btnPrint) {
      btnPrint.onclick = () => window.print();
    }
  }

  // --- Evidence File Upload Handlers ---
  setupGlobalEvents() {
    // Drawer close button
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => this.closeEvidenceDrawer());
    }

    // Case Selector changes
    const selectors = document.querySelectorAll('.case-picker-select');
    selectors.forEach(sel => {
      sel.addEventListener('change', (e) => {
        this.loadCase(e.target.value);
      });
    });

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
        <span>Processing <strong>${file.name}</strong> through SUTRA Client-Side Extractor...</span>
      </div>
    `;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const result = EvidenceParser.parseFile(file, content);

      setTimeout(() => {
        if (result.status === 'SUCCESS') {
          // Merge newly extracted entities into active case
          result.entities.forEach(newEnt => {
            if (!this.activeCaseData.entities.some(e => e.name === newEnt.name)) {
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
            size: `${Math.round(file.size / 1024)} KB`,
            recordsExtracted: result.count,
            status: 'Client Parsed'
          });

          this.renderDashboardStats();
          this.renderEntitiesTable();
          this.renderEvidenceFilesList();
          if (this.graphEngine) {
            this.graphEngine.setData(this.activeCaseData.entities, this.activeCaseData.relationships);
          }

          statusBox.innerHTML = `
            <div class="upload-success-state">
              <span class="badge-success">&check; Success: ${result.detectedType}</span>
              <p>Successfully extracted <strong>${result.count} entities</strong> and updated the live investigation graph!</p>
              <button class="btn btn-sm btn-primary" onclick="window.location.hash='#graph'">View Updated Network Graph</button>
            </div>
          `;
        } else if (result.status === 'BACKEND_REQUIRED') {
          statusBox.innerHTML = `
            <div class="upload-warning-state">
              <span class="badge-warning">Notice: ${result.detectedType}</span>
              <p>${result.message}</p>
            </div>
          `;
        } else {
          statusBox.innerHTML = `
            <div class="upload-error-state">
              <span class="badge-error">Parsing Notice:</span>
              <p>${result.message}</p>
            </div>
          `;
        }
      }, 400);
    };

    reader.readAsText(file);
  }

  loadMockSample(type) {
    let mockFile, mockContent;
    if (type === 'CDR') {
      mockFile = { name: 'Field_CDR_TowerDump_98201.csv', size: 12400 };
      mockContent = `Caller,Callee,Duration,TowerID\n+91-98201-44019,+91-98711-20914,84s,DEL-NDLS-04\n+91-98201-44019,+91-97110-39182,120s,DEL-NDLS-04\n+91-98711-20914,+91-99991-88120,45s,RAJ-NMR-01`;
    } else {
      mockFile = { name: 'RTGS_Escrow_Batch_Trace.csv', size: 8900 };
      mockContent = `SenderAccount,ReceiverAccount,Amount,TxRef\nSBI-40918230192,HDFC-99182049102,Rs. 8,50,000,RTGS-0918240\nHDFC-99182049102,ICICI-10293847561,Rs. 8,20,000,IMPS-1192830`;
    }

    this.processUploadedFile({ ...mockFile, name: mockFile.name });
  }
}

// Instantiate SUTRA on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  window.sutraApp = new SutraApp();
});
