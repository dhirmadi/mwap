import { Card, Title, Text, Button, Group, Stack, Tooltip } from '@mantine/core';
import { IconCloud, IconTrash, IconPlus } from '@tabler/icons-react';
import { useCloudIntegrations } from '../../hooks/useCloudIntegrations';
import { IntegrationProvider } from '../../types/tenant';
import { LoadingState } from '../common';
import { getProviderToken } from '../../core/auth/oauth';

interface CloudIntegrationsProps {
  tenantId: string;
  isInUse?: (provider: IntegrationProvider) => boolean;
}

/**
 * Cloud integrations management component
 * Displays list of connected cloud providers and allows connecting/disconnecting
 */
export function CloudIntegrations({ tenantId, isInUse }: CloudIntegrationsProps) {
  const {
    integrations,
    isLoading,
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
  } = useCloudIntegrations(tenantId);

  if (isLoading) {
    return <LoadingState />;
  }

  const availableProviders: IntegrationProvider[] = ['GDRIVE', 'DROPBOX'];
  const connectedProviders = integrations.map(i => i.provider);
  const unconnectedProviders = availableProviders.filter(
    p => !connectedProviders.includes(p)
  );

  return (
    <Card withBorder>
      <Title order={3} mb="md">Connected Cloud Providers</Title>

      <Stack>
        {integrations.map(integration => (
          <Group key={integration.provider} justify="space-between" p="xs">
            <Group>
              <IconCloud size="1.5rem" />
              <div>
                <Text fw={500}>{integration.provider}</Text>
                <Text size="sm" c="dimmed">
                  Connected {new Date(integration.connectedAt).toLocaleDateString()}
                </Text>
              </div>
            </Group>

            <Tooltip
              label={isInUse?.(integration.provider)
                ? "This provider is in use and cannot be disconnected"
                : "Disconnect this provider"}
            >
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size="1rem" />}
                loading={isDisconnecting}
                disabled={isInUse?.(integration.provider)}
                onClick={() => disconnect(integration.provider)}
              >
                Disconnect
              </Button>
            </Tooltip>
          </Group>
        ))}

        {unconnectedProviders.map(provider => (
          <Group key={provider} justify="space-between" p="xs">
            <Group>
              <IconCloud size="1.5rem" />
              <Text fw={500}>{provider}</Text>
            </Group>

            <Button
              variant="light"
              leftSection={<IconPlus size="1rem" />}
              loading={isConnecting}
              onClick={async () => {
                // TODO: Implement OAuth flow to get token
                const token = await getProviderToken(provider);
                if (token) {
                  connect({ provider, token });
                }
              }}
            >
              Connect
            </Button>
          </Group>
        ))}

        {integrations.length === 0 && unconnectedProviders.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            No cloud providers available
          </Text>
        )}
      </Stack>
    </Card>
  );
}