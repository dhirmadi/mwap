import "@jest/globals";
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { CloudService } from './service';
import { CloudProviderModel } from '../../../models/v2/cloudProvider.model';
import { AppError } from '../../../core-v2/errors/AppError';
import type { User } from '../../../models/v2/user.model';

describe('CloudService', () => {
  let mongoServer: MongoMemoryServer;

  const mockUser: Partial<User> = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockGoogleProvider = {
    providerId: 'google-drive',
    name: 'Google Drive',
    authType: 'OAuth2' as const,
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    redirectUri: 'https://app.example.com/oauth/google/callback',
    configOptions: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scope: 'https://www.googleapis.com/auth/drive.readonly'
    }
  };

  const mockDropboxProvider = {
    providerId: 'dropbox',
    name: 'Dropbox',
    authType: 'OAuth2' as const,
    clientId: 'dropbox-client-id',
    clientSecret: 'dropbox-client-secret',
    redirectUri: 'https://app.example.com/oauth/dropbox/callback',
    configOptions: {
      authUrl: 'https://www.dropbox.com/oauth2/authorize',
      scope: 'files.content.read'
    }
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await CloudProviderModel.deleteMany({});
    await CloudProviderModel.create([mockGoogleProvider, mockDropboxProvider]);
  });

  describe('startOAuth', () => {
    it('should generate auth URL for Google Drive', async () => {
      const result = await CloudService.startOAuth('google-drive', mockUser as User);
      
      expect(result.authUrl).toContain('accounts.google.com');
      expect(result.authUrl).toContain(mockGoogleProvider.clientId);
      expect(result.authUrl).toContain(encodeURIComponent(mockGoogleProvider.redirectUri));
    });

    it('should generate auth URL for Dropbox', async () => {
      const result = await CloudService.startOAuth('dropbox', mockUser as User);
      
      expect(result.authUrl).toContain('dropbox.com');
      expect(result.authUrl).toContain(mockDropboxProvider.clientId);
      expect(result.authUrl).toContain(encodeURIComponent(mockDropboxProvider.redirectUri));
    });

    it('should reject invalid provider', async () => {
      await expect(CloudService.startOAuth('invalid-provider', mockUser as User))
        .rejects
        .toThrow('Invalid or non-OAuth2 provider');
    });
  });

  describe('completeOAuth', () => {
    it('should exchange code for tokens', async () => {
      const state = Buffer.from(`${mockUser._id}:google-drive:${Date.now()}`).toString('base64');
      
      const result = await CloudService.completeOAuth('test-code', state);
      
      expect(result.tokens).toHaveProperty('access_token');
      expect(result.tokens).toHaveProperty('refresh_token');
      expect(result.tokens).toHaveProperty('expires_in');
    });

    it('should reject invalid state parameter', async () => {
      await expect(CloudService.completeOAuth('test-code', 'invalid-state'))
        .rejects
        .toThrow('Invalid OAuth state parameter');
    });
  });

  describe('listFolders', () => {
    it('should list Google Drive folders', async () => {
      const result = await CloudService.listFolders(
        'google-drive',
        'mock_access_token_google-drive'
      );
      
      expect(result.folders).toHaveLength(3);
      expect(result.folders[0]).toHaveProperty('name', 'My Drive');
    });

    it('should list Dropbox folders', async () => {
      const result = await CloudService.listFolders(
        'dropbox',
        'mock_access_token_dropbox'
      );
      
      expect(result.folders).toHaveLength(3);
      expect(result.folders[0]).toHaveProperty('name', 'Home');
    });

    it('should reject invalid provider', async () => {
      await expect(CloudService.listFolders(
        'invalid-provider',
        'mock_access_token'
      )).rejects.toThrow('Invalid provider');
    });

    it('should reject invalid token', async () => {
      await expect(CloudService.listFolders(
        'google-drive',
        'invalid_token'
      )).rejects.toThrow('Invalid access token');
    });
  });
});