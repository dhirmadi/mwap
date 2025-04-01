import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Button, Text, Avatar, Group, UnstyledButton, rem } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { useTenant } from '../../contexts/TenantContext';
import {
  IconChevronDown,
  IconUserCircle,
  IconLogout,
  IconSettings,
  IconBuildingCommunity,
  IconUsers,
} from '@tabler/icons-react';

export function UserMenu() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const { isSuperAdmin, userRole } = useTenant();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Button onClick={() => loginWithRedirect()}>
        Login
      </Button>
    );
  }

  const menuItems = [
    // Profile - available to all users
    {
      icon: <IconUserCircle size={rem(16)} />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },

    // Site Administration - super admins only
    ...(isSuperAdmin ? [
      {
        icon: <IconBuildingCommunity size={rem(16)} />,
        label: 'Site Administration',
        onClick: () => navigate('/admin'),
      }
    ] : []),

    // Tenant Administration - tenant admins only
    ...(userRole === 'admin' ? [
      {
        icon: <IconUsers size={rem(16)} />,
        label: 'Tenant Administration',
        onClick: () => navigate('/tenant-admin'),
      }
    ] : []),

    // Settings - available to all users
    {
      icon: <IconSettings size={rem(16)} />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },

    // Logout - available to all users
    {
      icon: <IconLogout size={rem(16)} />,
      label: 'Logout',
      onClick: () => logout({ returnTo: window.location.origin }),
      color: 'red',
    },
  ];

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group spacing={7}>
            <Avatar 
              src={user?.picture} 
              alt={user?.name} 
              radius="xl" 
              size={20}
            />
            <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
              {user?.name}
            </Text>
            <IconChevronDown size={rem(12)} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {menuItems.map((item, index) => (
          <Menu.Item
            key={index}
            icon={item.icon}
            onClick={item.onClick}
            color={item.color}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}