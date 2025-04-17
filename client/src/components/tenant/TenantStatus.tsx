import { Card, Text, TextInput, Button, Group, Stack, Skeleton, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTenant } from '../../hooks/useTenant';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function TenantStatus() {
  const { tenant, isLoading, error, createTenant, isCreating, createError } = useTenant();
  const [newTenantName, setNewTenantName] = useState('');

  if (isLoading) {
    return (
      <Card withBorder p="md">
        <Stack>
          <Skeleton height={20} width="60%" />
          <Skeleton height={36} />
        </Stack>
      </Card>
    );
  }

  if (error) {
    console.error('[TenantStatus] Error:', error);
    return (
      <Card withBorder p="md">
        <Text c="red">Error loading workspace information. Please try again later.</Text>
      </Card>
    );
  }

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    try {
      await createTenant({ name: newTenantName.trim() });
      notifications.show({
        title: 'Success',
        message: 'Workspace created successfully',
        color: 'green'
      });
      setNewTenantName('');
    } catch (error) {
      console.error('[TenantStatus] Create Error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create workspace. Please try again.',
        color: 'red'
      });
    }
  };

  if (tenant) {
    console.log('[TenantStatus] Tenant data:', tenant);
    return (
      <Card withBorder p="md">
        <Text size="sm" c="dimmed">Your Workspace</Text>
        <Anchor component={Link} to={`/tenant/${tenant.id}/manage`} size="xl" fw={500}>
          {tenant.name}
        </Anchor>
      </Card>
    );
  }

  return (
    <Card withBorder p="md">
      <form onSubmit={handleCreateTenant}>
        <Stack>
          <Text size="sm" c="dimmed">Create Your Workspace</Text>
          <TextInput
            placeholder="Enter workspace name"
            value={newTenantName}
            onChange={(e) => setNewTenantName(e.target.value)}
            error={createError ? 'Failed to create workspace' : ''}
            disabled={isCreating}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={isCreating}>
              Create Workspace
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}