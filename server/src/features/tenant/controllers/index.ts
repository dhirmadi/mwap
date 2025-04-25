import { Response } from 'express';
import { AuthRequest } from '@core/types/express';
import { AsyncController } from '@core/types/express';
import { TenantService } from '../services';
import { ValidationError } from '@core/errors';
import { logger } from '@core/utils/logger';
import { getUserIdentifier } from '@core/utils/user-mapping';
import { createTenantSchema } from '../schemas/validation';

// Create a singleton instance of TenantService
const tenantService = new TenantService();

export * from './integrations.controller';
export * from './folders.controller';

export const TenantController: AsyncController = {
  /**
   * Create a new tenant for the authenticated user
   * @requires requireNoTenant - User must not already have a tenant
   */
  createTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      logger.info('Tenant creation request received', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        body: req.body,
        requestId: req.id,
        headers: {
          'content-type': req.headers['content-type'],
          'accept': req.headers['accept'],
          'authorization': req.headers.authorization ? 'present' : 'missing',
          'user-agent': req.headers['user-agent']
        },
        query: req.query,
        params: req.params
      });

      // Validate user object
      if (!req.user?.id) {
        logger.error('User ID missing in request', {
          user: req.user,
          requestId: req.id
        });
        throw new ValidationError('User ID is required');
      }

      // Validation check
      const validationResult = createTenantSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        logger.warn('Tenant creation validation failed', {
          userId: req.user.id,
          errors,
          requestId: req.id,
          receivedBody: req.body
        });
        throw new ValidationError('Invalid request data', { errors });
      }

      logger.debug('Validation passed, creating tenant', {
        userId: req.user.id,
        name: req.body.name,
        requestId: req.id
      });

      // Create tenant using auth ID
      const tenant = await tenantService.createTenant(getUserIdentifier(req.user, 'auth'), { name: req.body.name });
      
      logger.info('Tenant created successfully', {
        tenantId: tenant._id,
        userId: req.user.id,
        name: tenant.name,
        requestId: req.id,
        memberCount: tenant.members.length,
        timestamp: new Date().toISOString()
      });

      // Return success response
      res.status(201).json({
        data: tenant,
        meta: { 
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to create tenant', {
        userId: req.user?.id,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code
        } : error,
        requestId: req.id,
        body: req.body,
        path: req.path,
        timestamp: new Date().toISOString()
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
      const tenant = await tenantService.getTenantByOwnerId(getUserIdentifier(req.user, 'auth'));
      
      logger.debug('Retrieved tenant', {
        userId: req.user.id,
        tenantId: tenant?._id,
        requestId: req.id
      });

      res.status(200).json({
        data: tenant,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get tenant', {
        userId: req.user.id,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        requestId: req.id
      });
      throw error;
    }
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
  /**
   * Get a specific tenant by ID
   * @requires requireTenantOwner - Only tenant owner can view
   */
  getTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenant = await tenantService.getTenantById(req.params.id);
      
      logger.debug('Retrieved tenant by ID', {
        userId: req.user.id,
        tenantId: tenant?._id,
        requestId: req.id
      });

      res.status(200).json({
        data: tenant,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get tenant by ID', {
        userId: req.user.id,
        tenantId: req.params.id,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        requestId: req.id
      });
      throw error;
    }
  },

  /**
   * Archive tenant
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