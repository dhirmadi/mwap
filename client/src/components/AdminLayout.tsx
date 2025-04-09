import { useAuth0 } from '@auth0/auth0-react';
import { Outlet } from 'react-router-dom';
import { Container, Group, Title, Text, Button } from '@mantine/core';

/**
 * Layout component for super admin routes that provides a consistent look
 * without relying on tenant context.
 */
export default function AdminLayout() {
  const { user, logout } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title */}
            <div className="flex-shrink-0">
              <Title order={1} className="text-white text-xl font-semibold">
                MWAP Admin Panel
              </Title>
            </div>

            {/* Right: User Info & Logout */}
            <Group spacing="md">
              {user?.email && (
                <Text className="text-gray-300 text-sm hidden md:block">
                  {user.email}
                </Text>
              )}
              <Button
                variant="subtle"
                color="gray"
                onClick={handleLogout}
                className="text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </Button>
            </Group>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <Container size="xl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}