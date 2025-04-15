import { useAuth0 } from '@auth0/auth0-react';
import { Stack, Text } from '@mantine/core';
import { Auth0User } from '@/types';
import { LoadingState } from '@/components/common';
import { PageLayout, ProfileLayout } from '@/components/layout';
import { TenantStatus } from '@/components/tenant/TenantStatus';
import { MyProjects } from '@/components/project/MyProjects';
import { RedeemInvite } from '@/components/invite/RedeemInvite';

/**
 * User profile page with workspace management
 */
export function Profile(): JSX.Element {
  const { user, isLoading } = useAuth0<Auth0User>();

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState />
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <Text>Please log in to view your profile.</Text>
      </PageLayout>
    );
  }

  return (
    <ProfileLayout user={user}>
      <Stack spacing="xl">
        <TenantStatus />
        <MyProjects />
        <RedeemInvite />
      </Stack>
    </ProfileLayout>
  );
}