import React from 'react';
import { Container, Title, Card, Text, Avatar, Group, Stack } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';

export function Profile() {
  const { user } = useAuth0();

  return (
    <Container size="sm">
      <Title order={2} mb="xl">Profile</Title>
      <Card shadow="sm" p="lg">
        <Stack>
          <Group>
            <Avatar src={user?.picture} size="xl" radius="xl" />
            <div>
              <Text size="xl" weight={500}>{user?.name}</Text>
              <Text color="dimmed">{user?.email}</Text>
            </div>
          </Group>
          
          <Text size="sm" mt="md">
            Account details and preferences will be added here.
          </Text>
        </Stack>
      </Card>
    </Container>
  );
}