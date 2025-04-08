import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Stack, Title, Text, Button, Group, Loader } from '@mantine/core';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes requiring authentication.
 * Handles loading states, errors, and redirects unauthenticated users.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const {
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
  } = useAuth0();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      // Store the attempted URL for post-login redirect
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/?returnTo=${returnTo}`, { replace: true });
    }
  }, [isLoading, isAuthenticated, error, navigate, location]);

  // Show loading state
  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl" align="center">
          <Loader size="lg" />
          <Text size="lg" c="dimmed">
            Verifying authentication...
          </Text>
        </Stack>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl">
          <Title order={1} color="red">Authentication Error</Title>
          <Text color="red">Error Type: {error.name}</Text>
          <Text color="red">Message: {error.message}</Text>
          <Text size="sm" c="dimmed">
            There was a problem verifying your authentication status.
            Please try again or log in.
          </Text>
          <Group>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
            <Button 
              onClick={() => loginWithRedirect({
                appState: { returnTo: location.pathname + location.search }
              })}
            >
              Log In
            </Button>
          </Group>
        </Stack>
      </Container>
    );
  }

  // If authenticated, render the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // This return is just for TypeScript - the useEffect will redirect
  return null;
}