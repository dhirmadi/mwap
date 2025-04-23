/**
 * Permission interface representing a single permission
 */
export interface Permission {
  action: string;
  resource: string;
  tenantId: string;
  allowed: boolean;
}

/**
 * API response format for permissions endpoint
 */
export interface PermissionResponse {
  data: {
    permissions: Permission[];
    roles: string[];
  };
  meta: {
    requestId: string;
  };
}

/**
 * Permission constants
 */
export const PERMISSIONS = {
  PROJECT: {
    CREATE: 'create_project',
    READ: 'read_project',
    UPDATE: 'update_project',
    DELETE: 'delete_project'
  }
} as const;