import { Paper } from '@mantine/core';
import { Auth0User } from '@/types';
import { UserHeader } from './UserHeader';
import { UserDetails } from './UserDetails';

/**
 * Props for UserProfile component
 */
export interface UserProfileProps {
  readonly user: Auth0User;
}

/**
 * Display user profile information
 * 
 * @example
 * ```tsx
 * <UserProfile user={user} />
 * ```
 */
export function UserProfile({ user }: UserProfileProps): JSX.Element {
  return (
    <Paper shadow="sm" p="xl" radius="md">
      <UserHeader user={user} />
      <UserDetails user={user} />
    </Paper>
  );
}