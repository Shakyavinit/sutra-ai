/**
 * SUTRA - High-Performance Reactive Canvas Graph Engine
 * Features:
 * - Dynamic Viewport & ResizeObserver (Fixes the half-graph clipping issue)
 * - World-to-Screen coordinate transformation with smooth Camera Pan & Zoom
 * - Force-directed physics layout with node pinning & dragging
 * - Node & Relationship selection with visual indicators
 * - Entity-type, relationship-type, and confidence filtering
 * - Fit to View (automatic bounding box centering)
 * - Entity search and auto-focus
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
    this.targetCamera = { x: 0, y: 0, scale: 1.0 };

    // Data structures
    this.nodes = [];
    this.edges = [];
    this.nodeMap = new Map();

    // Filters
    this.filters = {
      types: new Set(['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location', 'Event', 'Document']),
      minConfidence: 0,
      searchQuery: ''
    };

    // State
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    this.hoveredNodeId = null;
    this.isDraggingNode = false;
    this.draggedNode = null;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.cameraStart = { x: 0, y: 0 };

    // Node Type Styling Configuration
    this.typeColors = {
      Person: { fill: '#f59e0b', stroke: '#fbbf24', text: '#fff', label: 'Person' },
      Phone: { fill: '#06b6d4', stroke: '#22d3ee', text: '#fff', label: 'Phone' },
      Vehicle: { fill: '#a855f7', stroke: '#c084fc', text: '#fff', label: 'Vehicle' },
      BankAccount: { fill: '#10b981', stroke: '#34d399', text: '#fff', label: 'Bank A/C' },
      'Bank Account': { fill: '#10b981', stroke: '#34d399', text: '#fff', label: 'Bank A/C' },
      'Bank Account / Wallet': { fill: '#10b981', stroke: '#34d399', text: '#fff', label: 'Crypto/Bank' },
      Organization: { fill: '#3b82f6', stroke: '#60a5fa', text: '#fff', label: 'Organization' },
      Location: { fill: '#f43f5e', stroke: '#fb7185', text: '#fff', label: 'Location' },
      Event: { fill: '#ea580c', stroke: '#fb923c', text: '#fff', label: 'Event' },
      Document: { fill: '#64748b', stroke: '#94a3b8', text: '#fff', label: 'Document' }
    };

    // Setup viewport observers & listeners
    this.setupResizeObserver();
    this.setupEventListeners();
    this.startRenderLoop();
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
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.max(300, rect.width * dpr);
    this.canvas.height = Math.max(300, rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  setData(entities, relationships) {
    this.nodeMap.clear();

    // Map Nodes with physics variables
    const count = entities.length;
    const radius = Math.min(this.width, this.height) * 0.35 || 220;

    this.nodes = entities.map((ent, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      const node = {
        id: ent.id,
        name: ent.name,
        type: ent.type,
        role: ent.role || ent.type,
        confidence: ent.confidence || 90,
        status: ent.status || 'Verified',
        source: ent.source,
        details: ent.details,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: ent.type === 'Person' ? 24 : 18,
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
      raw: rel
    }));

    // Trigger relaxation steps and center
    for (let i = 0; i < 60; i++) {
      this.stepPhysics();
    }
    this.fitToView();
  }

  stepPhysics() {
    const kRepel = 2400;
    const kSpring = 0.05;
    const springLength = 130;
    const damping = 0.85;

    // Repulsion between visible nodes
    const visibleNodes = this.getVisibleNodes();
    for (let i = 0; i < visibleNodes.length; i++) {
      const n1 = visibleNodes[i];
      for (let j = i + 1; j < visibleNodes.length; j++) {
        const n2 = visibleNodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(distSq);
        if (dist < 450) {
          const force = kRepel / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!n1.fixed && n1 !== this.draggedNode) { n1.vx -= fx; n1.vy -= fy; }
          if (!n2.fixed && n2 !== this.draggedNode) { n2.vx += fx; n2.vy += fy; }
        }
      }
    }

    // Spring forces on edges
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

    // Update positions
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
    if (this.filters.searchQuery) {
      const q = this.filters.searchQuery.toLowerCase();
      const matchName = node.name.toLowerCase().includes(q);
      const matchRole = node.role.toLowerCase().includes(q);
      const matchType = node.type.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchType) return false;
    }
    return true;
  }

  getVisibleNodes() {
    return this.nodes.filter(n => this.isNodeVisible(n));
  }

  getVisibleEdges() {
    return this.edges.filter(e => {
      const s = this.nodeMap.get(e.source);
      const t = this.nodeMap.get(e.target);
      return s && t && this.isNodeVisible(s) && this.isNodeVisible(t);
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

    const boxWidth = Math.max(100, maxX - minX + 140);
    const boxHeight = Math.max(100, maxY - minY + 140);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = (this.width - 80) / boxWidth;
    const scaleY = (this.height - 80) / boxHeight;
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

  // --- Interaction Listeners ---
  setupEventListeners() {
    const c = this.canvas;

    c.addEventListener('mousedown', (e) => {
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

      // Otherwise Start Canvas Pan
      this.isPanning = true;
      this.panStart = { x: mouseX, y: mouseY };
      this.cameraStart = { x: this.camera.x, y: this.camera.y };
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = c.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDraggingNode && this.draggedNode) {
        const world = this.screenToWorld(mouseX, mouseY);
        this.draggedNode.x = world.x;
        this.draggedNode.y = world.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
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
      c.style.cursor = hovered ? 'pointer' : (this.isPanning ? 'grabbing' : 'crosshair');
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingNode = false;
      this.draggedNode = null;
      this.isPanning = false;
    });

    // Zoom on wheel with zoom-to-cursor
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldBefore = this.screenToWorld(mouseX, mouseY);
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.min(3.5, Math.max(0.2, this.camera.scale * zoomFactor));

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
      if (dx * dx + dy * dy <= (n.radius + 6) * (n.radius + 6)) {
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

      // Distance from point to line segment
      const dist = this.distToSegment({ x: wx, y: wy }, s, t);
      if (dist < 10) return edge;
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

    // Subtle grid pattern in world space
    this.drawBackgroundGrid(ctx);

    // Draw Edges
    const visibleEdges = this.getVisibleEdges();
    visibleEdges.forEach(edge => {
      const s = this.nodeMap.get(edge.source);
      const t = this.nodeMap.get(edge.target);
      if (!s || !t) return;

      const p1 = this.worldToScreen(s.x, s.y);
      const p2 = this.worldToScreen(t.x, t.y);

      const isSelected = edge.id === this.selectedEdgeId;
      const isConnectedToSelected = s.id === this.selectedNodeId || t.id === this.selectedNodeId;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = isSelected ? 3.5 : (isConnectedToSelected ? 2.5 : 1.5);
      ctx.strokeStyle = isSelected ? '#38bdf8' : (isConnectedToSelected ? '#60a5fa' : 'rgba(148, 163, 184, 0.28)');
      ctx.stroke();

      // Draw direction arrow
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const arrowDist = (t.radius + 12) * this.camera.scale;
      const arrowX = p2.x - Math.cos(angle) * arrowDist;
      const arrowY = p2.y - Math.sin(angle) * arrowDist;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI / 6), arrowY - 8 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI / 6), arrowY - 8 * Math.sin(angle + Math.PI / 6));
      ctx.fillStyle = isSelected ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)';
      ctx.fill();

      // Edge label if scale permits or selected
      if (this.camera.scale > 0.8 || isSelected || isConnectedToSelected) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = isSelected ? '#7dd3fc' : 'rgba(148, 163, 184, 0.7)';
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
      const style = this.typeColors[node.type] || { fill: '#3b82f6', stroke: '#60a5fa', text: '#fff' };

      const radius = Math.max(10, node.radius * this.camera.scale);

      // Selected / Hover Ring
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + (isSelected ? 8 : 5), 0, Math.PI * 2);
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
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = style.stroke;
      ctx.stroke();

      // Node Label
      ctx.font = `${Math.max(10, Math.min(14, 11 * this.camera.scale))}px Plus Jakarta Sans, sans-serif`;
      ctx.fillStyle = isSelected ? '#fff' : '#f1f5f9';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, pos.x, pos.y + radius + 14);

      // Role subtitle
      if (this.camera.scale > 0.65) {
        ctx.font = `${Math.max(8, Math.min(11, 9 * this.camera.scale))}px JetBrains Mono, monospace`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(node.role, pos.x, pos.y + radius + 26);
      }
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
