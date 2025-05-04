/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { CloudFolder, ListFoldersOptions, ListFoldersResponse, CloudProviderInterface } from './cloud-provider.interface';
import { logger } from '@core/utils';
import { Cache } from '@core/utils/cache';

export abstract class BaseCloudProvider implements CloudProviderInterface {
  protected cache: Cache;

  constructor() {
    this.cache = new Cache();
  }

  protected abstract doListFolders(options: ListFoldersOptions): Promise<ListFoldersResponse>;
  protected abstract resolvePath(folderId: string): Promise<string>;
  protected abstract createFolder(parentId: string, name: string): Promise<CloudFolder>;
  protected abstract deleteFolder(folderId: string): Promise<void>;

  async listFolders(options: ListFoldersOptions): Promise<ListFoldersResponse> {
    const cacheKey = `folders:${JSON.stringify(options)}`;
    
    try {
      // Try cache first
      const cached = this.cache.get<ListFoldersResponse>(cacheKey);
      if (cached) {
        logger.debug('Retrieved folders from cache', { options });
        return cached;
      }

      // Get folders from provider
      const result = await this.doListFolders(options);
      
      // Resolve paths in parallel
      const foldersWithPaths = await Promise.all(
        result.folders.map(async folder => ({
          ...folder,
          path: await this.resolvePath(folder.id)
        }))
      );

      const response = {
        folders: foldersWithPaths,
        nextPageToken: result.nextPageToken
      };

      // Cache results
      this.cache.set(cacheKey, response, 300); // 5 minutes TTL
      
      return response;
    } catch (error) {
      logger.error('Failed to list folders', {
        options,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async createNewFolder(parentId: string, name: string): Promise<CloudFolder> {
    try {
      const folder = await this.createFolder(parentId, name);
      
      // Invalidate cache for parent folder
      this.cache.delete(`folders:${JSON.stringify({ parentId })}`);
      
      return folder;
    } catch (error) {
      logger.error('Failed to create folder', {
        parentId,
        name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async removeFolder(folderId: string): Promise<void> {
    try {
      await this.deleteFolder(folderId);
      
      // Invalidate all cache since we don't know parent
      this.cache.clear();
    } catch (error) {
      logger.error('Failed to delete folder', {
        folderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}