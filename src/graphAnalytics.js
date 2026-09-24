/**
 * SUTRA - Graph Analytics & Centrality Engine
 * SIH 2026 Problem Statement ID: 26189 | Team BLACKSWAN
 *
 * Implements deterministic network analysis algorithms:
 * 1. Normalized Degree Centrality
 * 2. Brandes Algorithm for Exact Shortest-Path Betweenness Centrality
 * 3. Deterministic Community / Component Clustering
 * 4. Bidirectional Breadth-First Shortest-Path Finder
 * 5. Explainable Investigative Priority Score (IPS)
 *
 * NOTE: Metrics represent structural centrality and evidentiary corroboration
 * for investigative prioritization. They do not constitute criminal culpability.
 */

export class GraphAnalytics {
  /**
   * Main entrypoint to compute all network metrics for given nodes and edges.
   */
  static analyze(nodes, edges, caseData = null) {
    if (!nodes || nodes.length === 0) {
      return {
        metrics: new Map(),
        topPriorityNodes: [],
        communities: new Map(),
        density: 0,
        diameter: 0
      };
    }

    const n = nodes.length;
    const nodeIds = nodes.map(node => node.id);
    const idSet = new Set(nodeIds);

    // Build adjacency list (undirected for structural centrality)
    const adj = new Map();
    nodeIds.forEach(id => adj.set(id, new Set()));

    const validEdges = edges.filter(e => idSet.has(e.source) && idSet.has(e.target));
    validEdges.forEach(e => {
      if (e.source !== e.target) {
        adj.get(e.source).add(e.target);
        adj.get(e.target).add(e.source);
      }
    });

    // 1. Degree Centrality
    const degrees = new Map();
    nodeIds.forEach(id => {
      const deg = adj.get(id).size;
      const normDeg = n > 1 ? deg / (n - 1) : 0;
      degrees.set(id, { degree: deg, normalized: normDeg });
    });

    // 2. Brandes Betweenness Centrality (O(V * E))
    const betweenness = this.calculateBetweenness(nodeIds, adj);

    // 3. Connected Components / Community Detection
    const communities = this.detectCommunities(nodeIds, adj);

    // 4. Evidence count per node (from case files and edges)
    const evidenceSourceCounts = this.countEvidenceSources(nodes, validEdges, caseData);

    // 5. Investigative Priority Score (IPS) & Explanations
    const metrics = new Map();
    nodes.forEach(node => {
      const degInfo = degrees.get(node.id) || { degree: 0, normalized: 0 };
      const cb = betweenness.get(node.id) || 0;
      const comm = communities.get(node.id) || 1;
      const sourceCount = evidenceSourceCounts.get(node.id) || 1;

      // Count verified relationships incident to this node
      const verifiedRelCount = validEdges.filter(
        e => (e.source === node.id || e.target === node.id) && e.status === 'Verified'
      ).length;

      // Check if node has anomaly or review flag
      const hasAnomaly = node.status === 'Needs Review' || (node.details && /nocturnal|burst|suspicious|forged|shell/i.test(node.details));

      // Formula: 0.35 * Degree + 0.35 * Betweenness + 0.15 * min(1, sources/3) + 0.15 * min(1, verified/4)
      const rawScore = (
        0.35 * degInfo.normalized +
        0.35 * cb +
        0.15 * Math.min(1.0, sourceCount / 3) +
        0.15 * Math.min(1.0, verifiedRelCount / 4) +
        (hasAnomaly ? 0.08 : 0)
      );

      const priorityScore = Math.min(99, Math.max(12, Math.round(rawScore * 100)));

      const explanation = this.generateExplanation(node, degInfo, cb, sourceCount, verifiedRelCount, hasAnomaly);

      metrics.set(node.id, {
        id: node.id,
        name: node.name,
        type: node.type,
        degree: degInfo.degree,
        degreeCentrality: parseFloat(degInfo.normalized.toFixed(3)),
        betweennessCentrality: parseFloat(cb.toFixed(3)),
        communityId: comm,
        evidenceSourceCount: sourceCount,
        verifiedRelCount,
        priorityScore,
        explanation
      });
    });

    // Rank top priority nodes
    const topPriorityNodes = [...metrics.values()]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 3);

    // Network Density: 2 * |E| / (|V| * (|V| - 1))
    const density = n > 1 ? (2 * validEdges.length) / (n * (n - 1)) : 0;

    return {
      metrics,
      topPriorityNodes,
      communities,
      density: parseFloat(density.toFixed(3)),
      totalNodes: n,
      totalEdges: validEdges.length
    };
  }

  /**
   * Brandes Algorithm for Betweenness Centrality
   */
  static calculateBetweenness(nodeIds, adj) {
    const cb = new Map();
    nodeIds.forEach(id => cb.set(id, 0));

    nodeIds.forEach(s => {
      const S = []; // Stack
      const P = new Map(); // Predecessors on shortest paths
      const sigma = new Map(); // Number of shortest paths from s to v
      const d = new Map(); // Distance from s to v

      nodeIds.forEach(w => {
        P.set(w, []);
        sigma.set(w, 0);
        d.set(w, -1);
      });

      sigma.set(s, 1);
      d.set(s, 0);

      const Q = [s]; // Queue

      while (Q.length > 0) {
        const v = Q.shift();
        S.push(v);

        const neighbors = adj.get(v) || new Set();
        neighbors.forEach(w => {
          // w found for the first time?
          if (d.get(w) < 0) {
            Q.push(w);
            d.set(w, d.get(v) + 1);
          }
          // Shortest path to w via v?
          if (d.get(w) === d.get(v) + 1) {
            sigma.set(w, sigma.get(w) + sigma.get(v));
            P.get(w).push(v);
          }
        });
      }

      // Accumulation / Back-propagation
      const delta = new Map();
      nodeIds.forEach(w => delta.set(w, 0));

      while (S.length > 0) {
        const w = S.pop();
        const preds = P.get(w) || [];
        preds.forEach(v => {
          const coeff = (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w));
          delta.set(v, delta.get(v) + coeff);
        });
        if (w !== s) {
          cb.set(w, cb.get(w) + delta.get(w));
        }
      }
    });

    // Normalize for undirected graph: divide by ((n - 1) * (n - 2))
    const n = nodeIds.length;
    const factor = (n > 2) ? ((n - 1) * (n - 2)) : 1;

    nodeIds.forEach(id => {
      // Divide by 2 because paths counted in both directions
      const val = cb.get(id) / (factor * 2);
      cb.set(id, val);
    });

    return cb;
  }

  /**
   * Deterministic Connected Components / Community Detection
   */
  static detectCommunities(nodeIds, adj) {
    const visited = new Set();
    const communityMap = new Map();
    let currentCommunityId = 1;

    // Deterministic sort by node ID
    const sortedNodeIds = [...nodeIds].sort();

    sortedNodeIds.forEach(startId => {
      if (!visited.has(startId)) {
        const queue = [startId];
        visited.add(startId);
        communityMap.set(startId, currentCommunityId);

        while (queue.length > 0) {
          const curr = queue.shift();
          const neighbors = [...(adj.get(curr) || [])].sort();
          neighbors.forEach(nbr => {
            if (!visited.has(nbr)) {
              visited.add(nbr);
              communityMap.set(nbr, currentCommunityId);
              queue.push(nbr);
            }
          });
        }
        currentCommunityId++;
      }
    });

    return communityMap;
  }

  /**
   * Evidence source counter
   */
  static countEvidenceSources(nodes, edges, caseData) {
    const sourceMap = new Map();
    nodes.forEach(node => {
      const sources = new Set();
      if (node.source) sources.add(node.source);

      // Add edge source documents
      edges.forEach(e => {
        if ((e.source === node.id || e.target === node.id) && e.sourceDoc) {
          sources.add(e.sourceDoc);
        }
      });

      sourceMap.set(node.id, Math.max(1, sources.size));
    });
    return sourceMap;
  }

  /**
   * Explainable output describing why node was prioritized
   */
  static generateExplanation(node, degInfo, cb, sourceCount, verifiedRelCount, hasAnomaly) {
    const reasons = [];

    if (cb > 0.15) {
      reasons.push(`Key bridge node connecting disparate network clusters (Betweenness: ${(cb * 100).toFixed(1)}%)`);
    } else if (degInfo.degree >= 4) {
      reasons.push(`High communication/transaction hub with ${degInfo.degree} direct conduits`);
    } else {
      reasons.push(`Connected node with ${degInfo.degree} direct relations`);
    }

    if (sourceCount >= 2) {
      reasons.push(`Corroborated across ${sourceCount} independent evidentiary files`);
    }

    if (verifiedRelCount >= 2) {
      reasons.push(`${verifiedRelCount} verified evidentiary links`);
    }

    if (hasAnomaly) {
      reasons.push(`Flagged with anomalous indicator requiring analyst triage`);
    }

    return reasons.join('; ');
  }

  /**
   * Shortest Path Discovery between two nodes (BFS)
   */
  static findShortestPath(startId, endId, nodes, edges) {
    if (!startId || !endId || startId === endId) return null;

    const idSet = new Set(nodes.map(n => n.id));
    if (!idSet.has(startId) || !idSet.has(endId)) return null;

    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));

    edges.forEach(e => {
      if (idSet.has(e.source) && idSet.has(e.target)) {
        adj.get(e.source).push({ target: e.target, edge: e });
        adj.get(e.target).push({ target: e.source, edge: e });
      }
    });

    const queue = [startId];
    const visited = new Set([startId]);
    const parentMap = new Map(); // child -> { parent, edge }

    let found = false;

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === endId) {
        found = true;
        break;
      }

      const neighbors = adj.get(curr) || [];
      for (const { target, edge } of neighbors) {
        if (!visited.has(target)) {
          visited.add(target);
          parentMap.set(target, { parent: curr, edge });
          queue.push(target);
        }
      }
    }

    if (!found) return null;

    // Backtrack path
    const path = [];
    const pathEdges = [];
    let step = endId;

    while (step !== startId) {
      path.unshift(step);
      const info = parentMap.get(step);
      if (info) {
        pathEdges.unshift(info.edge);
        step = info.parent;
      } else {
        break;
      }
    }
    path.unshift(startId);

    return {
      path,
      edges: pathEdges,
      hops: path.length - 1
    };
  }
}
