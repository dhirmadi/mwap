import { z } from 'zod';

export const StorageProvider = z.enum(['dropbox', 'gdrive', 'box', 'onedrive']);
export type StorageProvider = z.infer<typeof StorageProvider>;

export interface StorageProviderClient {
  validateFolder(folderId: string, token: string): Promise<boolean>;
  getFolderDetails(folderId: string, token: string): Promise<{
    name: string;
    path: string;
    size: number;
  }>;
}