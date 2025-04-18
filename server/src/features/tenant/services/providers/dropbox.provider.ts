import { Dropbox } from 'dropbox';
import { CloudProviderInterface, CloudFolder, ListFoldersOptions } from './cloud-provider.interface';
import { logger } from '@core/utils';

export class DropboxProvider implements CloudProviderInterface {
  private client: Dropbox;

  constructor(accessToken: string) {
    this.client = new Dropbox({ accessToken });
  }

  async listFolders({ parentId = '', search = '' }: ListFoldersOptions): Promise<CloudFolder[]> {
    try {
      const path = parentId || '';
      
      // List folder contents
      const result = await this.client.filesListFolder({
        path,
        recursive: false,
        include_mounted_folders: true,
        include_non_downloadable_files: false
      });

      // Filter and transform entries
      const folders = result.result.entries
        .filter(entry => entry['.tag'] === 'folder')
        .filter(folder => !search || folder.name.toLowerCase().includes(search.toLowerCase()))
        .map(folder => ({
          id: folder.id,
          name: folder.name,
          path: folder.path_display || '',
          hasChildren: true // Dropbox API doesn't provide this info directly
        }));

      logger.debug('Listed Dropbox folders', {
        parentId,
        search,
        count: folders.length
      });

      return folders;
    } catch (error) {
      logger.error('Failed to list Dropbox folders', {
        parentId,
        search,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}