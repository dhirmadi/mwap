import { google } from 'googleapis';
import { CloudFolder, ListFoldersOptions, ListFoldersResponse } from './cloud-provider.interface';
import { BaseCloudProvider } from './base.provider';
import { logger } from '@core/utils';

export class GoogleDriveProvider extends BaseCloudProvider {
  private drive;

  constructor(accessToken: string) {
    super();
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Create Drive client
    this.drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
  }

  protected async doListFolders({ 
    parentId = 'root', 
    search = '', 
    pageToken,
    pageSize = 100 
  }: ListFoldersOptions): Promise<ListFoldersResponse> {
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

  protected async createFolder(parentId: string, name: string): Promise<CloudFolder> {
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

  protected async deleteFolder(folderId: string): Promise<void> {
    await this.drive.files.delete({
      fileId: folderId
    });
  }
}