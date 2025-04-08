import { Container, Title, Text, Stack, Button, Group, Loader } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useTenantBootstrap } from '../features/tenants/hooks/useTenantBootstrap';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, error: authError, login, logout, user } = useAuth();
  const { redirectTo, isLoading: bootstrapLoading, error: bootstrapError } = useTenantBootstrap();
  const navigate = useNavigate();

  // Handle redirect when bootstrap completes
  useEffect(() => {
    if (isAuthenticated && redirectTo && !bootstrapLoading && !bootstrapError) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, redirectTo, bootstrapLoading, bootstrapError, navigate]);

  // Show loading state for either auth or bootstrap
  if (authLoading || (isAuthenticated && bootstrapLoading)) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl" align="center">
          <Loader size="lg" />
          <Text>{authLoading ? 'Authenticating...' : 'Loading your profile...'}</Text>
        </Stack>
      </Container>
    );
  }

  // Handle authentication errors
  if (authError) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl">
          <Title order={1} color="red">Authentication Error</Title>
          <Text color="red">Error Type: {authError.name}</Text>
          <Text color="red">Message: {authError.message}</Text>
          <Text size="sm" color="dimmed">
            If this error persists, please try clearing your browser cache and cookies.
          </Text>
          <Group>
            <Button onClick={() => window.location.reload()} color="blue">
              Retry
            </Button>
            <Button 
              onClick={() => login()} 
              color="green"
            >
              Try Login Again
            </Button>
          </Group>
        </Stack>
      </Container>
    );
  }

  // Handle bootstrap errors
  if (bootstrapError) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl">
          <Title order={1} color="red">Profile Loading Error</Title>
          <Text color="red">We encountered an error while loading your profile.</Text>
          <Text color="red">Message: {bootstrapError.message}</Text>
          <Text size="sm" color="dimmed">
            Please try again. If the problem persists, contact support.
          </Text>
          <Group>
            <Button onClick={() => window.location.reload()} color="blue">
              Retry
            </Button>
            <Button 
              onClick={() => logout()} 
              color="red"
            >
              Logout
            </Button>
          </Group>
        </Stack>
      </Container>
    );
  }

  // Show welcome screen for non-authenticated users
  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <Title order={1}>👋 Welcome to MWAP</Title>
        
        {isAuthenticated ? (
          <>
            <Text size="lg">
              Welcome back! We're preparing your workspace...
            </Text>
            <Text size="sm" color="dimmed">
              You'll be redirected to your dashboard in a moment.
            </Text>
            <Loader size="sm" />
          </>
        ) : (
          <>
            <Text size="lg">
              MWAP is a full-stack application built with React, Node.js, Express, MongoDB, and Auth0.
            </Text>
            <Text size="md" color="dimmed">
              Login to access your tenant workspace and start managing your resources.
            </Text>
            <Group>
              <Button 
                onClick={() => login()} 
                color="blue"
                size="lg"
              >
                Login to Get Started
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
}