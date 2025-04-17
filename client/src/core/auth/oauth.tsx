import { IntegrationProvider } from '../../types/tenant';
import { modals } from '@mantine/modals';
import { TokenInput } from '../../components/tenant/TokenInput';

/**
 * Opens a modal dialog to get the access token from the user
 * @returns A promise that resolves to the token string or null if cancelled
 */
export function getProviderToken(provider: IntegrationProvider): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    modals.open({
      title: `Connect ${provider}`,
      children: (
        <TokenInput
          provider={provider}
          onSubmit={(token: string) => {
            modals.closeAll();
            resolve(token);
          }}
        />
      ),
      onClose: () => resolve(null),
    });
  });
}