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
  validateToken?(): Promise<boolean>;
  search?(query: string): Promise<CloudFolder[]>;
  share?(folderId: string, options: ShareOptions): Promise<string>;
}

export interface ShareOptions {
  role?: 'reader' | 'writer' | 'owner';
  type?: 'user' | 'group' | 'domain' | 'anyone';
  emailAddress?: string;
  domain?: string;
  allowDiscovery?: boolean;
  expirationTime?: Date;
}