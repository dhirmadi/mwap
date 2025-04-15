import { Stack } from '@mantine/core';
import { Auth0User } from '@/types';
import { PageLayout } from './PageLayout';
import { UserProfile } from '../user/UserProfile';

/**
 * Props for ProfileLayout component
 */
export interface ProfileLayoutProps {
  readonly user: Auth0User;
  readonly children: React.ReactNode;
}

/**
 * Layout for profile page with user info and content
 * 
 * @example
 * ```tsx
 * <ProfileLayout user={user}>
 *   <Content />
 * </ProfileLayout>
 * ```
 */
export function ProfileLayout({
  user,
  children
}: ProfileLayoutProps): JSX.Element {
  return (
    <PageLayout>
      <Stack spacing="xl">
        <UserProfile user={user} />
        {children}
      </Stack>
    </PageLayout>
  );
}