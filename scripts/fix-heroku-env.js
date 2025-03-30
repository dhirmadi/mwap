require('dotenv').config();
const axios = require('axios');

const HEROKU_API_TOKEN = process.env.HEROKU_API_KEY;
const BASE_URL = 'https://api.heroku.com';

const APPS = {
  staging: 'mwap',
  production: 'mwap-production'
};

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.heroku+json; version=3',
  'Authorization': `Bearer ${HEROKU_API_TOKEN}`
};

// Default configurations for each environment
const DEFAULT_CONFIGS = {
  staging: {
    NODE_ENV: 'staging',
    LOG_LEVEL: 'debug',
    STATUS_CHECK_INTERVAL: '30000',
    AUTH0_DOMAIN: 'dev-mwap.us.auth0.com',
    AUTH0_AUDIENCE: 'https://api.mwap.com',
    AUTH0_CLIENT_ID: 'default_client_id',
    AUTH0_CLIENT_SECRET: 'default_client_secret',
    MONGO_ENCRYPTION_KEY_NAME: 'mwap_data_key_staging'
  },
  production: {
    NODE_ENV: 'production',
    LOG_LEVEL: 'info',
    STATUS_CHECK_INTERVAL: '60000',
    AUTH0_DOMAIN: 'dev-mwap.us.auth0.com',
    AUTH0_AUDIENCE: 'https://api.mwap.com',
    AUTH0_CLIENT_ID: 'default_client_id',
    AUTH0_CLIENT_SECRET: 'default_client_secret',
    MONGO_ENCRYPTION_KEY_NAME: 'mwap_data_key_production'
  }
};

// Get current config vars
async function getConfigVars(appName) {
  try {
    const url = `${BASE_URL}/apps/${appName}/config-vars`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // App doesn't exist
    }
    throw error;
  }
}

// Set config vars
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

// Fix missing configurations
async function fixConfigurations(environment, options = {}) {
  const appName = APPS[environment];
  const defaultConfig = DEFAULT_CONFIGS[environment];
  
  console.log(`\nFixing configuration for ${environment} environment (${appName})...`);

  try {
    // Get current configuration
    const currentConfig = await getConfigVars(appName);
    
    if (!currentConfig) {
      console.log(`❌ App ${appName} not found. Please create it first.`);
      return;
    }

    // Identify missing or incorrect configurations
    const updates = {};
    let changesMade = false;

    for (const [key, defaultValue] of Object.entries(defaultConfig)) {
      if (!currentConfig[key] || options.force) {
        updates[key] = defaultValue;
        changesMade = true;
      }
    }

    // Fix NODE_ENV if it doesn't match the environment
    if (currentConfig.NODE_ENV !== environment) {
      updates.NODE_ENV = environment;
      changesMade = true;
    }

    if (!changesMade) {
      console.log('✅ No configuration fixes needed');
      return;
    }

    // Show proposed changes
    console.log('\nProposed changes:');
    Object.entries(updates).forEach(([key, value]) => {
      const displayValue = key.includes('SECRET') ? '********' : value;
      console.log(`  ${key}: ${displayValue}`);
    });

    if (!options.autoApprove) {
      console.log('\n⚠️ These are default values. Update them with real values in the Heroku dashboard.');
      console.log('Especially update these security-sensitive values:');
      console.log('- AUTH0_CLIENT_ID');
      console.log('- AUTH0_CLIENT_SECRET');
    }

    // Apply changes
    if (options.dryRun) {
      console.log('\n🔍 Dry run - no changes made');
    } else {
      await setConfigVars(appName, updates);
      console.log('\n✅ Configuration updated successfully');
    }

  } catch (error) {
    console.error(`\n❌ Error fixing configuration: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0];
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    autoApprove: args.includes('--yes')
  };

  if (!environment || !APPS[environment]) {
    console.log('\nUsage: node fix-heroku-env.js <environment> [options]');
    console.log('\nEnvironments:');
    console.log('  staging');
    console.log('  production');
    console.log('\nOptions:');
    console.log('  --dry-run    Show changes without applying them');
    console.log('  --force      Override existing values');
    console.log('  --yes        Auto-approve changes');
    console.log('\nExamples:');
    console.log('  node fix-heroku-env.js staging --dry-run');
    console.log('  node fix-heroku-env.js production --force');
    process.exit(1);
  }

  try {
    await fixConfigurations(environment, options);
  } catch (error) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}