import "@jest/globals";
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { TenantService } from './service';
import { TenantModel } from '../../../models/v2/tenant.model';
import { AppError } from '../../../core/errors/appError';
import type { User } from '../../../models/v2/user.model';

describe('TenantService', () => {
  let mongoServer: MongoMemoryServer;

  const mockUser: Partial<User> = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    name: 'Test User'
  };

  const validTenant = {
    name: 'Test Tenant'
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
    await TenantModel.deleteMany({});
  });

  describe('createTenant', () => {
    it('should create a tenant with valid data', async () => {
      const result = await TenantService.createTenant(mockUser as User, validTenant);
      
      expect(result.name).toBe(validTenant.name);
      expect(result.ownerId.toString()).toBe(mockUser._id!.toString());
      expect(result.archived).toBe(false);
    });

    it('should reject invalid tenant name', async () => {
      const invalidData = {
        name: ''
      };

      await expect(TenantService.createTenant(mockUser as User, invalidData))
        .rejects
        .toThrow(AppError);
    });

    it('should reject second active tenant for same user', async () => {
      await TenantService.createTenant(mockUser as User, validTenant);
      
      await expect(TenantService.createTenant(mockUser as User, {
        name: 'Second Tenant'
      })).rejects.toThrow('User already has an active tenant');
    });

    it('should allow new tenant after archiving previous one', async () => {
      const firstTenant = await TenantService.createTenant(mockUser as User, validTenant);
      await TenantService.archiveTenant(firstTenant._id);

      const secondTenant = await TenantService.createTenant(mockUser as User, {
        name: 'Second Tenant'
      });

      expect(secondTenant.name).toBe('Second Tenant');
      expect(secondTenant.archived).toBe(false);
    });
  });

  describe('getTenant', () => {
    it('should get tenant by id', async () => {
      const created = await TenantService.createTenant(mockUser as User, validTenant);
      const fetched = await TenantService.getTenant(created._id);

      expect(fetched.name).toBe(validTenant.name);
    });

    it('should throw error for non-existent tenant', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await expect(TenantService.getTenant(nonExistentId.toString()))
        .rejects
        .toThrow('Tenant not found');
    });
  });

  describe('updateTenant', () => {
    it('should update tenant name', async () => {
      const tenant = await TenantService.createTenant(mockUser as User, validTenant);
      
      const updates = { name: 'Updated Name' };
      const result = await TenantService.updateTenant(tenant._id, updates);

      expect(result.name).toBe(updates.name);
    });

    it('should reject invalid updates', async () => {
      const tenant = await TenantService.createTenant(mockUser as User, validTenant);
      
      const invalidUpdates = { name: '' };
      await expect(TenantService.updateTenant(tenant._id, invalidUpdates))
        .rejects
        .toThrow(AppError);
    });

    it('should not update archived tenant', async () => {
      const tenant = await TenantService.createTenant(mockUser as User, validTenant);
      await TenantService.archiveTenant(tenant._id);

      await expect(TenantService.updateTenant(tenant._id, { name: 'New Name' }))
        .rejects
        .toThrow('Tenant not found or archived');
    });
  });

  describe('archiveTenant', () => {
    it('should archive an active tenant', async () => {
      const tenant = await TenantService.createTenant(mockUser as User, validTenant);
      const archived = await TenantService.archiveTenant(tenant._id);

      expect(archived.archived).toBe(true);
    });

    it('should throw error when archiving non-existent tenant', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await expect(TenantService.archiveTenant(nonExistentId.toString()))
        .rejects
        .toThrow('Tenant not found');
    });

    it('should throw error when archiving already archived tenant', async () => {
      const tenant = await TenantService.createTenant(mockUser as User, validTenant);
      await TenantService.archiveTenant(tenant._id);

      await expect(TenantService.archiveTenant(tenant._id))
        .rejects
        .toThrow('Tenant not found or already archived');
    });
  });
});