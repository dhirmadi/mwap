const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure required directories exist
const dirs = [
  'dist',
  'src/core/middleware',
  'src/core/config',
  'src/core/types',
  'src/features/tenant/controllers',
  'src/features/tenant/routes',
  'src/features/tenant/types',
  'src/features/projects/controllers',
  'src/features/projects/routes',
  'src/features/projects/types',
  'src/features/invites/controllers',
  'src/features/invites/routes',
  'src/features/invites/types',
  'src/features/superadmin/controllers',
  'src/features/superadmin/routes',
  'src/features/superadmin/types',
  'src/utils',
  'src/routes'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Clean dist directory
console.log('Cleaning dist directory...');
execSync('rm -rf dist', { stdio: 'inherit' });

// Run TypeScript compiler
console.log('Building TypeScript...');
execSync('tsc -p tsconfig.prod.json', { stdio: 'inherit' });

console.log('Build completed successfully!');