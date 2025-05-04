import "@jest/globals";
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { CloudProviderService } from './service';
import { CloudProviderModel } from '@models/v2/cloudProvider.model';
import { AppError } from '@core/errors/appError';

describe('CloudProviderService', () => {
  let mongoServer: MongoMemoryServer;

  const validOAuth2Provider = {
    providerId: 'google-drive',
    name: 'Google Drive',
    authType: 'OAuth2' as const,
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'https://example.com/callback',
    configOptions: { scope: 'drive.file' }
  };

  const validAPIKeyProvider = {
    providerId: 'aws-s3',
    name: 'AWS S3',
    authType: 'APIKey' as const,
    configOptions: { region: 'us-east-1' }
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
  });

  describe('createCloudProvider', () => {
    it('should create an OAuth2 provider with valid data', async () => {
      const result = await CloudProviderService.createCloudProvider(validOAuth2Provider);
      
      expect(result.providerId).toBe(validOAuth2Provider.providerId);
      expect(result.authType).toBe('OAuth2');
      expect(result.clientId).toBe(validOAuth2Provider.clientId);
    });

    it('should create an APIKey provider with valid data', async () => {
      const result = await CloudProviderService.createCloudProvider(validAPIKeyProvider);
      
      expect(result.providerId).toBe(validAPIKeyProvider.providerId);
      expect(result.authType).toBe('APIKey');
      expect(result.configOptions).toEqual(validAPIKeyProvider.configOptions);
    });

    it('should reject OAuth2 provider without required fields', async () => {
      const invalidData = {
        ...validOAuth2Provider,
        clientId: undefined
      };

      await expect(CloudProviderService.createCloudProvider(invalidData as any))
        .rejects
        .toThrow(AppError);
    });

    it('should reject invalid providerId format', async () => {
      const invalidData = {
        ...validOAuth2Provider,
        providerId: 'Invalid ID'
      };

      await expect(CloudProviderService.createCloudProvider(invalidData))
        .rejects
        .toThrow(AppError);
    });

    it('should reject duplicate providerId', async () => {
      await CloudProviderService.createCloudProvider(validOAuth2Provider);
      
      await expect(CloudProviderService.createCloudProvider(validOAuth2Provider))
        .rejects
        .toThrow('Provider ID already exists');
    });
  });

  describe('listCloudProviders', () => {
    it('should list all providers', async () => {
      await CloudProviderService.createCloudProvider(validOAuth2Provider);
      await CloudProviderService.createCloudProvider(validAPIKeyProvider);

      const result = await CloudProviderService.listCloudProviders();
      expect(result).toHaveLength(2);
    });
  });

  describe('updateCloudProvider', () => {
    it('should update provider fields', async () => {
      await CloudProviderService.createCloudProvider(validOAuth2Provider);
      
      const updates = { name: 'Updated Name' };
      const result = await CloudProviderService.updateCloudProvider(
        validOAuth2Provider.providerId,
        updates
      );

      expect(result.name).toBe(updates.name);
      expect(result.clientId).toBe(validOAuth2Provider.clientId);
    });

    it('should reject invalid updates', async () => {
      await CloudProviderService.createCloudProvider(validOAuth2Provider);
      
      const invalidUpdates = { name: '' };
      await expect(CloudProviderService.updateCloudProvider(
        validOAuth2Provider.providerId,
        invalidUpdates
      )).rejects.toThrow(AppError);
    });
  });

  describe('deleteCloudProvider', () => {
    it('should delete an existing provider', async () => {
      await CloudProviderService.createCloudProvider(validOAuth2Provider);
      
      await CloudProviderService.deleteCloudProvider(validOAuth2Provider.providerId);
      
      const result = await CloudProviderModel.findOne({
        providerId: validOAuth2Provider.providerId
      });
      expect(result).toBeNull();
    });

    it('should throw error for non-existent provider', async () => {
      await expect(CloudProviderService.deleteCloudProvider('non-existent'))
        .rejects
        .toThrow('Cloud provider not found');
    });
  });
});