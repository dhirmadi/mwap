import { Group, Avatar, Stack, Title, Text, Badge } from '@mantine/core';
import { Auth0User } from '@/types';

/**
 * Props for UserHeader component
 */
export interface UserHeaderProps {
  readonly user: Auth0User;
}

/**
 * Display user header with avatar and basic info
 * 
 * @example
 * ```tsx
 * <UserHeader user={user} />
 * ```
 */
export function UserHeader({ user }: UserHeaderProps): JSX.Element {
  return (
    <Group align="flex-start" mb="xl">
      <Avatar 
        src={user.picture} 
        size="xl" 
        radius="md"
        alt={user.name || 'Profile picture'}
      />
      <Stack gap="xs">
        <Title order={2}>{user.name}</Title>
        <Text size="sm" c="dimmed">{user.email}</Text>
        {user.email_verified && (
          <Badge color="green" variant="light">
            Email Verified
          </Badge>
        )}
      </Stack>
    </Group>
  );
}