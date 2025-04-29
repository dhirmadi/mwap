import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Title, Group, Button, Stack } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTenant } from '../hooks/useTenant';
import { LoadingState } from '../components/common';
import { CloudIntegrations, TenantProjects } from '../components/tenant';

export function TenantAdmin(): JSX.Element {
  const { id } = useParams<{ id: string }>(); // Still get id from route for TenantProjects and CloudIntegrations
  const { tenant, isLoadingTenant, tenantError } = useTenant();

  useEffect(() => {
    console.log(`Rendering tenant admin page for tenant id=${id}`);
  }, [id]);

  if (isLoadingTenant) {
    return <LoadingState />;
  }

  if (tenantError || !tenant) {
    return (
      <Container>
        <Title order={2} mb="lg">Error Loading Tenant</Title>
        <Button component={Link} to="/user/profile" leftSection={<IconArrowLeft size="1rem" />}>
          Back to Profile
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Group mb="xl">
        <Button 
          component={Link} 
          to="/user/profile" 
          variant="subtle" 
          leftSection={<IconArrowLeft size="1rem" />}
        >
          Back to Profile
        </Button>
      </Group>

      <Title order={2} mb="lg">
        Tenant Admin: {tenant.name}
      </Title>

      <Stack spacing="xl">
        <CloudIntegrations tenantId={tenant.id} />
        <TenantProjects tenantId={tenant.id} />
      </Stack>
    </Container>
  );
}
