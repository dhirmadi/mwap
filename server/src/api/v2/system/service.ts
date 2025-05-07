import mongoose from 'mongoose';

export interface SystemStatus {
  db: 'connected' | 'disconnected';
  uptime: number;
}

export interface SystemVersion {
  version: string;
  build: string;
  environment: string;
}

export interface SystemFeatures {
  auth: {
    mfa: boolean;
    sso: boolean;
  };
  storage: {
    providers: string[];
    encryption: boolean;
  };
  projects: {
    sharing: boolean;
    templates: boolean;
  };
}

export class SystemService {
  static getSystemStatus(): SystemStatus {
    return {
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime()
    };
  }

  static getSystemVersion(): SystemVersion {
    return {
      version: process.env.VERSION || '0.0.0',
      build: process.env.BUILD_ID || 'development',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  static getSystemFeatures(): SystemFeatures {
    // Hardcoded feature flags for now
    // TODO: Replace with dynamic configuration
    return {
      auth: {
        mfa: true,
        sso: false
      },
      storage: {
        providers: ['dropbox', 'gdrive', 'onedrive'],
        encryption: true
      },
      projects: {
        sharing: true,
        templates: false
      }
    };
  }
}