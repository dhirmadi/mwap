import { IntegrationProvider } from '../../types/tenant';
import { modals } from '@mantine/modals';
import { TextInput, Stack, Text } from '@mantine/core';

/**
 * Opens a modal dialog to get the access token from the user
 */
export async function getProviderToken(provider: IntegrationProvider): Promise<string | null> {
  return new Promise((resolve) => {
    modals.open({
      title: `Connect ${provider}`,
      children: (
        <Stack>
          <Text size="sm">
            {provider === 'GDRIVE' ? (
              <>
                To connect Google Drive:
                <ol>
                  <li>Go to your Google Drive</li>
                  <li>Click the Settings icon (gear) in the top right</li>
                  <li>Click "Settings"</li>
                  <li>Go to "Manage Apps"</li>
                  <li>Generate and copy your access token</li>
                </ol>
              </>
            ) : (
              <>
                To connect Dropbox:
                <ol>
                  <li>Go to your Dropbox account settings</li>
                  <li>Go to "Security"</li>
                  <li>Under "Access tokens", generate a new token</li>
                  <li>Copy the generated token</li>
                </ol>
              </>
            )}
          </Text>
          <TextInput
            label="Access Token"
            placeholder="Paste your access token here"
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const token = e.currentTarget.value.trim();
                if (token) {
                  modals.closeAll();
                  resolve(token);
                }
              }
            }}
          />
          <Text size="xs" c="dimmed">
            Press Enter to submit
          </Text>
        </Stack>
      ),
      onClose: () => resolve(null),
    });
  });
}