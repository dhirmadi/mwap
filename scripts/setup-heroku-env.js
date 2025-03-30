require('dotenv').config();
const axios = require('axios');

// Heroku API configuration
const HEROKU_API_TOKEN = process.env.HEROKU_API_KEY;
const BASE_URL = 'https://api.heroku.com';

// Apps in the pipeline
const APPS = {
  review: 'mwap-review', // This is a template, actual review apps are dynamic
  staging: 'mwap',
  production: 'mwap-production'
};

// Headers for Heroku API
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.heroku+json; version=3',
  'Authorization': `Bearer ${HEROKU_API_TOKEN}`
};

// Environment variables to set (excluding sensitive data)
const getEnvVars = (environment) => {
  const commonVars = {
    NODE_ENV: environment,
    LOG_LEVEL: environment === 'production' ? 'info' : 'debug',
    STATUS_CHECK_INTERVAL: environment === 'production' ? '60000' : '30000',
  };

  switch(environment) {
    case 'review':
      return {
        ...commonVars,
        MONGO_ENCRYPTION_KEY_NAME: 'mwap_data_key_review_${HEROKU_PR_NUMBER}',
        // Note: MONGO_URI and other sensitive vars should be set manually
      };
    case 'staging':
      return {
        ...commonVars,
        MONGO_ENCRYPTION_KEY_NAME: 'mwap_data_key_staging',
      };
    case 'production':
      return {
        ...commonVars,
        MONGO_ENCRYPTION_KEY_NAME: 'mwap_data_key_production',
      };
    default:
      return commonVars;
  }
};

// Function to set config vars for an app
async function setConfigVars(appName, environment) {
  try {
    console.log(`Setting config vars for ${appName} (${environment})...`);
    
    const configVars = getEnvVars(environment);
    const url = `${BASE_URL}/apps/${appName}/config-vars`;
    
    const response = await axios.patch(url, configVars, { headers });
    
    console.log(`✅ Successfully updated config vars for ${appName}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error setting config vars for ${appName}:`, error.response?.data || error.message);
    throw error;
  }
}

// Function to get current config vars
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

// Main function to set up all environments
async function setupEnvironments() {
  console.log('\nStarting Heroku environment setup...\n');

  try {
    // Set up staging environment
    console.log('Setting up staging environment...');
    await setConfigVars(APPS.staging, 'staging');

    // Set up production environment
    console.log('\nSetting up production environment...');
    await setConfigVars(APPS.production, 'production');

    // Set up pipeline config for review apps
    console.log('\nSetting up review apps configuration...');
    // Note: Review apps inherit config vars from parent app (staging)
    
    console.log('\n✅ Environment setup completed successfully!');
    
    console.log('\n⚠️ Remember to manually set these sensitive variables for each environment:');
    console.log('- MONGO_URI');
    console.log('- MONGO_CLIENT_ENCRYPTION_KEY');
    console.log('- AUTH0_DOMAIN');
    console.log('- AUTH0_AUDIENCE');
    console.log('- AUTH0_CLIENT_ID');
    console.log('- AUTH0_CLIENT_SECRET');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup if this script is run directly
if (require.main === module) {
  if (!HEROKU_API_TOKEN) {
    console.error('❌ HEROKU_API_KEY environment variable is required');
    process.exit(1);
  }

  setupEnvironments().catch(console.error);
}