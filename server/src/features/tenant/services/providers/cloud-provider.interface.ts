export interface CloudFolder {
  id: string;
  name: string;
  path: string;
  hasChildren: boolean;
}

export interface ListFoldersOptions {
  parentId?: string;
  search?: string;
}

export interface CloudProviderInterface {
  listFolders(options: ListFoldersOptions): Promise<CloudFolder[]>;
}