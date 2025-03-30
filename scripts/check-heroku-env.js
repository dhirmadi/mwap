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

// Required variables for each environment
const requiredVars = {
  common: [
    'NODE_ENV',
    'MONGO_URI',
    'MONGO_CLIENT_ENCRYPTION_KEY',
    'MONGO_ENCRYPTION_KEY_NAME',
    'AUTH0_DOMAIN',
    'AUTH0_AUDIENCE',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'LOG_LEVEL',
    'STATUS_CHECK_INTERVAL'
  ]
};

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

function checkRequiredVars(configVars, required) {
  const missing = [];
  const set = [];

  required.forEach(varName => {
    if (configVars[varName]) {
      set.push(varName);
    } else {
      missing.push(varName);
    }
  });

  return { missing, set };
}

async function checkEnvironments() {
  console.log('\nChecking Heroku environments configuration...\n');

  try {
    // Check each environment
    for (const [env, appName] of Object.entries(PIPELINE.apps)) {
      console.log(`Checking ${env} environment (${appName})...`);
      
      const configVars = await getConfigVars(appName);
      const { missing, set } = checkRequiredVars(configVars, requiredVars.common);

      console.log('\nConfiguration status:');
      
      // Show set variables with partial values
      console.log('\n✅ Set variables:');
      set.forEach(varName => {
        const value = configVars[varName];
        let displayValue = '';
        
        // Show partial values for non-sensitive data
        if (varName === 'NODE_ENV' || varName === 'LOG_LEVEL') {
          displayValue = ` = ${value}`;
        } else if (value.length > 20) {
          displayValue = ` = ${value.substring(0, 10)}...${value.substring(value.length - 5)}`;
        } else {
          displayValue = ' = <hidden>';
        }
        
        console.log(`  - ${varName}${displayValue}`);
      });

      if (missing.length > 0) {
        console.log('\n❌ Missing required variables:');
        missing.forEach(varName => console.log(`  - ${varName}`));
      }

      // Show environment-specific info
      console.log('\nEnvironment-specific settings:');
      console.log(`  Database: ${configVars.MONGO_ENCRYPTION_KEY_NAME || 'not set'}`);
      console.log(`  Environment: ${configVars.NODE_ENV || 'not set'}`);
      console.log(`  Log Level: ${configVars.LOG_LEVEL || 'not set'}`);

      console.log('\n-------------------\n');
    }

  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

// Run the check if this script is run directly
if (require.main === module) {
  if (!HEROKU_API_TOKEN) {
    console.error('❌ HEROKU_API_KEY environment variable is required');
    process.exit(1);
  }

  checkEnvironments().catch(console.error);
}