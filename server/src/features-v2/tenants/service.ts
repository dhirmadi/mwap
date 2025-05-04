/**
 * This module uses core-v2 only
 */

import { v4 as uuid } from 'uuid';
import { AppError } from '../../core-v2/errors';
import { logger } from '../../core-v2/logger';
import { encryptToken, decryptToken } from '../../core-v2/crypto';
import { getProviderClient } from '../../providers-v2';
import { TenantModel, type Tenant } from './model';

export interface CreateTenantInput {
  name: string;
}

export interface TenantDTO {
  id: string;
  name: string;
  createdAt: Date;
  integrations: string[];
}

export class TenantService {
  async createTenant(user: { sub: string }, data: CreateTenantInput): Promise<Tenant> {
    try {
      // Check if user already has a tenant
      const existingTenant = await TenantModel.findOne({ ownerId: user.sub });
      if (existingTenant) {
        throw AppError.validation('User already has a tenant');
      }

      // Create new tenant
      const tenant: Tenant = {
        id: uuid(),
        name: data.name,
        ownerId: user.sub,
        status: 'active',
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save tenant
      await TenantModel.create(tenant);

      // Log creation
      logger.info({
        action: 'createTenant',
        user: {
          id: user.sub,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
      });

      return tenant;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'createTenant',
        error,
        user: {
          id: user.sub,
        },
      });
      throw AppError.internal('Failed to create tenant');
    }
  }

  async getTenant(user: { tenantId: string }): Promise<TenantDTO> {
    try {
      // Load tenant
      const tenant = await TenantModel.findById(user.tenantId);
      if (!tenant) {
        throw AppError.notFound('Tenant not found');
      }

      // Return DTO without sensitive data
      return {
        id: tenant.id,
        name: tenant.name,
        createdAt: tenant.createdAt,
        integrations: tenant.integrations ? Object.keys(tenant.integrations) : [],
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'getTenant',
        error,
        user: {
          tenantId: user.tenantId,
        },
      });
      throw AppError.internal('Failed to get tenant');
    }
  }

  async updateTenant(user: { tenantId: string }, updates: { name: string }): Promise<Tenant> {
    try {
      // Load tenant
      const tenant = await TenantModel.findById(user.tenantId);
      if (!tenant) {
        throw AppError.notFound('Tenant not found');
      }

      // Update name only
      const updated = {
        ...tenant,
        name: updates.name,
        updatedAt: new Date(),
      };

      // Save changes
      await TenantModel.update(tenant.id, updated);

      // Log update
      logger.info({
        action: 'updateTenant',
        user: {
          tenantId: user.tenantId,
        },
        changes: {
          name: {
            from: tenant.name,
            to: updates.name,
          },
        },
      });

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'updateTenant',
        error,
        user: {
          tenantId: user.tenantId,
        },
      });
      throw AppError.internal('Failed to update tenant');
    }
  }

  async addIntegration(
    user: { tenantId: string },
    provider: string,
    token: string
  ): Promise<void> {
    try {
      // Load tenant
      const tenant = await TenantModel.findById(user.tenantId);
      if (!tenant) {
        throw AppError.notFound('Tenant not found');
      }

      // Validate token with provider
      const client = getProviderClient(provider);
      const isValid = await client.validateToken(token);
      if (!isValid) {
        throw AppError.validation('Invalid provider token');
      }

      // Encrypt token
      const encryptedToken = await encryptToken(token);

      // Add integration
      const updated = {
        ...tenant,
        integrations: {
          ...tenant.integrations,
          [provider]: {
            token: encryptedToken,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        updatedAt: new Date(),
      };

      // Save changes
      await TenantModel.update(tenant.id, updated);

      // Log addition
      logger.info({
        action: 'addIntegration',
        user: {
          tenantId: user.tenantId,
        },
        integration: {
          provider,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'addIntegration',
        error,
        user: {
          tenantId: user.tenantId,
        },
        integration: {
          provider,
        },
      });
      throw AppError.internal('Failed to add integration');
    }
  }

  async removeIntegration(user: { tenantId: string }, provider: string): Promise<void> {
    try {
      // Load tenant
      const tenant = await TenantModel.findById(user.tenantId);
      if (!tenant) {
        throw AppError.notFound('Tenant not found');
      }

      // Check if integration exists
      if (!tenant.integrations?.[provider]) {
        throw AppError.notFound('Integration not found');
      }

      // Remove integration
      const { [provider]: removed, ...remaining } = tenant.integrations;
      const updated = {
        ...tenant,
        integrations: remaining,
        updatedAt: new Date(),
      };

      // Save changes
      await TenantModel.update(tenant.id, updated);

      // Log removal
      logger.info({
        action: 'removeIntegration',
        user: {
          tenantId: user.tenantId,
        },
        integration: {
          provider,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'removeIntegration',
        error,
        user: {
          tenantId: user.tenantId,
        },
        integration: {
          provider,
        },
      });
      throw AppError.internal('Failed to remove integration');
    }
  }

  async listIntegrations(user: { tenantId: string }): Promise<string[]> {
    try {
      // Load tenant
      const tenant = await TenantModel.findById(user.tenantId);
      if (!tenant) {
        throw AppError.notFound('Tenant not found');
      }

      // Return provider list
      return tenant.integrations ? Object.keys(tenant.integrations) : [];
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({
        action: 'listIntegrations',
        error,
        user: {
          tenantId: user.tenantId,
        },
      });
      throw AppError.internal('Failed to list integrations');
    }
  }
}
