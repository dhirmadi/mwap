export interface CloudFolder {
  id: string;
  name: string;
  path: string;
  hasChildren: boolean;
}

export interface ListFoldersOptions {
  parentId?: string;
  search?: string;
  pageToken?: string;
  pageSize?: number;
}

export interface ListFoldersResponse {
  folders: CloudFolder[];
  nextPageToken?: string;
}

export interface CloudProviderInterface {
  listFolders(options: ListFoldersOptions): Promise<ListFoldersResponse>;
  createNewFolder(parentId: string, name: string): Promise<CloudFolder>;
  removeFolder(folderId: string): Promise<void>;
}