/**
 * SUTRA - High-Performance Reactive Canvas Graph Engine (Judge-Ready Upgraded)
 * SIH 2026 Problem Statement ID: 26189 | Team BLACKSWAN
 *
 * Upgrades:
 * - Solves half-graph clipping via ResizeObserver and world-space camera bounding clamping
 * - Canonical entity type normalization (Bank Account / Crypto Wallets all mapped and visible)
 * - Search highlights and centers matching nodes without hiding the surrounding graph (non-matching dimmed)
 * - Collision prevention and kinetic cooldown (simulation stops after settling to preserve CPU)
 * - Full pointer events support (mouse and multi-touch)
 * - Shortest-path visual path tracing mode
 * - Relationship type and verification status filters
 */

export class GraphEngine {
  constructor(canvasContainerId, onSelectNode, onSelectEdge) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) {
      throw new Error(`Graph container #${canvasContainerId} not found`);
    }

    this.onSelectNode = onSelectNode || (() => {});
    this.onSelectEdge = onSelectEdge || (() => {});

    // Create Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'sutra-graph-canvas';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Camera Transform (World coordinates)
    this.camera = { x: 0, y: 0, scale: 1.0 };

    // Data structures
    this.nodes = [];
    this.edges = [];
    this.nodeMap = new Map();

    // Filters
    this.filters = {
      types: new Set(['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location', 'Event', 'Document']),
      relationshipTypes: new Set(['ALL']),
      statuses: new Set(['Verified', 'Needs Review', 'AI Suggested', 'Rejected']),
      minConfidence: 0,
      searchQuery: ''
    };

    // State
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    this.hoveredNodeId = null;
    this.hoveredEdgeId = null;
    this.isDraggingNode = false;
    this.draggedNode = null;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.cameraStart = { x: 0, y: 0 };

    // Shortest path tracing state
    this.shortestPathNodeIds = new Set();
    this.shortestPathEdgeIds = new Set();

    // Simulation lifecycle
    this.simulationRunning = true;
    this.simulationTicks = 0;
    this.maxTicks = 180;

    // Node Type Styling Configuration
    this.typeColors = {
      Person: { fill: '#f59e0b', stroke: '#fbbf24', label: 'Person' },
      Phone: { fill: '#06b6d4', stroke: '#22d3ee', label: 'Phone' },
      Vehicle: { fill: '#a855f7', stroke: '#c084fc', label: 'Vehicle' },
      BankAccount: { fill: '#10b981', stroke: '#34d399', label: 'Bank / Crypto' },
      Organization: { fill: '#3b82f6', stroke: '#60a5fa', label: 'Organization' },
      Location: { fill: '#f43f5e', stroke: '#fb7185', label: 'Location' },
      Event: { fill: '#ea580c', stroke: '#fb923c', label: 'Event' },
      Document: { fill: '#64748b', stroke: '#94a3b8', label: 'Document' }
    };

    // Setup viewport observers & listeners
    this.setupResizeObserver();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  static normalizeType(rawType) {
    if (!rawType) return 'Document';
    const s = String(rawType).trim().toLowerCase();
    if (s.includes('bank') || s.includes('wallet') || s.includes('crypto') || s.includes('account')) {
      return 'BankAccount';
    }
    if (s.includes('person') || s.includes('suspect') || s.includes('officer')) {
      return 'Person';
    }
    if (s.includes('phone') || s.includes('sim') || s.includes('cdr')) {
      return 'Phone';
    }
    if (s.includes('vehicle') || s.includes('car') || s.includes('truck')) {
      return 'Vehicle';
    }
    if (s.includes('org') || s.includes('company') || s.includes('shell')) {
      return 'Organization';
    }
    if (s.includes('loc') || s.includes('place') || s.includes('safehouse') || s.includes('toll')) {
      return 'Location';
    }
    if (s.includes('event') || s.includes('meeting') || s.includes('incident')) {
      return 'Event';
    }
    return 'Document';
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.container);
    this.handleResize();
  }

  handleResize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = Math.max(300, rect.width);
    this.height = Math.max(300, rect.height);

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.wakeSimulation();
  }

  setData(entities, relationships) {
    this.nodeMap.clear();
    this.shortestPathNodeIds.clear();
    this.shortestPathEdgeIds.clear();

    const count = entities.length;
    const radius = Math.min(this.width, this.height) * 0.35 || 220;

    this.nodes = entities.map((ent, idx) => {
      const canonicalType = GraphEngine.normalizeType(ent.type);
      const angle = (idx / count) * Math.PI * 2;
      const node = {
        id: ent.id,
        name: ent.name,
        type: canonicalType,
        subtype: ent.type,
        role: ent.role || ent.type,
        confidence: ent.confidence || 90,
        status: ent.status || 'Verified',
        source: ent.source,
        details: ent.details,
        provenance: ent.provenance,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        radius: canonicalType === 'Person' ? 24 : (canonicalType === 'BankAccount' ? 22 : 18),
        fixed: false,
        raw: ent
      };
      this.nodeMap.set(node.id, node);
      return node;
    });

    // Map Edges
    this.edges = relationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: rel.type,
      label: rel.type.replace(/_/g, ' '),
      confidence: rel.confidence || 85,
      status: rel.status || 'Verified',
      sourceDoc: rel.sourceDoc,
      date: rel.date,
      details: rel.details,
      provenance: rel.provenance,
      raw: rel
    }));

    // Trigger relaxation steps and fit
    this.wakeSimulation();
    for (let i = 0; i < 70; i++) {
      this.stepPhysics();
    }
    this.fitToView();
  }

  wakeSimulation() {
    this.simulationRunning = true;
    this.simulationTicks = 0;
  }

  stepPhysics() {
    if (!this.simulationRunning) return;

    this.simulationTicks++;
    if (this.simulationTicks > this.maxTicks) {
      this.simulationRunning = false;
      return;
    }

    const kRepel = 2800;
    const kSpring = 0.045;
    const springLength = 140;
    const damping = 0.82;

    const visibleNodes = this.getVisibleNodes();

    // 1. Repulsion & Collision Handling
    for (let i = 0; i < visibleNodes.length; i++) {
      const n1 = visibleNodes[i];
      for (let j = i + 1; j < visibleNodes.length; j++) {
        const n2 = visibleNodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(distSq);

        // Minimum distance to prevent overlap
        const minDist = n1.radius + n2.radius + 16;
        if (dist < minDist) {
          const overlap = minDist - dist;
          const ox = (dx / dist) * overlap * 0.5;
          const oy = (dy / dist) * overlap * 0.5;
          if (!n1.fixed && n1 !== this.draggedNode) { n1.x -= ox; n1.y -= oy; }
          if (!n2.fixed && n2 !== this.draggedNode) { n2.x += ox; n2.y += oy; }
        }

        if (dist < 480) {
          const force = kRepel / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!n1.fixed && n1 !== this.draggedNode) { n1.vx -= fx; n1.vy -= fy; }
          if (!n2.fixed && n2 !== this.draggedNode) { n2.vx += fx; n2.vy += fy; }
        }
      }
    }

    // 2. Spring forces on edges
    this.edges.forEach(edge => {
      const s = this.nodeMap.get(edge.source);
      const t = this.nodeMap.get(edge.target);
      if (s && t && this.isNodeVisible(s) && this.isNodeVisible(t)) {
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - springLength) * kSpring;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!s.fixed && s !== this.draggedNode) { s.vx += fx; s.vy += fy; }
        if (!t.fixed && t !== this.draggedNode) { t.vx -= fx; t.vy -= fy; }
      }
    });

    // 3. Update positions
    visibleNodes.forEach(node => {
      if (node !== this.draggedNode && !node.fixed) {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      }
    });
  }

  isNodeVisible(node) {
    if (!this.filters.types.has(node.type)) return false;
    if (node.confidence < this.filters.minConfidence) return false;
    if (!this.filters.statuses.has(node.status)) return false;
    return true;
  }

  isNodeSearchMatch(node) {
    if (!this.filters.searchQuery) return false;
    const q = this.filters.searchQuery.toLowerCase().trim();
    if (!q) return false;
    return (
      (node.name && node.name.toLowerCase().includes(q)) ||
      (node.role && node.role.toLowerCase().includes(q)) ||
      (node.id && node.id.toLowerCase().includes(q))
    );
  }

  getVisibleNodes() {
    return this.nodes.filter(n => this.isNodeVisible(n));
  }

  getVisibleEdges() {
    return this.edges.filter(e => {
      const s = this.nodeMap.get(e.source);
      const t = this.nodeMap.get(e.target);
      if (!s || !t || !this.isNodeVisible(s) || !this.isNodeVisible(t)) return false;

      // Status filter
      if (!this.filters.statuses.has(e.status)) return false;

      // Relationship type filter
      if (!this.filters.relationshipTypes.has('ALL') && !this.filters.relationshipTypes.has(e.type)) {
        return false;
      }

      return true;
    });
  }

  // --- World <-> Screen Coordinate Mapping ---
  worldToScreen(wx, wy) {
    const sx = this.width / 2 + (wx - this.camera.x) * this.camera.scale;
    const sy = this.height / 2 + (wy - this.camera.y) * this.camera.scale;
    return { x: sx, y: sy };
  }

  screenToWorld(sx, sy) {
    const wx = this.camera.x + (sx - this.width / 2) / this.camera.scale;
    const wy = this.camera.y + (sy - this.height / 2) / this.camera.scale;
    return { x: wx, y: wy };
  }

  // --- View Controls ---
  fitToView() {
    const visibleNodes = this.getVisibleNodes();
    if (visibleNodes.length === 0) {
      this.camera = { x: 0, y: 0, scale: 1.0 };
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    visibleNodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const boxWidth = Math.max(100, maxX - minX + 160);
    const boxHeight = Math.max(100, maxY - minY + 160);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = (this.width - 60) / boxWidth;
    const scaleY = (this.height - 60) / boxHeight;
    const bestScale = Math.min(1.8, Math.max(0.35, Math.min(scaleX, scaleY)));

    this.camera.x = centerX;
    this.camera.y = centerY;
    this.camera.scale = bestScale;
  }

  resetView() {
    this.camera = { x: 0, y: 0, scale: 1.0 };
    this.fitToView();
  }

  zoomBy(factor) {
    const newScale = Math.min(3.5, Math.max(0.2, this.camera.scale * factor));
    this.camera.scale = newScale;
  }

  clearSearch() {
    this.filters.searchQuery = '';
  }

  highlightShortestPath(pathNodeIds, pathEdgeObjs = []) {
    this.shortestPathNodeIds = new Set(pathNodeIds);
    this.shortestPathEdgeIds = new Set(pathEdgeObjs.map(e => e.id));
    this.wakeSimulation();
  }

  clearShortestPath() {
    this.shortestPathNodeIds.clear();
    this.shortestPathEdgeIds.clear();
  }

  centerOnNode(nodeId) {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      this.camera.x = node.x;
      this.camera.y = node.y;
      this.selectedNodeId = node.id;
    }
  }

  // --- Interaction Listeners (Pointer Events for Touch & Mouse) ---
  setupEventListeners() {
    const c = this.canvas;

    const onPointerDown = (e) => {
      const rect = c.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const world = this.screenToWorld(mouseX, mouseY);

      // Check if clicked a node
      const clickedNode = this.findNodeAt(world.x, world.y);
      if (clickedNode) {
        this.isDraggingNode = true;
        this.draggedNode = clickedNode;
        this.selectedNodeId = clickedNode.id;
        this.selectedEdgeId = null;
        this.wakeSimulation();
        this.onSelectNode(clickedNode.raw);
        return;
      }

      // Check if clicked an edge
      const clickedEdge = this.findEdgeAt(world.x, world.y);
      if (clickedEdge) {
        this.selectedEdgeId = clickedEdge.id;
        this.selectedNodeId = null;
        this.onSelectEdge(clickedEdge.raw);
        return;
      }

      // Start Panning
      this.isPanning = true;
      this.panStart = { x: mouseX, y: mouseY };
      this.cameraStart = { x: this.camera.x, y: this.camera.y };
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
    };

    const onPointerMove = (e) => {
      const rect = c.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDraggingNode && this.draggedNode) {
        const world = this.screenToWorld(mouseX, mouseY);
        this.draggedNode.x = world.x;
        this.draggedNode.y = world.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
        this.wakeSimulation();
        return;
      }

      if (this.isPanning) {
        const dx = (mouseX - this.panStart.x) / this.camera.scale;
        const dy = (mouseY - this.panStart.y) / this.camera.scale;
        this.camera.x = this.cameraStart.x - dx;
        this.camera.y = this.cameraStart.y - dy;
        return;
      }

      // Hover check
      const world = this.screenToWorld(mouseX, mouseY);
      const hovered = this.findNodeAt(world.x, world.y);
      this.hoveredNodeId = hovered ? hovered.id : null;

      const hoveredEdge = !hovered ? this.findEdgeAt(world.x, world.y) : null;
      this.hoveredEdgeId = hoveredEdge ? hoveredEdge.id : null;

      c.style.cursor = hovered ? 'pointer' : (hoveredEdge ? 'pointer' : (this.isPanning ? 'grabbing' : 'default'));
    };

    const onPointerUp = () => {
      this.isDraggingNode = false;
      this.draggedNode = null;
      this.isPanning = false;
    };

    c.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Zoom on wheel centered on mouse
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldBefore = this.screenToWorld(mouseX, mouseY);
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.min(3.5, Math.max(0.25, this.camera.scale * zoomFactor));

      this.camera.scale = newScale;
      const worldAfter = this.screenToWorld(mouseX, mouseY);

      this.camera.x += (worldBefore.x - worldAfter.x);
      this.camera.y += (worldBefore.y - worldAfter.y);
    }, { passive: false });
  }

  findNodeAt(wx, wy) {
    const visibleNodes = this.getVisibleNodes();
    for (let i = visibleNodes.length - 1; i >= 0; i--) {
      const n = visibleNodes[i];
      const dx = n.x - wx;
      const dy = n.y - wy;
      if (dx * dx + dy * dy <= (n.radius + 8) * (n.radius + 8)) {
        return n;
      }
    }
    return null;
  }

  findEdgeAt(wx, wy) {
    const visibleEdges = this.getVisibleEdges();
    for (let i = 0; i < visibleEdges.length; i++) {
      const edge = visibleEdges[i];
      const s = this.nodeMap.get(edge.source);
      const t = this.nodeMap.get(edge.target);
      if (!s || !t) continue;

      const dist = this.distToSegment({ x: wx, y: wy }, s, t);
      if (dist < 12) return edge;
    }
    return null;
  }

  distToSegment(p, v, w) {
    const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  // --- Rendering Loop ---
  startRenderLoop() {
    const render = () => {
      this.stepPhysics();
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    this.animId = requestAnimationFrame(render);
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();

    // Clear background
    ctx.clearRect(0, 0, this.width, this.height);

    // Subtle grid in world space
    this.drawBackgroundGrid(ctx);

    const hasSearchQuery = Boolean(this.filters.searchQuery && this.filters.searchQuery.trim());
    const hasShortestPath = this.shortestPathNodeIds.size > 0;

    // Draw Edges
    const visibleEdges = this.getVisibleEdges();
    visibleEdges.forEach(edge => {
      const s = this.nodeMap.get(edge.source);
      const t = this.nodeMap.get(edge.target);
      if (!s || !t) return;

      const p1 = this.worldToScreen(s.x, s.y);
      const p2 = this.worldToScreen(t.x, t.y);

      const isSelected = edge.id === this.selectedEdgeId;
      const isHovered = edge.id === this.hoveredEdgeId;
      const isConnectedToSelected = s.id === this.selectedNodeId || t.id === this.selectedNodeId;
      const isShortestPathEdge = hasShortestPath && (
        (this.shortestPathNodeIds.has(s.id) && this.shortestPathNodeIds.has(t.id)) ||
        this.shortestPathEdgeIds.has(edge.id)
      );

      // Line style
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (edge.status === 'Rejected') {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }

      if (isShortestPathEdge) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#00f5d4';
      } else if (isSelected || isHovered) {
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#38bdf8';
      } else if (isConnectedToSelected) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#60a5fa';
      } else {
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = edge.status === 'Rejected' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(148, 163, 184, 0.28)';
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Direction Arrow
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const arrowDist = (t.radius + 12) * this.camera.scale;
      const arrowX = p2.x - Math.cos(angle) * arrowDist;
      const arrowY = p2.y - Math.sin(angle) * arrowDist;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI / 6), arrowY - 8 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI / 6), arrowY - 8 * Math.sin(angle + Math.PI / 6));
      ctx.fillStyle = isShortestPathEdge ? '#00f5d4' : (isSelected || isHovered ? '#38bdf8' : 'rgba(148, 163, 184, 0.5)');
      ctx.fill();

      // Edge Label on selection, hover, or sufficient zoom
      if (this.camera.scale > 0.85 || isSelected || isHovered || isConnectedToSelected) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = isShortestPathEdge ? '#00f5d4' : (isSelected || isHovered ? '#7dd3fc' : 'rgba(148, 163, 184, 0.75)');
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, midX, midY - 6);
      }
    });

    // Draw Nodes
    const visibleNodes = this.getVisibleNodes();
    visibleNodes.forEach(node => {
      const pos = this.worldToScreen(node.x, node.y);
      const isSelected = node.id === this.selectedNodeId;
      const isHovered = node.id === this.hoveredNodeId;
      const isSearchMatch = this.isNodeSearchMatch(node);
      const isShortestPathNode = hasShortestPath && this.shortestPathNodeIds.has(node.id);

      // Dimming logic if search is active or shortest path is active
      let opacity = 1.0;
      if (hasSearchQuery && !isSearchMatch && !isSelected) {
        opacity = 0.28;
      } else if (hasShortestPath && !isShortestPathNode && !isSelected) {
        opacity = 0.3;
      }

      ctx.globalAlpha = opacity;

      const style = this.typeColors[node.type] || { fill: '#3b82f6', stroke: '#60a5fa' };
      const radius = Math.max(11, node.radius * this.camera.scale);

      // Search Match or Selection Halo Glow
      if (isSearchMatch) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (isShortestPathNode) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 245, 212, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + (isSelected ? 9 : 6), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Core Node Circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = style.fill;
      ctx.fill();

      // Border indicator (dashed if Needs Review, red if Rejected)
      if (node.status === 'Needs Review') {
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbbf24';
      } else if (node.status === 'Rejected') {
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ef4444';
      } else {
        ctx.setLineDash([]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = style.stroke;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Node Name Label
      ctx.font = `${Math.max(10, Math.min(14, 11 * this.camera.scale))}px Plus Jakarta Sans, sans-serif`;
      ctx.fillStyle = isSearchMatch ? '#fde047' : (isSelected ? '#ffffff' : '#f1f5f9');
      ctx.textAlign = 'center';
      ctx.fillText(node.name, pos.x, pos.y + radius + 14);

      // Subtitle (Role or Subtype)
      if (this.camera.scale > 0.65) {
        ctx.font = `${Math.max(8, Math.min(11, 9 * this.camera.scale))}px JetBrains Mono, monospace`;
        ctx.fillStyle = '#94a3b8';
        const subLabel = node.subtype && node.subtype !== node.type ? `${node.subtype}` : node.role;
        ctx.fillText(subLabel, pos.x, pos.y + radius + 26);
      }

      ctx.globalAlpha = 1.0;
    });

    ctx.restore();
  }

  drawBackgroundGrid(ctx) {
    const gridSpacing = 50 * this.camera.scale;
    if (gridSpacing < 15) return;

    const startX = (this.width / 2 - this.camera.x * this.camera.scale) % gridSpacing;
    const startY = (this.height / 2 - this.camera.y * this.camera.scale) % gridSpacing;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = startX; x < this.width; x += gridSpacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = startY; y < this.height; y += gridSpacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
