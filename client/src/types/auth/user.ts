/**
 * Auth0 user profile information
 * @see https://auth0.com/docs/users/user-profiles
 */
export interface Auth0User {
  readonly sub: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly name: string;
  readonly nickname?: string;
  readonly picture: string;
  readonly locale?: string;
  readonly updated_at: string;
}

/**
 * Application-specific user information
 * Extends Auth0 profile with additional fields
 */
export interface User extends Auth0User {
  readonly id: string;
  readonly tenantId?: string;
  readonly lastLoginAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}