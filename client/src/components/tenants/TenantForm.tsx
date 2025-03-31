import React from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Switch,
  Select,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { useTenant } from '../../contexts/TenantContext';
import tenantService from '../../services/tenantService';

interface TenantFormProps {
  onSubmit: () => void;
}

export default function TenantForm({ onSubmit }: TenantFormProps) {
  const { loadTenants } = useTenant();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      adminEmail: '',
      settings: {
        allowPublicRegistration: false,
        requireAdminApproval: true,
        defaultUserRole: 'user' as const,
      },
    },

    validate: {
      name: (value) => (value.length < 2 ? 'Name is too short' : null),
      adminEmail: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await tenantService.createTenant(values);
      await loadTenants();
      onSubmit();
      form.reset();
    } catch (error) {
      console.error('Error creating tenant:', error);
      // You might want to show an error notification here
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing="md">
        <TextInput
          required
          label="Tenant Name"
          placeholder="Enter tenant name"
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description"
          placeholder="Enter tenant description"
          {...form.getInputProps('description')}
        />

        <TextInput
          required
          label="Admin Email"
          placeholder="Enter admin email"
          {...form.getInputProps('adminEmail')}
        />

        <Switch
          label="Allow Public Registration"
          {...form.getInputProps('settings.allowPublicRegistration', {
            type: 'checkbox',
          })}
        />

        <Switch
          label="Require Admin Approval"
          {...form.getInputProps('settings.requireAdminApproval', {
            type: 'checkbox',
          })}
        />

        <Select
          label="Default User Role"
          data={[
            { value: 'user', label: 'User' },
            { value: 'editor', label: 'Editor' },
          ]}
          {...form.getInputProps('settings.defaultUserRole')}
        />

        <Group position="right" mt="md">
          <Button type="submit">Create Tenant</Button>
        </Group>
      </Stack>
    </form>
  );
}