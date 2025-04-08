#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
  /(^|\s)(api|client|secret|key|password|token|auth0|mongodb|mongo).*=.*[a-zA-Z0-9+/]{20,}/i,
  /mongodb(\+srv)?:\/\/[^"'\s]+/i,
  /https?:\/\/[^"'\s]*auth0\.com/i,
  /[a-zA-Z0-9+/]{40,}/
];

function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return true;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let hasIssues = false;

  lines.forEach((line, index) => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        console.error(`[ERROR] Potential secret found in ${filePath}:${index + 1}`);
        console.error(`  ${line.trim()}`);
        hasIssues = true;
      }
    });
  });

  return !hasIssues;
}

function validateDirectory(dir) {
  const envFiles = [
    path.join(dir, '.env'),
    path.join(dir, '.env.local'),
    path.join(dir, '.env.development'),
    path.join(dir, '.env.production'),
    path.join(dir, '.env.test'),
  ];

  let allValid = true;

  envFiles.forEach(file => {
    if (!validateFile(file)) {
      allValid = false;
    }
  });

  return allValid;
}

// Validate root, client, and server directories
const rootValid = validateDirectory('.');
const clientValid = validateDirectory('./client');
const serverValid = validateDirectory('./server');

if (!rootValid || !clientValid || !serverValid) {
  console.error('\n[ERROR] Validation failed. Please remove any secrets from environment files.');
  process.exit(1);
}

console.log('[SUCCESS] No secrets found in environment files.');