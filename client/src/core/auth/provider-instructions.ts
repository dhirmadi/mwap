import { IntegrationProvider } from '../../types/tenant';

const PROVIDER_INSTRUCTIONS: Record<IntegrationProvider, string> = {
  GDRIVE: "To connect Google Drive:\n1. Go to your Google Drive\n2. Click the Settings icon (gear) in the top right\n3. Click \"Settings\"\n4. Go to \"Manage Apps\"\n5. Generate and copy your access token",
  DROPBOX: "To connect Dropbox:\n1. Go to your Dropbox account settings\n2. Go to \"Security\"\n3. Under \"Access tokens\", generate a new token\n4. Copy the generated token"
};

export function getProviderInstructions(provider: IntegrationProvider): string {
  return PROVIDER_INSTRUCTIONS[provider];
}