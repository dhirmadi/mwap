import { Response } from 'express';
import { AuthRequest } from '@core/types/express';
import { AsyncController } from '@core/types/express';
import { 
  getTenantByOwnerId, 
  createTenant, 
  updateTenant, 
  archiveTenant 
} from '../services';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError 
} from '@core/errors';

export const TenantController: AsyncController = {
  /**
   * Create a new tenant for the authenticated user
   * @requires requireNoTenant - User must not already have a tenant
   */
  createTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { name } = req.body;
      if (!name) {
        throw new ValidationError(
          'Tenant name is required',
          { body: req.body }
        );
      }

      // Create tenant
      const tenant = await createTenant(req.user.id, name);

      // Return success response
      res.status(201).json({
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
   * Get the authenticated user's tenant
   * Returns null if user has no tenant (not an error)
   */
  getCurrentTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Get tenant
      const tenant = await getTenantByOwnerId(req.user.id);

      // Return response (null if no tenant)
      res.status(200).json({
        data: tenant,
        meta: {
          requestId: req.id
        }
      });
    } catch (error) {
      // Handle not found as null response
      if (error instanceof NotFoundError) {
        res.status(200).json({
          data: null,
          meta: {
            requestId: req.id
          }
        });
        return;
      }

      // Let error middleware handle other errors
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
      const { name, archived } = req.body;

      if (!name && typeof archived !== 'boolean') {
        throw new ValidationError(
          'No updates provided',
          { body: req.body }
        );
      }

      // Update tenant
      const tenant = await updateTenant(
        tenantId,
        req.user.id,
        { name, archived }
      );

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
   * Archive tenant
   * @requires requireTenantOwner - Only tenant owner can archive
   */
  archiveTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Archive tenant
      const tenant = await archiveTenant(
        req.params.id,
        req.user.id
      );

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