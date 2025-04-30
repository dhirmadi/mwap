/**
 * Project role types
 */
export const PROJECT_ROLES = {
  OWNER: 'OWNER',
  DEPUTY: 'DEPUTY',
  MEMBER: 'MEMBER',
} as const;

export type ProjectRole = typeof PROJECT_ROLES[keyof typeof PROJECT_ROLES];

/**
 * Project member with role
 */
export interface ProjectMember {
  /** User ID */
  userId: string;
  
  /** User's email */
  email: string;
  
  /** Project role */
  role: ProjectRole;
  
  /** When the member was added */
  addedAt: Date;
  
  /** Who added the member */
  addedBy: string;
}

/**
 * Project storage provider
 */
export type StorageProvider = 'dropbox' | 'gdrive' | 'onedrive' | 'box';

/**
 * Project visibility
 */
export type ProjectVisibility = 'private' | 'team' | 'public';

/**
 * Project settings
 */
export interface ProjectSettings {
  /** Storage provider */
  storageProvider: StorageProvider;
  
  /** Project visibility */
  visibility: ProjectVisibility;
  
  /** Project tags */
  tags: string[];
  
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Project entity
 */
export interface Project {
  /** Project ID */
  id: string;
  
  /** Project name */
  name: string;
  
  /** Project slug */
  slug: string;
  
  /** Project description */
  description?: string;
  
  /** Project settings */
  settings: ProjectSettings;
  
  /** Project members */
  members: ProjectMember[];
  
  /** Tenant ID */
  tenantId: string;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}