import React from 'react';
import { Container, Title, Tabs } from '@mantine/core';
import { IconUsers, IconSettings } from '@tabler/icons-react';
import { MemberList } from '../components/tenants/MemberList';
import { TenantSettings } from '../components/tenants/TenantSettings';

export function TenantAdminDashboard() {
  return (
    <Container size="xl">
      <Title order={2} mb="xl">Tenant Administration</Title>
      
      <Tabs defaultValue="members">
        <Tabs.List>
          <Tabs.Tab 
            value="members" 
            icon={<IconUsers size={14} />}
          >
            Members
          </Tabs.Tab>
          <Tabs.Tab 
            value="settings" 
            icon={<IconSettings size={14} />}
          >
            Settings
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="members" pt="xl">
          <MemberList />
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="xl">
          <TenantSettings />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}