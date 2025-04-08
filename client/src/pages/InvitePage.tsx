import { Container, Stack, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export default function InvitePage() {
  const { tenantId } = useParams();

  return (
    <Container size="lg">
      <Stack spacing="xl" py="xl">
        <Title order={1} ta="center">
          Invite Users
        </Title>
        
        <Text c="dimmed" ta="center" size="lg">
          This is a placeholder for the Invite Users page where tenant admins and deputies can invite new members.
        </Text>
        
        <Text c="dimmed" ta="center" size="sm">
          Current Tenant ID: {tenantId}
        </Text>
        
        <Text c="dimmed" ta="center" size="sm">
          Coming soon: Email invitation form with role selection and bulk invite capabilities.
        </Text>
      </Stack>
    </Container>
  );
}