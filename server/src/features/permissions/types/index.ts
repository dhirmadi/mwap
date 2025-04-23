import { User } from '@core/types/auth';

/**
 * Represents a single permission check result
 * @property action - The specific action being checked (e.g., "create_project")
 * @property resource - The resource type the action applies to (e.g., "project")
 * @property tenantId - The tenant context for this permission
 * @property allowed - Whether the action is permitted
 */
export interface Permission {
  action: string;
  resource: string;
  tenantId: string;
  allowed: boolean;
}

/**
 * API response format for permission checks
 * @property permissions - List of all permissions for the user in this context
 * @property roles - List of roles the user has in this context
 */
export interface PermissionResponse {
  permissions: Permission[];
  roles: string[];
}

/**
 * Permission service interface defining required methods for permission checks
 * @interface
 */
export interface PermissionService {
  /**
   * Get all permissions for a user in a tenant
   * @param user - The authenticated user
   * @param tenantId - The tenant context
   * @returns Promise<PermissionResponse> - List of permissions and roles
   */
  getUserPermissions(user: User, tenantId: string): Promise<PermissionResponse>;

  /**
   * Check if a user has a specific permission
   * @param user - The authenticated user
   * @param action - The action to check (e.g., "create_project")
   * @param resource - The resource type (e.g., "project")
   * @param tenantId - The tenant context
   * @returns Promise<boolean> - Whether the action is permitted
   */
  checkPermission(user: User, action: string, resource: string, tenantId: string): Promise<boolean>;
}

/**
 * Project-level permission assignment
 * Created automatically when a user creates a project
 * @property projectId - The project this permission applies to
 * @property userId - The user granted this permission
 * @property role - The role in the project (owner is permanent)
 * @property grantedAt - When this permission was granted
 */
export interface ProjectPermission {
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  grantedAt: Date;
}

/**
 * Available permission actions in the system
 * Used to ensure consistency in permission checks
 * 
 * Project Permissions:
 * - CREATE: Create new projects in tenant
 * - READ: View project details
 * - UPDATE: Modify project settings
 * - DELETE: Archive/delete project
 * - MANAGE_MEMBERS: Add/remove project members
 */
export const PERMISSIONS = {
  PROJECT: {
    CREATE: 'create_project',
    READ: 'read_project',
    UPDATE: 'update_project',
    DELETE: 'delete_project',
    MANAGE_MEMBERS: 'manage_project_members'
  }
} as const;