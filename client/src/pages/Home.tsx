import { Container, Title, Text, Stack, Button, Group } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';

export function Home() {
  const { isAuthenticated, isLoading, error, loginWithRedirect, logout, user } = useAuth0();

  console.log('Auth0 State:', { isAuthenticated, isLoading, error, user });

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl" align="center">
          <Title order={1}>Loading...</Title>
        </Stack>
      </Container>
    );
  }

  if (error) {
    console.error('Auth0 Error:', error);
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl">
          <Title order={1} color="red">Authentication Error</Title>
          <Text color="red">Error Type: {error.name}</Text>
          <Text color="red">Message: {error.message}</Text>
          <Text size="sm" color="dimmed">
            If this error persists, please try clearing your browser cache and cookies.
          </Text>
          <Group>
            <Button onClick={() => window.location.reload()} color="blue">
              Retry
            </Button>
            <Button 
              onClick={() => loginWithRedirect({ 
                prompt: 'login',
                appState: { returnTo: window.location.pathname }
              })} 
              color="green"
            >
              Try Login Again
            </Button>
          </Group>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <Title order={1}>👋 Hello World!</Title>
        
        {isAuthenticated && user ? (
          <>
            <Text size="lg">
              Welcome back, {user.name}! This is a simple starting page for the MWAP application.
            </Text>
            <Group>
              <Button 
                onClick={() => logout({ 
                  logoutParams: { 
                    returnTo: window.location.origin,
                    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID
                  } 
                })}
                color="red"
              >
                Logout
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Text size="lg">
              Welcome to MWAP! This is a full-stack application built with React, Node.js, Express, MongoDB, and Auth0.
            </Text>
            <Group>
              <Button 
                onClick={() => loginWithRedirect({
                  appState: { returnTo: window.location.pathname }
                })} 
                color="blue"
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