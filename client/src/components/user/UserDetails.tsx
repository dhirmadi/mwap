import { SimpleGrid, Card, Text } from '@mantine/core';
import { Auth0User } from '../../types';

/**
 * Props for UserDetails component
 */
export interface UserDetailsProps {
  readonly user: Auth0User;
}

/**
 * Display detailed user information
 * 
 * @example
 * ```tsx
 * <UserDetails user={user} />
 * ```
 */
export function UserDetails({ user }: UserDetailsProps): JSX.Element {
  return (
    <SimpleGrid cols={1} spacing="md">
      <Card withBorder padding="md">
        <Text size="sm" fw={500} c="dimmed" mb="xs">
          Auth0 ID
        </Text>
        <Text>{user.sub}</Text>
      </Card>

      {user.nickname && (
        <Card withBorder padding="md">
          <Text size="sm" fw={500} c="dimmed" mb="xs">
            Nickname
          </Text>
          <Text>{user.nickname}</Text>
        </Card>
      )}

      {user.locale && (
        <Card withBorder padding="md">
          <Text size="sm" fw={500} c="dimmed" mb="xs">
            Locale
          </Text>
          <Text>{user.locale}</Text>
        </Card>
      )}
    </SimpleGrid>
  );
}