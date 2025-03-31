import { useAuth0 } from '@auth0/auth0-react';
import { Button, Container, Group, Paper, Text, Title } from '@mantine/core';

function App() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="md" withBorder>
        <Title order={1} mb="md">NWAP Mini</Title>
        
        {isAuthenticated ? (
          <>
            <Group mb="md">
              <Text>Welcome, {user?.name}!</Text>
              <Button 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                color="red"
              >
                Logout
              </Button>
            </Group>
            <Text>You are logged in and can access protected resources.</Text>
          </>
        ) : (
          <>
            <Text mb="md">Please log in to access the application.</Text>
            <Button onClick={() => loginWithRedirect()}>Login</Button>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default App
