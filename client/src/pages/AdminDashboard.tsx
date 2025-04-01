import React from 'react';
import { Container, Title, Tabs } from '@mantine/core';
import { IconBuildingCommunity, IconUsers } from '@tabler/icons-react';
import { TenantList } from '../components/tenants/TenantList';
import { MemberList } from '../components/tenants/MemberList';

export function AdminDashboard() {
  return (
    <Container size="xl">
      <Title order={2} mb="xl">Site Administration</Title>
      
      <Tabs defaultValue="tenants">
        <Tabs.List>
          <Tabs.Tab 
            value="tenants" 
            icon={<IconBuildingCommunity size={14} />}
          >
            Tenants
          </Tabs.Tab>
          <Tabs.Tab 
            value="users" 
            icon={<IconUsers size={14} />}
          >
            Users
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tenants" pt="xl">
          <TenantList />
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="xl">
          <MemberList />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}