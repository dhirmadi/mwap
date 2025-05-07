import { CloudProviderModel } from '@models/v2/cloudProvider.model';
import { OAuth2Manager } from './oauth';
import { AppError } from '@core/errors/appError';
import type { User } from '@models/v2/user.model';

export class CloudService {
  static async startOAuth(providerId: string, user: User) {
    const authUrl = await OAuth2Manager.getAuthUrl(providerId, user);
    return { authUrl };
  }

  static async completeOAuth(code: string, state: string) {
    const tokens = await OAuth2Manager.exchangeCode(code, state);
    return { tokens };
  }

  static async listFolders(providerId: string, accessToken: string, path?: string) {
    const provider = await CloudProviderModel.findOne({ providerId, archived: false });
    if (!provider) {
      throw AppError.badRequest('Invalid provider');
    }

    // Validate token format (basic check)
    if (!accessToken.startsWith(`mock_access_token_${providerId}`)) {
      throw AppError.unauthorized('Invalid access token');
    }

    // Mock folder structure based on provider
    const mockFolders = {
      'google-drive': [
        { id: 'root', name: 'My Drive', path: '/' },
        { id: 'docs', name: 'Documents', path: '/Documents' },
        { id: 'photos', name: 'Photos', path: '/Photos' }
      ],
      'dropbox': [
        { id: 'home', name: 'Home', path: '/' },
        { id: 'work', name: 'Work Files', path: '/Work Files' },
        { id: 'shared', name: 'Shared', path: '/Shared' }
      ]
    };

    return {
      folders: mockFolders[providerId as keyof typeof mockFolders] || []
    };
  }
}