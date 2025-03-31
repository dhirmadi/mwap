import React, { useState } from 'react';
import { Container, Tabs } from '@mantine/core';
import { IconUsers, IconSettings, IconBuilding } from '@tabler/icons-react';
import { TenantList } from '../components/tenants/TenantList';
import { MemberList } from '../components/tenants/MemberList';
import { TenantSettings } from '../components/tenants/TenantSettings';
import { useTenant } from '../contexts/TenantContext';

export function TenantManagement() {
  const { currentTenant, userRole, isSuperAdmin } = useTenant();
  const [activeTab, setActiveTab] = useState<string | null>('tenants');

  const isAdmin = userRole === 'admin' || isSuperAdmin;

  return (
    <Container size="xl" py="xl">
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab
            value="tenants"
            icon={<IconBuilding size={14} />}
          >
            Tenants
          </Tabs.Tab>
          
          {currentTenant && (
            <Tabs.Tab
              value="members"
              icon={<IconUsers size={14} />}
            >
              Members
            </Tabs.Tab>
          )}

          {currentTenant && isAdmin && (
            <Tabs.Tab
              value="settings"
              icon={<IconSettings size={14} />}
            >
              Settings
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="tenants" pt="xl">
          <TenantList />
        </Tabs.Panel>

        {currentTenant && (
          <Tabs.Panel value="members" pt="xl">
            <MemberList />
          </Tabs.Panel>
        )}

        {currentTenant && isAdmin && (
          <Tabs.Panel value="settings" pt="xl">
            <TenantSettings />
          </Tabs.Panel>
        )}
      </Tabs>
    </Container>
  );
}