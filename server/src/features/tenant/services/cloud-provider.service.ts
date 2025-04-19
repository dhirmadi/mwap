import { AppError } from '@core/errors';
import { Integration } from '../schemas/tenant.schema';
import { logger } from '@core/utils';
import { ProviderFactory } from './providers/provider-factory';
import { TokenRefreshService } from './token-refresh.service';
import { CloudFolder, ListFoldersOptions, ListFoldersResponse } from './providers/cloud-provider.interface';

export class CloudProviderService {
  private integration: Integration;

  constructor(integration: Integration, tenantId: string) {
    this.integration = {
      ...integration,
      tenantId
    };
  }

  async listFolders(options: ListFoldersOptions): Promise<ListFoldersResponse> {
    const { parentId, search, pageToken, pageSize } = options;
    const provider = this.integration.provider.toLowerCase();

    try {
      // Log request details
      logger.debug('Listing cloud folders', {
        provider,
        parentId,
        search,
        pageToken,
        pageSize
      });

      // Get provider instance
      const cloudProvider = ProviderFactory.createProvider(
        this.integration.provider,
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
        hasMore: !!result.nextPageToken
      });

      return result;
    } catch (error) {
      // Log error details
      logger.error('Failed to list cloud folders', {
        provider,
        parentId,
        search,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Check for token validation errors
      if (error instanceof Error && error.message.includes('401')) {
        // Try to refresh token if possible
        try {
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

      throw new AppError(
        `Failed to list folders from ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async createFolder(parentId: string, name: string): Promise<CloudFolder> {
    const provider = this.integration.provider.toLowerCase();

    try {
      logger.debug('Creating folder', {
        provider,
        parentId,
        name
      });

      const cloudProvider = ProviderFactory.createProvider(
        this.integration.provider,
        this.integration.token
      );

      const folder = await cloudProvider.createNewFolder(parentId, name);

      logger.debug('Created folder successfully', {
        provider,
        folderId: folder.id,
        path: folder.path
      });

      return folder;
    } catch (error) {
      logger.error('Failed to create folder', {
        provider,
        parentId,
        name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new AppError(
        `Failed to create folder in ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async deleteFolder(folderId: string): Promise<void> {
    const provider = this.integration.provider.toLowerCase();

    try {
      logger.debug('Deleting folder', {
        provider,
        folderId
      });

      const cloudProvider = ProviderFactory.createProvider(
        this.integration.provider,
        this.integration.token
      );

      await cloudProvider.removeFolder(folderId);

      logger.debug('Deleted folder successfully', {
        provider,
        folderId
      });
    } catch (error) {
      logger.error('Failed to delete folder', {
        provider,
        folderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new AppError(
        `Failed to delete folder in ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }
}