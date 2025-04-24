import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '@core/types/express';
import { TenantModel } from '@features/tenant/schemas';
import { ProjectModel, ProjectRole } from '@features/projects/schemas';
import { 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  ValidationError 
} from '@core/errors';
import { logger } from '@core/utils';

/**
 * Middleware to ensure user doesn't already have a tenant
 */
export function requireNoTenant() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Stub: Check if user already has a tenant
    const hasTenant = false;
    if (hasTenant) {
      res.status(403).json({
        message: 'User already has a tenant'
      });
      return;
    }
    next();
  };
}

/**
 * Middleware to ensure user owns the tenant
 */
export function requireTenantOwner() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get tenant ID from params, body, or headers
      const tenantId = req.params.id || req.body.tenantId || req.headers['x-tenant-id'];
      const userId = req.user?.id;

      // Log request details
      logger.debug('Tenant owner check started', {
        userId,
        tenantId,
        path: req.path,
        method: req.method,
        source: {
          params: !!req.params.id,
          body: !!req.body.tenantId,
          headers: !!req.headers['x-tenant-id']
        }
      });

      // Validate inputs
      if (!userId) {
        logger.error('Missing user ID in request', { 
          auth: req.user,
          headers: req.headers 
        });
        throw new AuthenticationError('User not authenticated');
      }

      if (!tenantId) {
        logger.error('Missing tenant ID', {
          params: req.params,
          body: req.body,
          headers: req.headers
        });
        throw new ValidationError('Tenant ID is required');
      }

      // Find tenant and check ownership
      const tenant = await TenantModel.findById(tenantId);
      
      if (!tenant) {
        logger.error('Tenant not found', { tenantId });
        throw new NotFoundError('Tenant not found');
      }

      // Check if user is owner
      const isOwner = tenant.members.some(member => 
        member.userId.toString() === userId && 
        member.role === 'owner'
      );

      logger.debug('Tenant ownership check result', {
        userId,
        tenantId,
        isOwner,
        members: tenant.members.map(m => ({
          userId: m.userId.toString(),
          role: m.role
        }))
      });

      if (!isOwner) {
        logger.warn('User is not tenant owner', {
          userId,
          tenantId,
          userRoles: req.user?.roles,
          tenantMembers: tenant.members.map(m => ({
            userId: m.userId.toString(),
            role: m.role
          }))
        });
        throw new AuthorizationError('Only tenant owner can perform this action');
      }

      // Add tenant to request for downstream use
      req.tenant = tenant;
      next();
    } catch (error) {
      logger.error('Tenant owner check failed', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      next(error);
    }
  };
}

/**
 * Middleware to ensure user has required project role(s)
 * @param roles Array of roles that can access the resource
 */
export function requireProjectRole(roles: ProjectRole[] = [ProjectRole.ADMIN, ProjectRole.DEPUTY, ProjectRole.CONTRIBUTOR]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Log incoming request details
      logger.debug('Project role check started', {
        path: req.path,
        method: req.method,
        headers: {
          authorization: req.headers.authorization ? 'present' : 'missing',
          'content-type': req.headers['content-type'],
          accept: req.headers.accept
        },
        params: req.params,
        query: req.query,
        requiredRoles: roles
      });

      // Validate user and token
      if (!req.headers.authorization) {
        logger.error('Missing authorization header');
        throw new AuthenticationError('No authorization token provided');
      }

      if (!req.user) {
        logger.error('User not authenticated', {
          authHeader: req.headers.authorization.substring(0, 20) + '...',
          tokenType: req.headers.authorization.split(' ')[0]
        });
        throw new AuthenticationError('User not authenticated');
      }

      logger.debug('User authenticated', {
        userId: req.user.id,
        roles: req.user.roles,
        email: req.user.email
      });

      // Get project ID from params or query
      const rawProjectId = req.params.id || req.query.projectId;
      if (!rawProjectId) {
        logger.error('Missing project ID', { 
          userId: req.user.id,
          path: req.path,
          params: req.params,
          query: req.query
        });
        throw new AuthorizationError('Missing project ID');
      }

      // Convert to string and validate format
      let projectIdStr: string;
      
      if (Array.isArray(rawProjectId)) {
        projectIdStr = String(rawProjectId[0]);
      } else if (typeof rawProjectId === 'object') {
        projectIdStr = String(rawProjectId);
      } else {
        projectIdStr = String(rawProjectId);
      }

      // Log the ID conversion
      logger.debug('Project ID conversion', {
        raw: rawProjectId,
        converted: projectIdStr,
        type: typeof rawProjectId,
        isArray: Array.isArray(rawProjectId)
      });

      // Validate project ID format
      if (!projectIdStr || !Types.ObjectId.isValid(projectIdStr)) {
        logger.error('Invalid project ID format', { 
          raw: rawProjectId,
          converted: projectIdStr
        });
        throw new ValidationError('Invalid project ID format');
      }

      // Find project and validate membership
      const project = await ProjectModel.findById(projectIdStr);
      if (!project) {
        logger.error('Project not found', { 
          projectId: projectIdStr, 
          userId: req.user.id,
          exists: false
        });
        throw new NotFoundError('Project not found');
      }

      logger.debug('Project found', {
        projectId: projectIdStr,
        name: project.name,
        memberCount: project.members.length,
        isArchived: project.archived
      });

      // Check member role
      const member = project.members.find(m => m.userId.toString() === req.user.id);
      if (!member) {
        logger.error('User not a member', {
          userId: req.user.id,
          projectId: projectIdStr,
          projectMembers: project.members.map(m => ({
            userId: m.userId.toString(),
            role: m.role
          }))
        });
        throw new AuthorizationError('Not a member of this project');
      }

      if (!roles.includes(member.role)) {
        logger.error('Insufficient role', {
          userId: req.user.id,
          projectId: projectIdStr,
          userRole: member.role,
          requiredRoles: roles
        });
        throw new AuthorizationError(`Role ${member.role} insufficient. Required: ${roles.join(' or ')}`);
      }

      logger.debug('Role check passed', {
        userId: req.user.id,
        projectId: projectIdStr,
        userRole: member.role,
        requiredRoles: roles
      });

      // Add project to request for downstream use
      req.project = project;
      next();
    } catch (error) {
      logger.error('Project role check failed', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        projectId: req.params.id || req.query.projectId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      next(error);
    }
  };
}