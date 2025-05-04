/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { AppError } from '@core/errors';
import { Integration } from '../types/api';
import { logger } from '@core/utils';
import { ProviderFactory } from './providers/provider-factory';
import { TokenRefreshService } from './token-refresh.service';
import { CloudFolder, ListFoldersOptions, ListFoldersResponse } from './providers/cloud-provider.interface';

export class CloudProviderService {
  private integration: Integration;

  constructor(integration: Integration, tenantId?: string) {
    if (!integration) {
      throw new AppError('Integration is required for cloud operations', 400);
    }

    if (!integration.provider) {
      throw new AppError('Provider is required for cloud operations', 400);
    }

    this.integration = {
      ...integration,
      tenantId: tenantId || integration.tenantId
    };
    
    if (!this.integration.tenantId) {
      throw new AppError('TenantId is required for cloud provider operations', 400);
    }

    // Validate provider early
    ProviderFactory.validateProvider(this.integration.provider.toLowerCase());
  }

  async listFolders(options: ListFoldersOptions): Promise<ListFoldersResponse> {
    if (!this.integration) {
      throw new AppError('Integration is required for cloud operations', 400);
    }
    if (!this.integration.provider) {
      throw new AppError('Provider is required for cloud operations', 400);
    }

    const { parentId, search, pageToken, pageSize } = options;
    const provider = this.integration.provider.toLowerCase();

    try {
      // Validate provider
      ProviderFactory.validateProvider(provider);

      // Log request details
      logger.debug('Listing cloud folders', {
        provider,
        parentId,
        search,
        pageToken,
        pageSize,
        tenantId: this.integration.tenantId
      });

      // Get provider instance
      const cloudProvider = ProviderFactory.createProvider(
        provider,
        this.integration.token
      );

      // List folders using provider
      const result = await cloudProvider.listFolders(options);

      // Log success
      logger.debug('Listed cloud folders successfully', {
        provider,
        parentId,
        search,
        folderCount: result.folders.length,
        hasMore: !!result.nextPageToken,
        tenantId: this.integration.tenantId
      });

      return result;
    } catch (error) {
      // Log error details
      logger.error('Failed to list cloud folders', {
        provider,
        parentId,
        search,
        tenantId: this.integration.tenantId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Check for token validation errors
      if (error instanceof Error && error.message.includes('401')) {
        // Try to refresh token if possible
        try {
          if (!this.integration.tenantId) {
            throw new AppError('TenantId is required for token refresh', 400);
          }
          const refreshedIntegration = await TokenRefreshService.refreshToken(
            this.integration.tenantId,
            provider
          );
          
          // Retry with new token
          const cloudProvider = ProviderFactory.createProvider(
            refreshedIntegration.provider,
            refreshedIntegration.token
          );
          return await cloudProvider.listFolders(options);
        } catch (refreshError) {
          throw new AppError(
            `Authentication failed for ${provider}. Please reconnect your account.`,
            401
          );
        }
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        `Failed to list folders from ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async createFolder(parentId: string, name: string): Promise<CloudFolder> {
    if (!this.integration) {
      throw new AppError('Integration is required for cloud operations', 400);
    }
    if (!this.integration.provider) {
      throw new AppError('Provider is required for cloud operations', 400);
    }

    const provider = this.integration.provider.toLowerCase();

    try {
      // Validate provider
      ProviderFactory.validateProvider(provider);

      logger.debug('Creating folder', {
        provider,
        parentId,
        name,
        tenantId: this.integration.tenantId
      });

      const cloudProvider = ProviderFactory.createProvider(
        provider,
        this.integration.token
      );

      const folder = await cloudProvider.createNewFolder(parentId, name);

      logger.debug('Created folder successfully', {
        provider,
        folderId: folder.id,
        path: folder.path,
        tenantId: this.integration.tenantId
      });

      return folder;
    } catch (error) {
      logger.error('Failed to create folder', {
        provider,
        parentId,
        name,
        tenantId: this.integration.tenantId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        `Failed to create folder in ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async deleteFolder(folderId: string): Promise<void> {
    if (!this.integration) {
      throw new AppError('Integration is required for cloud operations', 400);
    }
    if (!this.integration.provider) {
      throw new AppError('Provider is required for cloud operations', 400);
    }

    const provider = this.integration.provider.toLowerCase();

    try {
      // Validate provider
      ProviderFactory.validateProvider(provider);

      logger.debug('Deleting folder', {
        provider,
        folderId,
        tenantId: this.integration.tenantId
      });

      const cloudProvider = ProviderFactory.createProvider(
        provider,
        this.integration.token
      );

      await cloudProvider.removeFolder(folderId);

      logger.debug('Deleted folder successfully', {
        provider,
        folderId,
        tenantId: this.integration.tenantId
      });
    } catch (error) {
      logger.error('Failed to delete folder', {
        provider,
        folderId,
        tenantId: this.integration.tenantId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        `Failed to delete folder in ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }
}