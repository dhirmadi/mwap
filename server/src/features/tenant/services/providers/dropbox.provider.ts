import { Dropbox } from 'dropbox';
import { CloudFolder, ListFoldersOptions, ListFoldersResponse } from './cloud-provider.interface';
import { BaseCloudProvider } from './base.provider';
import { logger } from '@core/utils';

export class DropboxProvider extends BaseCloudProvider {
  private client: Dropbox;

  constructor(accessToken: string) {
    super();
    this.client = new Dropbox({ accessToken });
  }

  protected async doListFolders({ 
    parentId = '', 
    search = '',
    pageSize = 100
  }: ListFoldersOptions): Promise<ListFoldersResponse> {
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

  protected async createFolder(parentId: string, name: string): Promise<CloudFolder> {
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

  protected async deleteFolder(folderId: string): Promise<void> {
    await this.client.filesDeleteV2({
      path: folderId
    });
  }
}