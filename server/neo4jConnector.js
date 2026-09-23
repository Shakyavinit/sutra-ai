/**
 * SUTRA - Smart Unified Threat Relationship Analytics
 * Neo4j Graph Database Connector Service
 */

import neo4j from 'neo4j-driver';

let driver = null;

export function initNeo4j() {
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const user = process.env.NEO4J_USERNAME || 'neo4j';
  const password = process.env.NEO4J_PASSWORD || 'sutra_secure_pass';

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionLifetime: 3 * 60 * 60 * 1000,
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 2000
    });
    console.log(`[SUTRA] Neo4j Driver connected to ${uri}`);
    return driver;
  } catch (error) {
    console.warn(`[SUTRA] Neo4j connection not available. Operating in fallback mock/JSON mode: ${error.message}`);
    return null;
  }
}

export async function runCypher(query, params = {}) {
  if (!driver) {
    throw new Error('Neo4j Driver is not initialized. Ensure NEO4J_URI is reachable.');
  }
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    const result = await session.run(query, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export async function closeNeo4j() {
  if (driver) {
    await driver.close();
    console.log('[SUTRA] Neo4j Driver closed gracefully.');
  }
}
