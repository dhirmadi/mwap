import { AppError } from '@core/errors';
import { logger } from '@core/utils';
import { Integration, IntegrationProvider } from '../types/api';
import { IntegrationDocument } from '../types/mongoose';
import { TenantModel } from '../schemas';
import { DropboxProvider } from './providers/dropbox.provider';
import { providerConfigs } from '@core/providers/config';

interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export class TokenRefreshService {
  static async refreshDropboxToken(integration: Integration): Promise<TokenRefreshResult> {
    if (!integration.refreshToken) {
      throw new AppError('No refresh token available', 401);
    }

    try {
      // First validate the current token
      const provider = new DropboxProvider(integration.token, providerConfigs.find(p => p.metadata.id === integration.provider)?.config || {
        clientId: '',
        clientSecret: '',
        scopes: [],
        authEndpoint: '',
        tokenEndpoint: '',
        apiEndpoint: ''
      });
      const isValid = await provider.validateToken();
      
      if (isValid) {
        return {
          accessToken: integration.token,
          refreshToken: integration.refreshToken,
          expiresAt: integration.expiresAt
        };
      }

      // Token is invalid, try to refresh
      const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: integration.refreshToken,
          client_id: process.env.DROPBOX_CLIENT_ID || '',
          client_secret: process.env.DROPBOX_CLIENT_SECRET || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json() as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };
      
      if (!data.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      };
    } catch (error) {
      logger.error('Failed to refresh Dropbox token', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError('Failed to refresh access token', 401);
    }
  }

  static async refreshToken(tenantId: string, provider: string): Promise<Integration> {
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    const integrationDoc = tenant.integrations.find(i => i.provider === provider) as IntegrationDocument;
    if (!integrationDoc) {
      throw new AppError(`Integration with provider ${provider} not found`, 404);
    }

    // Convert to Integration type
    const integration: Integration = {
      provider: integrationDoc.provider as IntegrationProvider,
      token: integrationDoc.token,
      refreshToken: integrationDoc.refreshToken,
      expiresAt: integrationDoc.expiresAt,
      connectedAt: integrationDoc.connectedAt,
      lastRefreshedAt: integrationDoc.lastRefreshedAt,
      tenantId
    };

    // Check if token needs refresh
    if (integration.expiresAt && integration.expiresAt > new Date()) {
      return integration;
    }

    try {
      let result: TokenRefreshResult;

      switch (provider) {
        case 'dropbox':
          result = await this.refreshDropboxToken(integration);
          break;
        // Add other providers here
        default:
          throw new AppError(`Unsupported provider: ${provider}`, 400);
      }

      // Update integration document with new tokens
      integrationDoc.token = result.accessToken;
      if (result.refreshToken) {
        integrationDoc.refreshToken = result.refreshToken;
      }
      if (result.expiresAt) {
        integrationDoc.expiresAt = result.expiresAt;
      }
      integrationDoc.lastRefreshedAt = new Date();

      await tenant.save();
      
      logger.info('Successfully refreshed token', {
        tenantId,
        provider,
        expiresAt: result.expiresAt,
      });

      return integration;
    } catch (error) {
      logger.error('Failed to refresh token', {
        tenantId,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}