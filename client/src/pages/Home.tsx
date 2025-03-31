import { Container, Title, Text, Stack, Button, Group } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';

export function Home() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <Title order={1}>👋 Hello World!</Title>
        
        {isAuthenticated ? (
          <>
            <Text size="lg">
              Welcome back, {user?.name}! This is a simple starting page for the NWAP Mini application.
            </Text>
            <Group>
              <Button 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                color="red"
              >
                Logout
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Text size="lg">
              Welcome to NWAP Mini! This is a full-stack application built with React, Node.js, Express, MongoDB, and Auth0.
            </Text>
            <Group>
              <Button onClick={() => loginWithRedirect()} color="blue">
                Login to Get Started
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
}