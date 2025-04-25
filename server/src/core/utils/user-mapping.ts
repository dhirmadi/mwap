import { User } from '@core/types/auth';

/**
 * Get user identifier based on context
 * @param user - The authenticated user
 * @param type - The type of identifier to return ('internal' uses id, 'auth' uses sub)
 * @returns string - The appropriate user identifier
 */
export const getUserIdentifier = (user: User, type: 'internal' | 'auth' = 'internal'): string => {
  return type === 'internal' ? user.id : user.sub;
};