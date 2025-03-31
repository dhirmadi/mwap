import { AppShell, Container, Group, Title, Button } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { TenantProvider } from './contexts/TenantContext';
import { Home } from './pages/Home';
import { TenantManagement } from './pages/TenantManagement';

function App() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="lg">
          <Group h="100%" px="md" position="apart">
            <Title order={3}>NWAP Mini</Title>
            <Group>
              {isAuthenticated ? (
                <>
                  <span>{user?.email}</span>
                  <Button variant="light" onClick={() => logout()}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => loginWithRedirect()}>
                  Login
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <TenantProvider>
          {isAuthenticated ? <TenantManagement /> : <Home />}
        </TenantProvider>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
