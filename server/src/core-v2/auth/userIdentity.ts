/**
 * Centralized User Identity Management for Auth0
 * 
 * @description Provides utilities for handling Auth0 user identifiers
 */
export class UserIdentity {
  /**
   * Validates an Auth0 user identifier (sub claim)
   * 
   * @param userId - The user identifier from Auth0
   * @returns Boolean indicating if the ID is valid
   */
  static validate(userId: string): boolean {
    // Regex for Auth0 sub claim formats
    const auth0Patterns = [
      /^auth0\|[a-zA-Z0-9]{24}$/,           // Default Auth0 format
      /^(google-oauth2|facebook|github)\|[a-zA-Z0-9]+$/, // Social provider formats
      /^[a-zA-Z0-9]{24}$/                   // Fallback for potential variations
    ];

    return auth0Patterns.some(pattern => pattern.test(userId));
  }

  /**
   * Extracts the authentication provider from the user ID
   * 
   * @param userId - The user identifier from Auth0
   * @returns The authentication provider or null
   */
  static extractProvider(userId: string): string | null {
    const match = userId.match(/^([a-z-]+)\|/);
    return match ? match[1] : null;
  }

  /**
   * Sanitizes the user ID, removing any potential injection risks
   * 
   * @param userId - The user identifier from Auth0
   * @returns Sanitized user ID
   */
  static sanitize(userId: string): string {
    // Remove any non-alphanumeric characters except | and specific allowed characters
    return userId.replace(/[^a-zA-Z0-9|-]/g, '');
  }

  /**
   * Generates a consistent error message for invalid user IDs
   * 
   * @param userId - The invalid user identifier
   * @returns Descriptive error message
   */
  static getInvalidIdMessage(userId: string): string {
    return `Invalid user identifier: ${userId}. Must be a valid Auth0 sub claim.`;
  }
}

/**
 * Type guard for user ID validation
 * 
 * @param userId - The user identifier to check
 * @throws Error if the user ID is invalid
 */
export function assertValidUserId(userId: string): asserts userId is string {
  if (!UserIdentity.validate(userId)) {
    throw new Error(UserIdentity.getInvalidIdMessage(userId));
  }
}

// Export as a const to allow for easy importing and extension
export const userIdentityConfig = {
  /**
   * Allowed authentication providers
   */
  allowedProviders: [
    'auth0',
    'google-oauth2',
    'facebook',
    'github',
    'linkedin'
  ]
} as const;