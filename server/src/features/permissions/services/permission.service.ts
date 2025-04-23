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
      // Super admin has all permissions
      if (user.roles.includes('SUPER_ADMIN')) {
        return this.getAllPermissions(tenantId);
      }

      // Get tenant and check membership
      const tenant = await this.tenantService.getTenantById(tenantId);
      const member = tenant.members.find(m => m.userId === user.sub);

      if (!member) {
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
      const { permissions } = await this.getUserPermissions(user, tenantId);
      return permissions.some(p => 
        p.action === action && 
        p.resource === resource && 
        p.tenantId === tenantId && 
        p.allowed
      );
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