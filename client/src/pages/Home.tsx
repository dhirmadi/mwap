import { Container, Title, Text, Stack, Button, Group, Loader } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const { isAuthenticated, isLoading, error, login, logout, user } = useAuth();

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Stack spacing="xl" align="center">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
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

  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <Title order={1}>👋 Welcome to MWAP</Title>
        
        {isAuthenticated ? (
          <>
            <Text size="lg">
              Welcome back! You're successfully logged in.
            </Text>
            <Text size="lg" color="dimmed">
              The profile builder feature is coming soon.
            </Text>
          </>
        ) : (
          <>
            <Text size="lg">
              MWAP is a full-stack application built with React, Node.js, Express, MongoDB, and Auth0.
            </Text>
            <Group>
              <Button 
                onClick={() => login()} 
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