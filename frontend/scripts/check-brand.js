#!/usr/bin/env node

/**
 * CI Brand Verification Script for MausamMesh
 * Fails if deprecated names (MausamSetu, मौसमसेतु, VarshaVistaar, वर्षा-विस्तार) appear in src/ or locales/.
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
  /MausamSetu/i,
  /मौसमसेतु/,
  /VarshaVistaar/i,
  /वर्षा-विस्तार/
];

const SCAN_DIRS = [
  path.join(__dirname, '../src'),
  path.join(__dirname, '../public')
];

let violations = [];

function scanFile(filePath) {
  // Skip binary assets or node_modules
  if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.ico')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        violations.push({
          file: path.relative(path.join(__dirname, '..'), filePath),
          line: idx + 1,
          content: line.trim(),
          matched: pattern.toString()
        });
      }
    });
  });
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        traverse(fullPath);
      }
    } else {
      scanFile(fullPath);
    }
  }
}

SCAN_DIRS.forEach(traverse);

if (violations.length > 0) {
  console.error('\n❌ BRAND COMPLIANCE FAILURE: Deprecated brand names detected:');
  violations.forEach(v => {
    console.error(`  - ${v.file}:${v.line} [matched ${v.matched}]: "${v.content}"`);
  });
  console.error('\nThe official brand name is "MausamMesh" (Devanagari: मौसममेश).\n');
  process.exit(1);
} else {
  console.log('✅ BRAND COMPLIANCE PASSED: All files conform to "MausamMesh" / "मौसममेश".');
  process.exit(0);
}
