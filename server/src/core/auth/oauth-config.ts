export type OAuthProvider = 'GDRIVE' | 'DROPBOX' | 'BOX' | 'ONEDRIVE';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scope: string;
}

const configs: Record<OAuthProvider, OAuthConfig> = {
  GDRIVE: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUri: `${process.env.API_BASE_URL}/auth/gdrive/callback`,
    scope: 'https://www.googleapis.com/auth/drive.file'
  },
  DROPBOX: {
    clientId: process.env.DROPBOX_CLIENT_ID || '',
    clientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    redirectUri: `${process.env.API_BASE_URL}/auth/dropbox/callback`,
    scope: ''
  },
  BOX: {
    clientId: process.env.BOX_CLIENT_ID || '',
    clientSecret: process.env.BOX_CLIENT_SECRET || '',
    authUrl: 'https://account.box.com/api/oauth2/authorize',
    tokenUrl: 'https://api.box.com/oauth2/token',
    redirectUri: `${process.env.API_BASE_URL}/auth/box/callback`,
    scope: 'root_readwrite'
  },
  ONEDRIVE: {
    clientId: process.env.ONEDRIVE_CLIENT_ID || '',
    clientSecret: process.env.ONEDRIVE_CLIENT_SECRET || '',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    redirectUri: `${process.env.API_BASE_URL}/auth/onedrive/callback`,
    scope: 'Files.ReadWrite'
  }
};

export function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  const config = configs[provider];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  return config;
}