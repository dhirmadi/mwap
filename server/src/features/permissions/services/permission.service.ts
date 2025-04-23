import { User } from '@core/types/auth';
import { TenantService } from '@features/tenant/services';
import { Permission, PermissionResponse, PermissionService, PERMISSIONS } from '../types';
import { logger } from '@core/utils/logger';

export class DefaultPermissionService implements PermissionService {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

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