import type { StorageProvider } from './projects';

/**
 * Tenant settings
 */
export interface TenantSettings {
  /** Allow external sharing */
  allowExternalSharing: boolean;
  
  /** Maximum projects allowed */
  maxProjects: number;
  
  /** Allowed storage providers */
  storageProviders: StorageProvider[];
  
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Tenant entity
 */
export interface Tenant {
  /** Tenant ID */
  id: string;
  
  /** Tenant name */
  name: string;
  
  /** Tenant slug */
  slug: string;
  
  /** Tenant settings */
  settings: TenantSettings;
  
  /** Owner user ID */
  ownerId: string;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Tenant invite status
 */
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

/**
 * Tenant invite
 */
export interface TenantInvite {
  /** Invite ID */
  id: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Invitee email */
  email: string;
  
  /** Invite token */
  token: string;
  
  /** Invite status */
  status: InviteStatus;
  
  /** Expiration timestamp */
  expiresAt: Date;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** When the invite was used */
  usedAt?: Date;
  
  /** Who created the invite */
  createdBy: string;
}