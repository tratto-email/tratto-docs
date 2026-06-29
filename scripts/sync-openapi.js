#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const specPath = path.resolve(rootDir, 'public', 'openapi.json');

async function syncOpenAPI() {
  try {
    console.log('📥 Fetching OpenAPI spec from api.tratto.email...');

    const response = await fetch('https://api.tratto.email/docs/json');

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }

    const spec = await response.json();

    // Ensure public directory exists
    const publicDir = path.resolve(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write spec to file
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    console.log(`✅ OpenAPI spec synced to ${path.relative(rootDir, specPath)}`);
    console.log(`   Version: ${spec.info?.version || 'unknown'}`);
    console.log(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);

    return spec;
  } catch (error) {
    console.error('❌ Failed to sync OpenAPI spec:', error.message);
    process.exit(1);
  }
}

syncOpenAPI();
