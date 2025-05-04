import { Dropbox } from 'dropbox';
import { AppError } from '../core-v2/errors';
import type { StorageProviderClient } from './types';

export class DropboxClient implements StorageProviderClient {
  async validateFolder(folderId: string, token: string): Promise<boolean> {
    try {
      const client = new Dropbox({ accessToken: token });
      const response = await client.filesGetMetadata({ path: folderId });
      return response.result['.tag'] === 'folder';
    } catch (error) {
      if (error.status === 401) {
        throw AppError.unauthorized('Invalid Dropbox token');
      }
      if (error.status === 404) {
        throw AppError.notFound('Dropbox folder not found');
      }
      throw AppError.internal('Failed to validate Dropbox folder');
    }
  }

  async getFolderDetails(folderId: string, token: string) {
    try {
      const client = new Dropbox({ accessToken: token });
      const response = await client.filesGetMetadata({ path: folderId });
      if (response.result['.tag'] !== 'folder') {
        throw AppError.badRequest('Path is not a folder');
      }
      return {
        name: response.result.name,
        path: response.result.path_display || '',
        size: 0, // Folders don't have size in Dropbox
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to get Dropbox folder details');
    }
  }
}