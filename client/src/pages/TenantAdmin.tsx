import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Title, Group, Button, Stack } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTenantById } from '../hooks/useTenantById';
import { LoadingState } from '../components/common';
import { CloudIntegrations, TenantProjects } from '../components/tenant';

/**
 * Tenant admin page component
 * Displays tenant management interface for tenant owners
 */
export function TenantAdmin(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { tenant, isLoading, error } = useTenantById(id!);

  useEffect(() => {
    console.log(`Rendering tenant admin page for tenant ${id}`);
  }, [id]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !tenant) {
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