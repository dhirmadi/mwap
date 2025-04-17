import { AppShell, Container, Group, Title, Button, Menu } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PrivateRoute, TenantOwnerRoute } from './components/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { TenantAdmin } from './pages/TenantAdmin';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: true
    }
  }
});

function App() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppShell
        header={{ height: 60 }}
        padding="md"
      >
        <AppShell.Header>
          <Container size="lg">
            <Group h="100%" px="md" justify="space-between">
              <Group>
                <Title order={3} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  MWAP
                </Title>
              </Group>

              {isAuthenticated ? (
                <Group>
                  <Menu>
                    <Menu.Target>
                      <Button variant="subtle">
                        <Group>
                          {user?.picture && (
                            <img
                              src={user.picture}
                              alt={user.name}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                          {user?.name}
                        </Group>
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        component={Link}
                        to="/user/profile"
                        leftSection={<IconUser size="1rem" />}
                      >
                        Profile
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                        leftSection={<IconLogout size="1rem" />}
                        color="red"
                      >
                        Logout
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              ) : (
                <Button onClick={() => loginWithRedirect()}>
                  Login
                </Button>
              )}
            </Group>
          </Container>
        </AppShell.Header>

        <AppShell.Main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/user/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route
              path="/tenant/:id/manage"
              element={
                <TenantOwnerRoute>
                  <TenantAdmin />
                </TenantOwnerRoute>
              }
            />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
