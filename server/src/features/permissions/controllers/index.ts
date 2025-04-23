import { Response, NextFunction } from 'express';
import { AuthRequest } from '@core/types/express';
import { DefaultPermissionService } from '../services/permission.service';
import { logger } from '@core/utils/logger';

const permissionService = new DefaultPermissionService();

export const PermissionController = {
  /**
   * Get user permissions for a tenant
   * @requires auth.validateRequest - User must be authenticated
   */
  getPermissions: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = req.query;

      if (!tenantId || typeof tenantId !== 'string') {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'tenantId is required',
            requestId: req.id
          }
        });
        return;
      }

      logger.debug('Getting permissions for user', {
        userId: req.user.id,
        tenantId
      });

      const permissions = await permissionService.getUserPermissions(req.user, tenantId);

      res.status(200).json({
        data: permissions,
        meta: {
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error('Error getting permissions', {
        userId: req.user.id,
        error
      });
      next(error);
    }
  }
};