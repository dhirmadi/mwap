import { User } from '@core/types/auth';
import { TenantService } from '@features/tenant/services';
import { Permission, PermissionResponse, PermissionService, PERMISSIONS } from '../types';
import { logger } from '@core/utils/logger';

/**
 * Default implementation of the permission service
 * Handles permission checks based on tenant roles and super admin status
 * 
 * Permission Rules:
 * 1. Super admins have all permissions in all tenants
 * 2. Tenant owners and admins can create projects
 * 3. Project creators automatically become project owners
 * 4. Project owners have full project permissions
 */
export class DefaultPermissionService implements PermissionService {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

  /**
   * Get all permissions for a user in a tenant
   * @param user - The authenticated user
   * @param tenantId - The tenant to check permissions in
   * @returns PermissionResponse with list of permissions and roles
   * 
   * Permission Assignment Rules:
   * - Super admins get all permissions
   * - Tenant owners/admins can create projects
   * - Non-members get no permissions
   * 
   * @throws Error if tenant service fails
   */
  async getUserPermissions(user: User, tenantId: string): Promise<PermissionResponse> {
    try {
      // Log initial request
      logger.info('[GET USER PERMISSIONS - REQUEST]', {
        user: {
          id: user.id,
          sub: user.sub,
          roles: user.roles
        },
        tenantId
      });

      // Super admin has all permissions
      if (user.roles.includes('SUPER_ADMIN')) {
        logger.info('[GET USER PERMISSIONS - SUPER ADMIN]', {
          userId: user.id,
          tenantId
        });
        return this.getAllPermissions(tenantId);
      }

      // Get tenant and check membership
      const tenant = await this.tenantService.getTenantById(tenantId);
      
      // Log tenant details
      logger.info('[GET USER PERMISSIONS - TENANT]', {
        userId: user.id,
        tenantId,
        tenant: {
          id: tenant._id,
          name: tenant.name,
          memberCount: tenant.members.length
        }
      });

      const member = tenant.members.find(m => m.userId === user.sub);

      // Log membership check
      logger.info('[GET USER PERMISSIONS - MEMBERSHIP]', {
        userId: user.id,
        userSub: user.sub,
        tenantId,
        isMember: !!member,
        memberDetails: member ? {
          userId: member.userId,
          role: member.role
        } : null
      });

      if (!member) {
        logger.warn('[GET USER PERMISSIONS - NO MEMBERSHIP]', {
          userId: user.id,
          userSub: user.sub,
          tenantId
        });
        return {
          permissions: [],
          roles: []
        };
      }

      // Map tenant roles to permissions
      const permissions: Permission[] = [];
      const memberRole = member.role.toLowerCase();

      // Project permissions based on tenant role
      if (memberRole === 'owner' || memberRole === 'admin') {
        permissions.push({
          action: PERMISSIONS.PROJECT.CREATE,
          resource: 'project',
          tenantId,
          allowed: true
        });
      }

      // Log final permissions
      logger.info('[GET USER PERMISSIONS - RESULT]', {
        userId: user.id,
        tenantId,
        memberRole,
        grantedPermissions: permissions.map(p => ({
          action: p.action,
          resource: p.resource,
          allowed: p.allowed
        }))
      });

      return {
        permissions,
        roles: [memberRole]
      };
    } catch (error) {
      logger.error('Error getting user permissions', {
        userId: user.id,
        tenantId,
        error
      });
      throw error;
    }
  }

  /**
   * Check if a user has a specific permission
   * @param user - The authenticated user
   * @param action - The action to check (e.g., "create_project")
   * @param resource - The resource type (e.g., "project")
   * @param tenantId - The tenant context
   * @returns boolean - Whether the action is permitted
   * 
   * Error Handling:
   * - Returns false on error (fail-safe)
   * - Logs errors for debugging
   * - Does not throw exceptions
   */
  async checkPermission(user: User, action: string, resource: string, tenantId: string): Promise<boolean> {
    try {
      // Log permission check request
      logger.info('[PERMISSION CHECK - REQUEST]', {
        user: {
          id: user.id,
          sub: user.sub,
          roles: user.roles
        },
        action,
        resource,
        tenantId
      });

      const { permissions, roles } = await this.getUserPermissions(user, tenantId);
      
      // Log user's permissions
      logger.info('[PERMISSION CHECK - USER PERMISSIONS]', {
        userId: user.id,
        tenantId,
        roles,
        permissions: permissions.map(p => ({
          action: p.action,
          resource: p.resource,
          allowed: p.allowed
        }))
      });

      const hasPermission = permissions.some(p => 
        p.action === action && 
        p.resource === resource && 
        p.tenantId === tenantId && 
        p.allowed
      );

      // Log permission check result
      logger.info('[PERMISSION CHECK - RESULT]', {
        userId: user.id,
        tenantId,
        action,
        resource,
        hasPermission,
        matchingPermissions: permissions.filter(p => 
          p.action === action && 
          p.resource === resource && 
          p.tenantId === tenantId
        ).map(p => ({
          action: p.action,
          resource: p.resource,
          allowed: p.allowed
        }))
      });
      
      return hasPermission;
    } catch (error) {
      logger.error('Error checking permission', {
        userId: user.id,
        action,
        resource,
        tenantId,
        error
      });
      return false;
    }
  }

  /**
   * Get all possible permissions for a super admin
   * @private
   * @param tenantId - The tenant context
   * @returns PermissionResponse with all permissions enabled
   */
  private getAllPermissions(tenantId: string): PermissionResponse {
    return {
      permissions: Object.values(PERMISSIONS.PROJECT).map(action => ({
        action,
        resource: 'project',
        tenantId,
        allowed: true
      })),
      roles: ['SUPER_ADMIN']
    };
  }
}