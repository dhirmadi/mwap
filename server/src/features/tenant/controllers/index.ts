import { Response } from 'express';
import { AuthRequest } from '@core/types/express';
import { AsyncController } from '@core/types/express';
import { TenantService } from '../services';
import { ValidationError } from '@core/errors';
import { logger } from '@core/utils/logger';

// Create a singleton instance of TenantService
const tenantService = new TenantService();

export const TenantController: AsyncController = {
  /**
   * Create a new tenant for the authenticated user
   * @requires requireNoTenant - User must not already have a tenant
   */
  createTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      logger.debug('Creating tenant', {
        userId: req.user.id,
        body: req.body,
        requestId: req.id
      });

      // Validate request body
      const { name } = req.body;
      if (!name) {
        logger.warn('Missing tenant name', { userId: req.user.id });
        throw new ValidationError('Tenant name is required');
      }

      // Create tenant
      const tenant = await tenantService.createTenant(req.user.id, { name });
      logger.info('Tenant created successfully', {
        tenantId: tenant._id,
        userId: req.user.id,
        name: tenant.name
      });

      // Return success response
      res.status(201).json({
        data: tenant,
        meta: { requestId: req.id }
      });
    } catch (error) {
      logger.error('Failed to create tenant', {
        userId: req.user?.id,
        error,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  /**
   * Get the authenticated user's tenant
   * Returns null if user has no tenant (not an error)
   */
  getCurrentTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Get tenant
      const tenant = await tenantService.getTenantByOwnerId(req.user.id);

      // Return response
      res.status(200).json({
        data: tenant,
        meta: {
          requestId: req.id
        }
      });
    } catch (error) {
      // Let error middleware handle it
      throw error;
    }
  },

  /**
   * Update tenant name or archive status
   * @requires requireTenantOwner - Only tenant owner can update
   */
  updateTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Validate request
      const { id: tenantId } = req.params;
      const { name } = req.body;

      if (!name) {
        throw new ValidationError('No updates provided');
      }

      // Update tenant
      const tenant = await tenantService.updateTenant(tenantId, { name });

      // Return success response
      res.status(200).json({
        data: tenant,
        meta: {
          requestId: req.id
        }
      });
    } catch (error) {
      // Let error middleware handle it
      throw error;
    }
  },

  /**
   * Delete tenant
   * @requires requireTenantOwner - Only tenant owner can delete
   */
  archiveTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Delete tenant
      const tenant = await tenantService.deleteTenant(req.params.id);

      // Return success response
      res.status(200).json({
        data: tenant,
        meta: {
          requestId: req.id
        }
      });
    } catch (error) {
      // Let error middleware handle it
      throw error;
    }
  }
};