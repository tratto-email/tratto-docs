#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const specPath = path.resolve(rootDir, 'public', 'openapi.json');
const templatePath = path.resolve(rootDir, 'public', 'openapi-template.json');

async function syncOpenAPI() {
  try {
    // Ensure public directory exists
    const publicDir = path.resolve(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Try to fetch from API first
    console.log('📥 Attempting to fetch OpenAPI spec from api.tratto.email...');

    try {
      const response = await fetch('https://api.tratto.email/docs/json', {
        timeout: 10000,
      });

      if (response.ok) {
        const spec = await response.json();
        fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

        console.log(`✅ OpenAPI spec synced from API`);
        console.log(`   Version: ${spec.info?.version || 'unknown'}`);
        console.log(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);
        return spec;
      }
    } catch (fetchError) {
      console.warn(`⚠️  API unreachable: ${fetchError.message}`);
    }

    // Fallback: check if spec exists locally
    if (fs.existsSync(specPath)) {
      console.log(`✅ Using existing OpenAPI spec from ${path.relative(rootDir, specPath)}`);
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
      console.log(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);
      return spec;
    }

    // Fallback: use template
    console.log(`⚠️  API unreachable and no local spec found. Using template.`);
    console.log(`   To sync the real spec, either:`);
    console.log(`   1. Ensure api.tratto.email/docs/json is accessible`);
    console.log(`   2. Or manually place openapi.json in the public/ directory`);

    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(specPath, template);
      console.log(`   Using template: ${path.relative(rootDir, specPath)}`);
      return JSON.parse(template);
    }

    throw new Error('No OpenAPI spec available (template not found)');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

await syncOpenAPI();
