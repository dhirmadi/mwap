import React, { useState } from 'react';
import { Card, Text, Button, Group, Stack, Badge, Modal } from '@mantine/core';
import { IconPlus, IconUsers, IconSettings } from '@tabler/icons-react';
import { useTenant } from '../../contexts/TenantContext';
import { Tenant } from '../../services/tenantService';
import TenantForm from './TenantForm';

export function TenantList() {
  const { tenants, isSuperAdmin, setCurrentTenant } = useTenant();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleTenantSelect = (tenant: Tenant) => {
    setCurrentTenant(tenant);
  };

  return (
    <>
      <Stack>
        <Group position="apart">
          <Text size="xl" weight={500}>
            Tenants
          </Text>
          {isSuperAdmin && (
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Tenant
            </Button>
          )}
        </Group>

        <Stack spacing="md">
          {tenants.map((tenant) => (
            <Card key={tenant._id} shadow="sm" p="lg" radius="md" withBorder>
              <Group position="apart" mb="xs">
                <Text weight={500}>{tenant.name}</Text>
                <Badge
                  color={tenant.status === 'active' ? 'green' : 'red'}
                  variant="light"
                >
                  {tenant.status}
                </Badge>
              </Group>

              <Text size="sm" color="dimmed" mb="md">
                {tenant.description || 'No description provided'}
              </Text>

              <Text size="xs" color="dimmed">
                Members: {tenant.memberCount || 0}
              </Text>

              <Group position="right" mt="md">
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  leftIcon={<IconUsers size={16} />}
                  onClick={() => handleTenantSelect(tenant)}
                >
                  Manage Members
                </Button>
                {(isSuperAdmin || tenant.status === 'active') && (
                  <Button
                    variant="light"
                    color="gray"
                    size="sm"
                    leftIcon={<IconSettings size={16} />}
                    onClick={() => handleTenantSelect(tenant)}
                  >
                    Settings
                  </Button>
                )}
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Tenant"
        size="lg"
      >
        <TenantForm onSubmit={() => setCreateModalOpen(false)} />
      </Modal>
    </>
  );
}