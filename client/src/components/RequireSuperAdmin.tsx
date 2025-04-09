import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Stack, Title, Text, Loader } from '@mantine/core';
import { useTenantContext } from '../features/tenants/hooks/useTenantContext';

interface RequireSuperAdminProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes requiring super admin access.
 * Redirects non-super-admin users to the dashboard.
 */
export default function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const { isSuperAdmin } = useTenantContext();
  const navigate = useNavigate();

  // Redirect non-super-admins to dashboard
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  // Show loading state while checking localStorage
  // This is very quick, but helps prevent flash of unauthorized content
  if (typeof window !== 'undefined' && !localStorage.getItem('isSuperAdmin')) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl" align="center">
          <Loader size="lg" />
          <Text size="lg" c="dimmed">
            Checking permissions...
          </Text>
        </Stack>
      </Container>
    );
  }

  // Show error state if something went wrong
  if (typeof window !== 'undefined' && localStorage.getItem('isSuperAdmin') === null) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl">
          <Title order={1} color="red">Permission Error</Title>
          <Text size="lg">
            There was a problem checking your permissions.
            Please try logging out and back in.
          </Text>
        </Stack>
      </Container>
    );
  }

  // If super admin, render the protected content
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // This return is just for TypeScript - the useEffect will redirect
  return null;
}