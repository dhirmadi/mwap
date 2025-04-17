import { Card, Title, Text, Button, Group, Stack, Tooltip } from '@mantine/core';
import { IconTrash, IconPlus, IconBrandGoogleDrive, IconFolder, IconBox, IconBrandOnedrive } from '@tabler/icons-react';
import { useCloudIntegrations } from '../../hooks/useCloudIntegrations';
import { IntegrationProvider } from '../../types/tenant';
import { LoadingState } from '../common';


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

  const availableProviders: IntegrationProvider[] = ['gdrive', 'dropbox', 'box', 'onedrive'];
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
              {integration.provider === 'gdrive' && <IconBrandGoogleDrive size="1.5rem" />}
              {integration.provider === 'dropbox' && <IconFolder size="1.5rem" />}
              {integration.provider === 'box' && <IconBox size="1.5rem" />}
              {integration.provider === 'onedrive' && <IconBrandOnedrive size="1.5rem" />}
              <div>
                <Text fw={500}>
                  {integration.provider === 'gdrive' && 'Google Drive'}
                  {integration.provider === 'dropbox' && 'Dropbox'}
                  {integration.provider === 'box' && 'Box'}
                  {integration.provider === 'onedrive' && 'OneDrive'}
                </Text>
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
              {provider === 'gdrive' && <IconBrandGoogleDrive size="1.5rem" />}
              {provider === 'dropbox' && <IconFolder size="1.5rem" />}
              {provider === 'box' && <IconBox size="1.5rem" />}
              {provider === 'onedrive' && <IconBrandOnedrive size="1.5rem" />}
              <Text fw={500}>
                {provider === 'gdrive' && 'Google Drive'}
                {provider === 'dropbox' && 'Dropbox'}
                {provider === 'box' && 'Box'}
                {provider === 'onedrive' && 'OneDrive'}
              </Text>
            </Group>

            <Group>
              <Button
                variant="light"
                leftSection={<IconPlus size="1rem" />}
                loading={isConnecting}
                onClick={() => connect(provider)}
              >
                Connect
              </Button>
            </Group>
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