import { google } from 'googleapis';
import { CloudProviderInterface, CloudFolder, ListFoldersOptions } from './cloud-provider.interface';
import { logger } from '@core/utils';

export class GoogleDriveProvider implements CloudProviderInterface {
  private drive;

  constructor(accessToken: string) {
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Create Drive client
    this.drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
  }

  async listFolders({ parentId = 'root', search = '' }: ListFoldersOptions): Promise<CloudFolder[]> {
    try {
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
        fields: 'files(id, name, parents)',
        orderBy: 'name',
        pageSize: 100 // Adjust based on needs
      });

      const folders = (response.data.files || []).map(folder => ({
        id: folder.id || '',
        name: folder.name || '',
        path: `/${folder.name || ''}`, // GDrive doesn't have path concept like Dropbox
        hasChildren: true // We'd need another API call to check this
      }));

      logger.debug('Listed Google Drive folders', {
        parentId,
        search,
        count: folders.length
      });

      return folders;
    } catch (error) {
      logger.error('Failed to list Google Drive folders', {
        parentId,
        search,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}