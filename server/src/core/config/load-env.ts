import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

export function loadEnv(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
  const defaultEnvPath = path.resolve(process.cwd(), '.env');

  // Load environment-specific file if it exists
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  // Load default .env file if it exists (for overrides)
  if (fs.existsSync(defaultEnvPath)) {
    dotenv.config({ path: defaultEnvPath });
  }

  // Validate required environment variables
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'HOST',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing required environment variables: ${missingVars.join(', ')}`);
  }
}