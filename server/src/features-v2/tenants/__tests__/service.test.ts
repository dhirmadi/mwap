import "@jest/globals";
import { AppError } from '../../../core-v2/errors';
import { logger } from '../../../core-v2/logger';
import { encryptToken, decryptToken } from '../../../core-v2/crypto';
import { getProviderClient } from '../../../providers-v2';
import { TenantModel } from '../model';
import { TenantService } from '../service';

jest.mock('../../../core-v2/logger');
jest.mock('../../../core-v2/crypto');
jest.mock('../../../providers-v2');
jest.mock('../model');

describe('TenantService', () => {
  let service: TenantService;
  const mockUser = {
    sub: 'user-123',
    tenantId: 'tenant-123',
  };

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Tenant',
    ownerId: 'user-123',
    status: 'active' as const,
    integrations: {
      dropbox: {
        token: 'encrypted-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    service = new TenantService();
    jest.clearAllMocks();

    // Mock tenant operations
    (TenantModel.findById as jest.Mock).mockResolvedValue(mockTenant);
    (TenantModel.findOne as jest.Mock).mockResolvedValue(null);
    (TenantModel.create as jest.Mock).mockResolvedValue(undefined);
    (TenantModel.update as jest.Mock).mockResolvedValue(undefined);

    // Mock crypto operations
    (encryptToken as jest.Mock).mockResolvedValue('encrypted-token');
    (decryptToken as jest.Mock).mockResolvedValue('decrypted-token');

    // Mock provider operations
    (getProviderClient as jest.Mock).mockReturnValue({
      validateToken: jest.fn().mockResolvedValue(true),
    });
  });

  describe('createTenant', () => {
    const createInput = { name: 'New Tenant' };

    it('should create tenant for new user', async () => {
      const tenant = await service.createTenant(mockUser, createInput);

      expect(tenant).toMatchObject({
        name: createInput.name,
        ownerId: mockUser.sub,
        status: 'active',
        integrations: {},
      });

      expect(TenantModel.create).toHaveBeenCalledWith(expect.objectContaining({
        name: createInput.name,
        ownerId: mockUser.sub,
      }));

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'createTenant',
          user: expect.any(Object),
          tenant: expect.any(Object),
        })
      );
    });

    it('should throw error when user already has tenant', async () => {
      (TenantModel.findOne as jest.Mock).mockResolvedValue(mockTenant);

      await expect(
        service.createTenant(mockUser, createInput)
      ).rejects.toThrow(AppError.validation('User already has a tenant'));
    });

    it('should throw error when creation fails', async () => {
      (TenantModel.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        service.createTenant(mockUser, createInput)
      ).rejects.toThrow(AppError.internal('Failed to create tenant'));

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'createTenant',
          error: expect.any(Error),
        })
      );
    });
  });

  describe('getTenant', () => {
    it('should return tenant DTO', async () => {
      const tenant = await service.getTenant(mockUser);

      expect(tenant).toEqual({
        id: mockTenant.id,
        name: mockTenant.name,
        createdAt: mockTenant.createdAt,
        integrations: ['dropbox'],
      });
    });

    it('should throw error when tenant not found', async () => {
      (TenantModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getTenant(mockUser)
      ).rejects.toThrow(AppError.notFound('Tenant not found'));
    });
  });

  describe('updateTenant', () => {
    const updateInput = { name: 'Updated Tenant' };

    it('should update tenant name', async () => {
      const tenant = await service.updateTenant(mockUser, updateInput);

      expect(tenant).toMatchObject({
        ...mockTenant,
        name: updateInput.name,
        updatedAt: expect.any(Date),
      });

      expect(TenantModel.update).toHaveBeenCalledWith(
        mockTenant.id,
        expect.objectContaining({
          name: updateInput.name,
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'updateTenant',
          changes: {
            name: {
              from: mockTenant.name,
              to: updateInput.name,
            },
          },
        })
      );
    });

    it('should throw error when tenant not found', async () => {
      (TenantModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateTenant(mockUser, updateInput)
      ).rejects.toThrow(AppError.notFound('Tenant not found'));
    });
  });

  describe('addIntegration', () => {
    const provider = 'gdrive';
    const token = 'test-token';

    it('should add integration with encrypted token', async () => {
      await service.addIntegration(mockUser, provider, token);

      expect(getProviderClient).toHaveBeenCalledWith(provider);
      expect(encryptToken).toHaveBeenCalledWith(token);
      expect(TenantModel.update).toHaveBeenCalledWith(
        mockTenant.id,
        expect.objectContaining({
          integrations: expect.objectContaining({
            [provider]: expect.objectContaining({
              token: 'encrypted-token',
            }),
          }),
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'addIntegration',
          integration: {
            provider,
          },
        })
      );
    });

    it('should throw error when token is invalid', async () => {
      (getProviderClient as jest.Mock).mockReturnValue({
        validateToken: jest.fn().mockResolvedValue(false),
      });

      await expect(
        service.addIntegration(mockUser, provider, token)
      ).rejects.toThrow(AppError.validation('Invalid provider token'));
    });
  });

  describe('removeIntegration', () => {
    const provider = 'dropbox';

    it('should remove integration', async () => {
      await service.removeIntegration(mockUser, provider);

      expect(TenantModel.update).toHaveBeenCalledWith(
        mockTenant.id,
        expect.objectContaining({
          integrations: {},
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'removeIntegration',
          integration: {
            provider,
          },
        })
      );
    });

    it('should throw error when integration not found', async () => {
      await expect(
        service.removeIntegration(mockUser, 'invalid-provider')
      ).rejects.toThrow(AppError.notFound('Integration not found'));
    });
  });

  describe('listIntegrations', () => {
    it('should return list of providers', async () => {
      const providers = await service.listIntegrations(mockUser);
      expect(providers).toEqual(['dropbox']);
    });

    it('should return empty array when no integrations', async () => {
      (TenantModel.findById as jest.Mock).mockResolvedValue({
        ...mockTenant,
        integrations: {},
      });

      const providers = await service.listIntegrations(mockUser);
      expect(providers).toEqual([]);
    });
  });
});