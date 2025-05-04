import { AppError } from '../core-v2/errors';
import { DropboxClient } from './dropbox';
import { GDriveClient } from './gdrive';
import type { StorageProvider, StorageProviderClient } from './types';

const clients: Record<StorageProvider, StorageProviderClient> = {
  dropbox: new DropboxClient(),
  gdrive: new GDriveClient(),
  box: {
    validateFolder: () => Promise.reject(AppError.notImplemented('Box support not implemented')),
    getFolderDetails: () => Promise.reject(AppError.notImplemented('Box support not implemented')),
  },
  onedrive: {
    validateFolder: () => Promise.reject(AppError.notImplemented('OneDrive support not implemented')),
    getFolderDetails: () => Promise.reject(AppError.notImplemented('OneDrive support not implemented')),
  },
};

export function getProviderClient(provider: StorageProvider): StorageProviderClient {
  return clients[provider];
}

export * from './types';