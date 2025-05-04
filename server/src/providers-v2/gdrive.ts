import { google } from 'googleapis';
import { AppError } from '../core-v2/errors';
import type { StorageProviderClient } from './types';

export class GDriveClient implements StorageProviderClient {
  async validateFolder(folderId: string, token: string): Promise<boolean> {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: token });
      const drive = google.drive({ version: 'v3', auth });

      const response = await drive.files.get({
        fileId: folderId,
        fields: 'mimeType',
      });

      return response.data.mimeType === 'application/vnd.google-apps.folder';
    } catch (error) {
      if (error.code === 401) {
        throw AppError.unauthorized('Invalid Google Drive token');
      }
      if (error.code === 404) {
        throw AppError.notFound('Google Drive folder not found');
      }
      throw AppError.internal('Failed to validate Google Drive folder');
    }
  }

  async getFolderDetails(folderId: string, token: string) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: token });
      const drive = google.drive({ version: 'v3', auth });

      const response = await drive.files.get({
        fileId: folderId,
        fields: 'name,mimeType,size,id',
      });

      if (response.data.mimeType !== 'application/vnd.google-apps.folder') {
        throw AppError.badRequest('Path is not a folder');
      }

      return {
        name: response.data.name || '',
        path: `/folders/${response.data.id}`,
        size: parseInt(response.data.size || '0', 10),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to get Google Drive folder details');
    }
  }
}