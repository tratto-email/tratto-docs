#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const specPath = path.resolve(rootDir, 'public', 'openapi.json');
const templatePath = path.resolve(rootDir, 'public', 'openapi-template.json');

// URLs to try in order of preference
const apiUrls = [
  // Staging first (development/testing)
  'https://api-staging.tratto.email/docs/json',
  // Production (once available)
  'https://api.tratto.email/docs/json',
];

// Allow custom URL via environment variable
if (process.env.TRATTO_OPENAPI_URL) {
  apiUrls.unshift(process.env.TRATTO_OPENAPI_URL);
  console.log(`📌 Using custom OpenAPI URL: ${process.env.TRATTO_OPENAPI_URL}`);
}

async function fetchFromUrl(url) {
  try {
    console.log(`   Trying: ${url}`);
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        // Add authorization if token is provided
        ...(process.env.TRATTO_API_TOKEN && {
          Authorization: `Bearer ${process.env.TRATTO_API_TOKEN}`,
        }),
      },
    });

    if (response.ok) {
      const spec = await response.json();
      console.log(`   ✅ Success!`);
      return spec;
    } else {
      console.log(`   ❌ ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function syncOpenAPI() {
  try {
    // Ensure public directory exists
    const publicDir = path.resolve(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    console.log('📥 Syncing OpenAPI specification...\n');

    // Try each API URL
    for (const url of apiUrls) {
      const spec = await fetchFromUrl(url);
      if (spec) {
        fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

        console.log(`\n✅ OpenAPI spec synced successfully!`);
        console.log(`   Source: ${url}`);
        console.log(`   Version: ${spec.info?.version || 'unknown'}`);
        console.log(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);
        console.log(`   Location: ${path.relative(rootDir, specPath)}`);
        return spec;
      }
    }

    console.log(
      '\n⚠️  Could not fetch from any API endpoint. Checking for local spec...\n'
    );

    // Fallback: check if spec exists locally
    if (fs.existsSync(specPath)) {
      console.log(`✅ Using existing OpenAPI spec from ${path.relative(rootDir, specPath)}`);
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
      console.log(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);
      return spec;
    }

    // Fallback: use template
    console.log(
      `⚠️  No local spec found. Using development template for now.\n`
    );
    console.log(`To sync the real spec, you can:`);
    console.log(`  1. Ensure api-staging.tratto.email is accessible`);
    console.log(`  2. Set TRATTO_OPENAPI_URL env var to a custom endpoint`);
    console.log(`  3. Set TRATTO_API_TOKEN if the API requires authentication`);
    console.log(`  4. Or manually place openapi.json in the public/ directory\n`);

    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(specPath, template);
      console.log(`Using: ${path.relative(rootDir, specPath)}`);
      return JSON.parse(template);
    }

    throw new Error('No OpenAPI spec available (template not found)');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

await syncOpenAPI();
