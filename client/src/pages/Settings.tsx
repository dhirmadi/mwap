import React from 'react';
import { Container, Title, Card, Stack, Switch, Text } from '@mantine/core';

export function Settings() {
  return (
    <Container size="sm">
      <Title order={2} mb="xl">Settings</Title>
      <Card shadow="sm" p="lg">
        <Stack>
          <Switch
            label="Email Notifications"
            description="Receive email notifications for important updates"
          />
          
          <Switch
            label="Two-Factor Authentication"
            description="Enable 2FA for additional security"
          />
          
          <Text size="sm" mt="md" color="dimmed">
            More settings will be added here.
          </Text>
        </Stack>
      </Card>
    </Container>
  );
}