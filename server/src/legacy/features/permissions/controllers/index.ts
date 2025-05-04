/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '@core/types/express';
import { DefaultPermissionService } from '../services/permission.service';
import { logger } from '@core/utils/logger';

/**
 * Permission service instance using default implementation
 * Handles tenant-level permission checks and role mapping
 */
const permissionService = new DefaultPermissionService();

/**
 * Controller for permission-related endpoints
 * Provides API access to permission checking functionality
 */
export const PermissionController = {
  /**
   * Get user permissions for a tenant
   * Returns list of permissions and roles for the authenticated user
   * 
   * @route GET /api/v1/permissions
   * @requires auth.validateRequest - User must be authenticated
   * @queryParam tenantId - The tenant to check permissions in
   * 
   * @returns 200 - List of permissions and roles
   * @returns 400 - If tenantId is missing or invalid
   * @returns 401 - If user is not authenticated
   * @returns 403 - If user has no access to tenant
   * @returns 500 - On server error
   * 
   * Example Response:
   * {
   *   "data": {
   *     "permissions": [
   *       {
   *         "action": "create_project",
   *         "resource": "project",
   *         "tenantId": "123",
   *         "allowed": true
   *       }
   *     ],
   *     "roles": ["admin"]
   *   },
   *   "meta": {
   *     "requestId": "req-123"
   *   }
   * }
   */
  getPermissions: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = req.query;

      // Validate tenantId parameter
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

      // Get permissions from service
      const permissions = await permissionService.getUserPermissions(req.user, tenantId);

      // Return permissions in standard format
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