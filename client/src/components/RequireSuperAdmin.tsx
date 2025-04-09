import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Stack, Title, Text, Loader, Alert } from '@mantine/core';
import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { useTenantContext } from '../features/tenants/hooks/useTenantContext';
import { useAuth0 } from '@auth0/auth0-react';

interface RequireSuperAdminProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes requiring super admin access.
 * Redirects non-super-admin users to the dashboard.
 */
export default function RequireSuperAdmin({ children }: RequireSuperAdminProps) {
  const { isSuperAdmin } = useTenantContext();
  const { isLoading: isAuthLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  // Handle permission check and redirection
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setIsChecking(true);

        // Wait for Auth0 to initialize
        if (isAuthLoading) return;

        // If not authenticated, we'll let RequireAuth handle it
        if (!isAuthenticated) return;

        // Check localStorage and redirect if needed
        const storedValue = localStorage.getItem('isSuperAdmin');
        if (storedValue === null) {
          throw new Error('Permission data not found');
        }

        if (!isSuperAdmin) {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error checking super admin permissions:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkPermissions();
  }, [isAuthLoading, isAuthenticated, isSuperAdmin, navigate]);

  // Show loading state while checking permissions
  if (isAuthLoading || isChecking) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl" align="center">
          <Loader size="lg" variant="bars" />
          <Stack align="center" spacing="md">
            <IconLock size={24} style={{ opacity: 0.5 }} />
            <Text size="lg" c="dimmed" align="center">
              Verifying super admin access...
            </Text>
          </Stack>
        </Stack>
      </Container>
    );
  }

  // Show error state if something went wrong
  if (!isAuthenticated) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size="1.1rem" />}
          title="Authentication Required"
          color="red"
          variant="filled"
        >
          <Stack spacing="md">
            <Text size="sm">
              You need to be logged in to access this area.
            </Text>
            <Text
              size="sm"
              style={{ cursor: 'pointer' }}
              underline
              onClick={() => loginWithRedirect()}
            >
              Click here to log in
            </Text>
          </Stack>
        </Alert>
      </Container>
    );
  }

  // Show error state if permissions are missing
  if (!isSuperAdmin) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size="1.1rem" />}
          title="Access Denied"
          color="red"
          variant="filled"
        >
          <Stack spacing="md">
            <Text size="sm">
              This area requires super admin access.
              If you believe this is an error, please contact support.
            </Text>
            <Text
              size="sm"
              style={{ cursor: 'pointer' }}
              underline
              onClick={() => navigate('/dashboard', { replace: true })}
            >
              Return to dashboard
            </Text>
          </Stack>
        </Alert>
      </Container>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}