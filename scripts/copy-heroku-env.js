require('dotenv').config();
const axios = require('axios');

const HEROKU_API_TOKEN = process.env.HEROKU_API_KEY;
const BASE_URL = 'https://api.heroku.com';

const PIPELINE = {
  id: 'c21a748b-52fc-4972-a4ce-f65784fdb57a',
  apps: {
    staging: 'mwap',
    production: 'mwap-production'
  }
};

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.heroku+json; version=3',
  'Authorization': `Bearer ${HEROKU_API_TOKEN}`
};

// Variables that should be different per environment
const ENVIRONMENT_SPECIFIC_VARS = [
  'NODE_ENV',
  'MONGO_URI',
  'MONGO_CLIENT_ENCRYPTION_KEY',
  'MONGO_ENCRYPTION_KEY_NAME',
  'LOG_LEVEL',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET'
];

async function getConfigVars(appName) {
  try {
    const url = `${BASE_URL}/apps/${appName}/config-vars`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error getting config vars for ${appName}:`, error.response?.data || error.message);
    throw error;
  }
}

async function setConfigVars(appName, vars) {
  try {
    const url = `${BASE_URL}/apps/${appName}/config-vars`;
    const response = await axios.patch(url, vars, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error setting config vars for ${appName}:`, error.response?.data || error.message);
    throw error;
  }
}

async function copyConfigVars(sourceApp, targetApp, options = {}) {
  console.log(`\nCopying config vars from ${sourceApp} to ${targetApp}...`);

  try {
    // Get source config vars
    const sourceVars = await getConfigVars(sourceApp);
    
    // Filter out environment-specific variables unless forced
    const varsToSet = {};
    for (const [key, value] of Object.entries(sourceVars)) {
      if (!ENVIRONMENT_SPECIFIC_VARS.includes(key) || options.force) {
        varsToSet[key] = value;
      }
    }

    // Set filtered vars on target app
    await setConfigVars(targetApp, varsToSet);
    
    console.log('✅ Successfully copied config vars');
    console.log('\nCopied variables:');
    Object.keys(varsToSet).forEach(key => console.log(`- ${key}`));
    
    if (!options.force) {
      console.log('\n⚠️ Environment-specific variables were NOT copied:');
      ENVIRONMENT_SPECIFIC_VARS.forEach(key => console.log(`- ${key}`));
      console.log('\nThese should be set manually for each environment');
    }

  } catch (error) {
    console.error('❌ Failed to copy config vars:', error.message);
    process.exit(1);
  }
}

// Function to promote configuration
async function promoteConfig(sourceEnv, targetEnv, options = {}) {
  const sourceApp = PIPELINE.apps[sourceEnv];
  const targetApp = PIPELINE.apps[targetEnv];

  if (!sourceApp || !targetApp) {
    console.error('❌ Invalid environment specified');
    process.exit(1);
  }

  console.log(`\nPromoting configuration from ${sourceEnv} to ${targetEnv}`);
  console.log(`Source: ${sourceApp}`);
  console.log(`Target: ${targetApp}`);

  await copyConfigVars(sourceApp, targetApp, options);
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const sourceEnv = args[0];
  const targetEnv = args[1];
  const force = args.includes('--force');

  if (!sourceEnv || !targetEnv) {
    console.log('\nUsage: node copy-heroku-env.js <source-env> <target-env> [--force]');
    console.log('\nEnvironments: staging, production');
    console.log('\nExample:');
    console.log('  node copy-heroku-env.js staging production');
    console.log('  node copy-heroku-env.js staging production --force');
    process.exit(1);
  }

  promoteConfig(sourceEnv, targetEnv, { force }).catch(console.error);
}