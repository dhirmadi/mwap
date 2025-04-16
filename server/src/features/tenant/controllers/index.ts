import { Response } from 'express';
import { AuthRequest } from '@core/types/express';
import { AsyncController } from '@core/types/express';
import { TenantService } from '../services';
import { ValidationError } from '@core/errors';
import { logger } from '@core/utils/logger';
// Validation is handled by middleware

// Create a singleton instance of TenantService
const tenantService = new TenantService();

export const TenantController: AsyncController = {
  /**
   * Create a new tenant for the authenticated user
   * @requires requireNoTenant - User must not already have a tenant
   */
  createTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      logger.debug('Creating tenant - Request received', {
        userId: req.user.id,
        body: req.body,
        requestId: req.id,
        headers: {
          'content-type': req.headers['content-type'],
          authorization: req.headers.authorization ? 'present' : 'missing'
        }
      });

      // Validation check
      const validationResult = createTenantSchema.safeParse(req);
      if (!validationResult.success) {
        logger.warn('Tenant creation validation failed', {
          userId: req.user.id,
          errors: validationResult.error.errors,
          requestId: req.id
        });
        throw new ValidationError('Invalid request data', validationResult.error);
      }

      // Create tenant
      const tenant = await tenantService.createTenant(req.user.id, { name: req.body.name });
      
      logger.info('Tenant created successfully', {
        tenantId: tenant._id,
        userId: req.user.id,
        name: tenant.name,
        requestId: req.id,
        memberCount: tenant.members.length
      });

      // Return success response
      res.status(201).json({
        data: tenant,
        meta: { requestId: req.id }
      });
    } catch (error) {
      logger.error('Failed to create tenant', {
        userId: req.user?.id,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        requestId: req.id,
        body: req.body
      });
      throw error;
    }
  },

  /**
   * Get the authenticated user's tenant
   * Returns null if user has no tenant (not an error)
   */
  getCurrentTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    // Get tenant
    const tenant = await tenantService.getTenantByOwnerId(req.user.id);

    // Return response
    res.status(200).json({
      data: tenant,
      meta: {
        requestId: req.id
      }
    });
  },

  /**
   * Update tenant name or archive status
   * @requires requireTenantOwner - Only tenant owner can update
   */
  updateTenant: async (req: AuthRequest, res: Response): Promise<void> => {
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
  },

  /**
   * Delete tenant
   * @requires requireTenantOwner - Only tenant owner can delete
   */
  archiveTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      logger.debug('Archiving tenant', {
        tenantId: req.params.id,
        userId: req.user.id,
        requestId: req.id
      });

      // Archive tenant and cascade to projects
      const tenant = await tenantService.archiveTenant(req.params.id);

      logger.info('Tenant archived successfully', {
        tenantId: tenant._id,
        userId: req.user.id
      });

      // Return success response
      res.status(200).json({
        data: {
          tenantId: tenant._id,
          success: true
        },
        meta: {
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error('Failed to archive tenant', {
        tenantId: req.params.id,
        userId: req.user.id,
        error,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
};