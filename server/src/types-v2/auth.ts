/**
 * Auth0 user profile with MWAP extensions
 */
export interface AuthUser {
  /** Auth0 subject identifier */
  sub: string;
  
  /** User's email address */
  email: string;
  
  /** User's roles across the system */
  roles: string[];
  
  /** Optional tenant ID for tenant-scoped users */
  tenantId?: string;
  
  /** Optional name fields */
  firstName?: string;
  lastName?: string;
  
  /** Metadata */
  metadata?: {
    lastLogin?: string;
    loginCount?: number;
    [key: string]: unknown;
  };
}

/**
 * Auth0 token claims
 */
export interface TokenClaims {
  /** Token issuer (Auth0 domain) */
  iss: string;
  
  /** Subject identifier */
  sub: string;
  
  /** Token audience */
  aud: string[];
  
  /** Token expiration time */
  exp: number;
  
  /** Token issued at time */
  iat: number;
  
  /** Token scope */
  scope?: string;
  
  /** User permissions */
  permissions?: string[];
  
  /** User roles */
  roles?: string[];
}

/**
 * Auth0 management API token
 */
export interface ManagementToken {
  /** Access token */
  access_token: string;
  
  /** Token type (Bearer) */
  token_type: 'Bearer';
  
  /** Expiration time in seconds */
  expires_in: number;
}