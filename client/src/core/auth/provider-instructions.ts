import { IntegrationProvider } from '../../types/tenant';

const PROVIDER_INSTRUCTIONS: Record<IntegrationProvider, string> = {
  gdrive: "To connect Google Drive:\n1. Go to your Google Drive\n2. Click the Settings icon (gear) in the top right\n3. Click \"Settings\"\n4. Go to \"Manage Apps\"\n5. Generate and copy your access token",
  dropbox: "To connect Dropbox:\n1. Go to your Dropbox account settings\n2. Go to \"Security\"\n3. Under \"Access tokens\", generate a new token\n4. Copy the generated token",
  box: "To connect Box:\n1. Go to your Box account settings\n2. Navigate to the Developer Console\n3. Create a new App or select an existing one\n4. Generate and copy your access token",
  onedrive: "To connect OneDrive:\n1. Go to your Microsoft account settings\n2. Navigate to Connected Apps\n3. Generate a new access token\n4. Copy the generated token"
};

export function getProviderInstructions(provider: IntegrationProvider): string {
  return PROVIDER_INSTRUCTIONS[provider];
}