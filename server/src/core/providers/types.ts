import { CloudProviderInterface } from '@features/tenant/services/providers/cloud-provider.interface';

export interface ProviderCapabilities {
  folderListing: boolean;
  folderCreation: boolean;
  folderDeletion: boolean;
  search: boolean;
  thumbnails: boolean;
  sharing: boolean;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: ProviderCapabilities;
  enabled: boolean;
  version: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string[];
}

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  authEndpoint: string;
  tokenEndpoint: string;
  apiEndpoint: string;
  quotaLimits?: {
    requestsPerMinute?: number;
    storageLimit?: number;
  };
  refreshTokens?: boolean;
}

export interface ProviderRegistration {
  metadata: ProviderMetadata;
  config: ProviderConfig;
  factory: new (token: string, config: ProviderConfig, tokenInfo?: TokenInfo) => CloudProviderInterface;
}