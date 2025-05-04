/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Dropbox } from 'dropbox';
import { CloudFolder, ListFoldersOptions, ListFoldersResponse } from './cloud-provider.interface';
import { BaseCloudProvider } from '@core/providers/base-provider';
import { ProviderCapabilities, ProviderConfig, TokenInfo } from '@core/providers/types';
import { logger } from '@core/utils';
import { AppError } from '@core/errors';

export class DropboxProvider extends BaseCloudProvider {
  private client: Dropbox;

  constructor(token: string, config: ProviderConfig, tokenInfo?: TokenInfo) {
    super(token, config, tokenInfo);
    this.client = new Dropbox({ 
      accessToken: token,
      refreshToken: tokenInfo?.refreshToken,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    });
  }

  protected async refreshAccessToken(): Promise<TokenInfo> {
    if (!this.tokenInfo?.refreshToken) {
      throw new AppError('No refresh token available', 401);
    }

    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokenInfo.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })
    });

    if (!response.ok) {
      throw new AppError('Failed to refresh token', 401);
    }

    const data = await response.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
      scope?: string;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.tokenInfo?.refreshToken,
      expiresAt: new Date(Date.now() + (data.expires_in * 1000)),
      tokenType: data.token_type,
      scope: data.scope?.split(' ')
    };
  }

  get capabilities(): ProviderCapabilities {
    return {
      folderListing: true,
      folderCreation: true,
      folderDeletion: true,
      search: true,
      thumbnails: true,
      sharing: true
    };
  }

  async validateToken(): Promise<boolean> {
    try {
      // Try to get current account info as a validation
      await this.client.usersGetCurrentAccount();
      return true;
    } catch (error) {
      logger.error('Failed to validate Dropbox token', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async listFolders({ 
    parentId = '', 
    search = '',
    pageSize = 100
  }: ListFoldersOptions): Promise<ListFoldersResponse> {
    await this.validateCapability('folderListing', 'listFolders');
    const path = parentId || '';
    
    // List folder contents
    const result = await this.client.filesListFolder({
      path,
      recursive: false,
      include_mounted_folders: true,
      include_non_downloadable_files: false,
      limit: pageSize
    });

    // Filter and transform entries
    const folders = result.result.entries
      .filter(entry => entry['.tag'] === 'folder')
      .filter(folder => !search || folder.name.toLowerCase().includes(search.toLowerCase()))
      .map(folder => ({
        id: folder.id,
        name: folder.name,
        path: folder.path_display || '',
        hasChildren: true
      }));

    return {
      folders,
      nextPageToken: result.result.has_more ? result.result.cursor : undefined
    };
  }

  protected async resolvePath(folderId: string): Promise<string> {
    // Dropbox already provides full paths
    const metadata = await this.client.filesGetMetadata({
      path: folderId
    });
    return metadata.result.path_display || '';
  }

  async createNewFolder(parentId: string, name: string): Promise<CloudFolder> {
    await this.validateCapability('folderCreation', 'createNewFolder');
    const path = `${parentId}/${name}`.replace('//', '/');
    
    const result = await this.client.filesCreateFolderV2({
      path,
      autorename: false
    });

    return {
      id: result.result.metadata.id,
      name: result.result.metadata.name,
      path: result.result.metadata.path_display || '',
      hasChildren: false
    };
  }

  async removeFolder(folderId: string): Promise<void> {
    await this.validateCapability('folderDeletion', 'removeFolder');
    await this.client.filesDeleteV2({
      path: folderId
    });
  }
}