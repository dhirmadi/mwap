import { UserIdentity } from './userIdentity';

/**
 * User Migration Utility
 * Helps transition from legacy _id to Auth0 sub-based identification
 */
export class UserMigration {
  /**
   * Convert legacy user object to new user identity
   * @param user Legacy user object with potential _id
   * @returns User identity with Auth0 sub
   */
  static convertToUserIdentity(user: any): UserIdentity {
    // If user already has sub, return it
    if (UserIdentity.validate(user.sub)) {
      return {
        sub: user.sub,
        email: user.email,
        name: user.name
      };
    }

    // If _id exists, convert to string (fallback mechanism)
    if (user._id) {
      const subFromId = `auth0|${user._id.toString()}`;
      
      // Validate the generated sub
      if (UserIdentity.validate(subFromId)) {
        return {
          sub: subFromId,
          email: user.email,
          name: user.name
        };
      }
    }

    // If no valid identifier found, throw error
    throw new Error('Unable to generate valid user identity');
  }

  /**
   * Extract user ID safely
   * @param user User object
   * @returns Validated user ID
   */
  static getUserId(user: any): string {
    // Prefer sub claim
    if (UserIdentity.validate(user.sub)) {
      return user.sub;
    }

    // Fallback to _id conversion
    if (user._id) {
      const subFromId = `auth0|${user._id.toString()}`;
      
      if (UserIdentity.validate(subFromId)) {
        return subFromId;
      }
    }

    throw new Error('No valid user identifier found');
  }

  /**
   * Check if a user object needs migration
   * @param user User object
   * @returns Boolean indicating if migration is needed
   */
  static needsMigration(user: any): boolean {
    return !UserIdentity.validate(user.sub) && !!user._id;
  }
}

// Type guard for user identity
export function isUserIdentity(user: any): user is UserIdentity {
  return user && UserIdentity.validate(user.sub);
}