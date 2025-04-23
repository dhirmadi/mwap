import { User } from '@core/types/auth';

export interface Permission {
  action: string;    // e.g., "create_project"
  resource: string;  // e.g., "project"
  tenantId: string;
  allowed: boolean;
}

export interface PermissionResponse {
  permissions: Permission[];
  roles: string[];
}

export interface PermissionService {
  getUserPermissions(user: User, tenantId: string): Promise<PermissionResponse>;
  checkPermission(user: User, action: string, resource: string, tenantId: string): Promise<boolean>;
}

export interface ProjectPermission {
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  grantedAt: Date;
}

// Permission actions
export const PERMISSIONS = {
  PROJECT: {
    CREATE: 'create_project',
    READ: 'read_project',
    UPDATE: 'update_project',
    DELETE: 'delete_project',
    MANAGE_MEMBERS: 'manage_project_members'
  }
} as const;