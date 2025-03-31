require('dotenv').config();
const axios = require('axios');
const colors = require('colors');

// Configuration
const config = {
  // Will be replaced with the actual review app URL
  baseUrl: process.env.APP_URL || 'https://mwap-review.herokuapp.com',
  timeout: 10000,
  retries: 3,
  retryDelay: 2000
};

// Test cases
const tests = {
  // PWA Tests
  pwa: [
    {
      name: 'PWA Frontend',
      endpoint: '/',
      method: 'GET',
      expectedStatus: 200,
      validate: (res) => res.data.includes('<!DOCTYPE html>')
    }
  ],

  // API Gateway Tests
  api: [
    {
      name: 'API Health Check',
      endpoint: '/health',
      method: 'GET',
      expectedStatus: 200,
      validate: (res) => res.data.status === 'healthy'
    },
    {
      name: 'API Status',
      endpoint: '/api/status',
      method: 'GET',
      expectedStatus: 200,
      validate: (res) => res.data.connectionState !== undefined
    }
  ],

  // Status Service Tests
  status: [
    {
      name: 'MongoDB Connection',
      endpoint: '/api/status',
      method: 'GET',
      expectedStatus: 200,
      validate: (res) => res.data.mongodb?.connected === true
    },
    {
      name: 'Service Health',
      endpoint: '/health',
      method: 'GET',
      expectedStatus: 200,
      validate: (res) => res.data.status === 'healthy'
    }
  ],

  // Security Tests
  security: [
    {
      name: 'Security Headers',
      endpoint: '/',
      method: 'GET',
      expectedStatus: 200,
      validate: (res) => {
        const headers = res.headers;
        return (
          headers['x-frame-options'] &&
          headers['x-content-type-options'] &&
          headers['x-xss-protection']
        );
      }
    },
    {
      name: 'CORS Configuration',
      endpoint: '/api/status',
      method: 'OPTIONS',
      expectedStatus: 204,
      validate: (res) => res.headers['access-control-allow-origin'] === '*'
    }
  ]
};

// Helper function to retry failed requests
async function retryRequest(config, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios(config);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      console.log(`Retrying... (${i + 1}/${retries})`);
    }
  }
}

// Run tests
async function runTests() {
  console.log('\nTesting Deployment at:', config.baseUrl.cyan);
  console.log('='.repeat(50));

  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  for (const [category, categoryTests] of Object.entries(tests)) {
    console.log(`\n📋 Testing ${category.toUpperCase()}...`.yellow);

    for (const test of categoryTests) {
      process.stdout.write(`   ⚡ ${test.name}... `);

      try {
        const response = await retryRequest({
          url: `${config.baseUrl}${test.endpoint}`,
          method: test.method,
          timeout: config.timeout,
          validateStatus: null
        });

        // Check status code
        const statusPassed = response.status === test.expectedStatus;
        
        // Run validation function if provided
        const validationPassed = !test.validate || test.validate(response);

        if (statusPassed && validationPassed) {
          console.log('✅ PASSED'.green);
          results.passed++;
        } else {
          console.log('❌ FAILED'.red);
          results.failed++;
          results.errors.push({
            test: test.name,
            expected: {
              status: test.expectedStatus,
              validation: true
            },
            received: {
              status: response.status,
              validation: validationPassed
            }
          });
        }
      } catch (error) {
        console.log('❌ ERROR'.red);
        results.failed++;
        results.errors.push({
          test: test.name,
          error: error.message
        });
      }
    }
  }

  // Print summary
  console.log('\n='.repeat(50));
  console.log('\nTest Summary:');
  console.log(`✅ Passed: ${results.passed}`.green);
  console.log(`❌ Failed: ${results.failed}`.red);

  if (results.errors.length > 0) {
    console.log('\nErrors:'.red);
    results.errors.forEach(error => {
      console.log(`\n❌ ${error.test}:`.red);
      if (error.error) {
        console.log(`   Error: ${error.error}`);
      } else {
        console.log('   Expected:', error.expected);
        console.log('   Received:', error.received);
      }
    });
  }

  return results.failed === 0;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0]) {
    config.baseUrl = args[0];
  }

  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = runTests;