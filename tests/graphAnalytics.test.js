import { describe, it, expect } from 'vitest';
import { GraphAnalytics } from '../src/graphAnalytics.js';

describe('GraphAnalytics Centrality & Community Engine', () => {
  // Test network: Line graph A -- B -- C -- D
  const nodes = [
    { id: 'A', name: 'Node A', type: 'Person', confidence: 90 },
    { id: 'B', name: 'Node B', type: 'Person', confidence: 95 },
    { id: 'C', name: 'Node C', type: 'Person', confidence: 95 },
    { id: 'D', name: 'Node D', type: 'Person', confidence: 85 }
  ];

  const edges = [
    { source: 'A', target: 'B', type: 'CALLS' },
    { source: 'B', target: 'C', type: 'FINANCIAL_TRANSFER' },
    { source: 'C', target: 'D', type: 'ASSOCIATED_WITH' }
  ];

  it('calculates normalized degree centrality accurately', () => {
    const result = GraphAnalytics.analyze(nodes, edges);
    const nodeA = result.metrics.get('A');
    const nodeB = result.metrics.get('B');

    // Degree of A = 1, normalized by (4 - 1) = 1/3 ~ 0.333
    expect(nodeA.degree).toBe(1);
    expect(nodeA.degreeCentrality).toBeCloseTo(1 / 3, 2);

    // Degree of B = 2, normalized by (4 - 1) = 2/3 ~ 0.667
    expect(nodeB.degree).toBe(2);
    expect(nodeB.degreeCentrality).toBeCloseTo(2 / 3, 2);
  });

  it('calculates Brandes betweenness centrality accurately', () => {
    const result = GraphAnalytics.analyze(nodes, edges);
    const nodeA = result.metrics.get('A');
    const nodeB = result.metrics.get('B');
    const nodeC = result.metrics.get('C');

    // In line A-B-C-D:
    // A and D have betweenness = 0 (leaf nodes)
    expect(nodeA.betweennessCentrality).toBe(0);

    // B and C are intermediaries on shortest paths
    expect(nodeB.betweennessCentrality).toBeGreaterThan(0);
    expect(nodeC.betweennessCentrality).toBeGreaterThan(0);
    expect(nodeB.betweennessCentrality).toBeCloseTo(nodeC.betweennessCentrality, 2);
  });

  it('finds shortest paths with BFS and returns path nodes and edge hops', () => {
    const result = GraphAnalytics.findShortestPath('A', 'D', nodes, edges);
    expect(result).toBeDefined();
    expect(result.path).toEqual(['A', 'B', 'C', 'D']);
    expect(result.hops).toBe(3);
    expect(result.edges.length).toBe(3);
  });

  it('returns null when no path exists between disconnected nodes', () => {
    const disconnectedNodes = [...nodes, { id: 'E', name: 'Node E', type: 'Location' }];
    const result = GraphAnalytics.findShortestPath('A', 'E', disconnectedNodes, edges);
    expect(result).toBeNull();
  });

  it('computes explainable Investigative Priority Score (IPS) between 0 and 100', () => {
    const result = GraphAnalytics.analyze(nodes, edges);
    result.topPriorityNodes.forEach(item => {
      expect(item.priorityScore).toBeGreaterThanOrEqual(0);
      expect(item.priorityScore).toBeLessThanOrEqual(100);
      expect(item.explanation).toBeDefined();
    });

    // Central nodes B and C should have higher or equal IPS than leaf node A
    const scoreA = result.metrics.get('A').priorityScore;
    const scoreB = result.metrics.get('B').priorityScore;
    expect(scoreB).toBeGreaterThan(scoreA);
  });
});
