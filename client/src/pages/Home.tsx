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
        
        {isAuthenticated && user ? (
          <>
            <Text size="lg">
              Welcome back, {user.name}! You're successfully logged in.
            </Text>
            {user.picture && (
              <img 
                src={user.picture} 
                alt={user.name}
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
            )}
            <Group>
              <Button 
                onClick={() => logout()}
                color="red"
                variant="light"
              >
                Logout
              </Button>
            </Group>
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