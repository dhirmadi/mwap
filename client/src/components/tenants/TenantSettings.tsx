import React from 'react';
import {
  Card,
  Text,
  Switch,
  Select,
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTenant } from '../../contexts/TenantContext';
import tenantService from '../../services/tenantService';

export function TenantSettings() {
  const { currentTenant, loadTenants } = useTenant();

  const form = useForm({
    initialValues: {
      name: currentTenant?.name || '',
      description: currentTenant?.description || '',
      settings: {
        allowPublicRegistration: currentTenant?.settings.allowPublicRegistration || false,
        requireAdminApproval: currentTenant?.settings.requireAdminApproval || true,
        defaultUserRole: currentTenant?.settings.defaultUserRole || 'user',
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!currentTenant) return;

    try {
      await tenantService.updateTenant(currentTenant._id, values);
      await loadTenants();
      // You might want to show a success notification here
    } catch (error) {
      console.error('Error updating tenant:', error);
      // You might want to show an error notification here
    }
  };

  if (!currentTenant) {
    return null;
  }

  return (
    <Card shadow="sm" p="lg" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Text size="xl" weight={500}>
            Tenant Settings
          </Text>

          <TextInput
            label="Tenant Name"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            {...form.getInputProps('description')}
          />

          <Switch
            label="Allow Public Registration"
            description="Allow users to request access to this tenant"
            {...form.getInputProps('settings.allowPublicRegistration', {
              type: 'checkbox',
            })}
          />

          <Switch
            label="Require Admin Approval"
            description="New members must be approved by an admin"
            {...form.getInputProps('settings.requireAdminApproval', {
              type: 'checkbox',
            })}
          />

          <Select
            label="Default User Role"
            description="Role assigned to new members"
            data={[
              { value: 'user', label: 'User' },
              { value: 'editor', label: 'Editor' },
            ]}
            {...form.getInputProps('settings.defaultUserRole')}
          />

          <Group position="right" mt="xl">
            <Button type="submit">Save Changes</Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}