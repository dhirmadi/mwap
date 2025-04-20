import { google } from 'googleapis';
import { CloudFolder, ListFoldersOptions, ListFoldersResponse } from './cloud-provider.interface';
import { BaseCloudProvider } from '@core/providers/base-provider';
import { ProviderCapabilities, ProviderConfig } from '@core/providers/types';
import { logger } from '@core/utils';
import { AppError } from '@core/errors';

export class GoogleDriveProvider extends BaseCloudProvider {
  private drive;

  constructor(token: string, config: ProviderConfig) {
    super(token, config);
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret
    );
    oauth2Client.setCredentials({ access_token: token });

    // Create Drive client
    this.drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
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

  async listFolders({ 
    parentId = 'root', 
    search = '', 
    pageToken,
    pageSize = 100 
  }: ListFoldersOptions): Promise<ListFoldersResponse> {
    await this.validateCapability('folderListing', 'listFolders');
    // Build query
    let query = "mimeType = 'application/vnd.google-apps.folder'";
    
    // Add parent folder filter
    if (parentId !== 'root') {
      query += ` and '${parentId}' in parents`;
    }
    
    // Add search term if provided
    if (search) {
      query += ` and name contains '${search}'`;
    }

    // List folders
    const response = await this.drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, parents)',
      orderBy: 'name',
      pageSize,
      pageToken
    });

    const folders = (response.data.files || []).map(folder => ({
      id: folder.id || '',
      name: folder.name || '',
      path: '', // Will be resolved by base class
      hasChildren: true // We'll check this in a batch operation
    }));

    return {
      folders,
      nextPageToken: response.data.nextPageToken
    };
  }

  protected async resolvePath(folderId: string): Promise<string> {
    const pathParts: string[] = [];
    let currentId = folderId;

    while (currentId && currentId !== 'root') {
      const response = await this.drive.files.get({
        fileId: currentId,
        fields: 'name, parents'
      });

      if (!response.data.name) break;
      
      pathParts.unshift(response.data.name);
      currentId = response.data.parents?.[0] || '';
    }

    return '/' + pathParts.join('/');
  }

  async createNewFolder(parentId: string, name: string): Promise<CloudFolder> {
    await this.validateCapability('folderCreation', 'createNewFolder');
    const response = await this.drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      },
      fields: 'id, name'
    });

    return {
      id: response.data.id || '',
      name: response.data.name || '',
      path: await this.resolvePath(response.data.id || ''),
      hasChildren: false
    };
  }

  async removeFolder(folderId: string): Promise<void> {
    await this.validateCapability('folderDeletion', 'removeFolder');
    await this.drive.files.delete({
      fileId: folderId
    });
  }
}