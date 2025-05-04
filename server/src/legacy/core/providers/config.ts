/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { ProviderRegistration } from './types';
import { DropboxProvider } from '@features/tenant/services/providers/dropbox.provider';
import { GoogleDriveProvider } from '@features/tenant/services/providers/gdrive.provider';

export const providerConfigs: ProviderRegistration[] = [
  {
    metadata: {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Dropbox cloud storage integration',
      icon: 'dropbox-icon',
      capabilities: {
        folderListing: true,
        folderCreation: true,
        folderDeletion: true,
        search: true,
        thumbnails: true,
        sharing: true
      },
      enabled: true,
      version: '1.0.0'
    },
    config: {
      clientId: process.env.DROPBOX_CLIENT_ID || '',
      clientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
      scopes: ['files.read', 'files.write'],
      authEndpoint: 'https://www.dropbox.com/oauth2/authorize',
      tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token',
      apiEndpoint: 'https://api.dropboxapi.com/2'
    },
    factory: DropboxProvider
  },
  {
    metadata: {
      id: 'gdrive',
      name: 'Google Drive',
      description: 'Google Drive cloud storage integration',
      icon: 'gdrive-icon',
      capabilities: {
        folderListing: true,
        folderCreation: true,
        folderDeletion: true,
        search: true,
        thumbnails: true,
        sharing: true
      },
      enabled: true,
      version: '1.0.0'
    },
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ],
      authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      apiEndpoint: 'https://www.googleapis.com/drive/v3'
    },
    factory: GoogleDriveProvider
  }
];