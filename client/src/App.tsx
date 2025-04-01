import { AppShell, Container, Group, Title, Button, Menu } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { IconUser, IconLogout } from '@tabler/icons-react';
import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { ProfileProvider } from './contexts/ProfileContext';

function App() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
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
                        to="/profile"
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
              path="/profile"
              element={
                <ProfileProvider>
                  <Profile />
                </ProfileProvider>
              }
            />
          </Routes>
        </AppShell.Main>
      </AppShell>
  );
}

export default App;
