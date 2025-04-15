const { execSync } = require('child_process');

// Set environment
const env = process.env.NODE_ENV || 'development';
console.log(`Deploying to ${env} environment...`);

// Build the application
console.log('Building application...');
execSync('node scripts/build.js', { stdio: 'inherit' });

// Run database migrations (if any)
console.log('Running database migrations...');
// Add migration commands here

// Start the application
console.log('Starting application...');
execSync('NODE_ENV=production node dist/index.js', { stdio: 'inherit' });