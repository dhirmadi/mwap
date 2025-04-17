import { Stack, Text, TextInput } from '@mantine/core';
import { IntegrationProvider } from '../../types/tenant';
import { getProviderInstructions } from '../../core/auth/provider-instructions';

interface TokenInputProps {
  provider: IntegrationProvider;
  onSubmit: (token: string) => void;
}

export function TokenInput({ provider, onSubmit }: TokenInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const token = e.currentTarget.value.trim();
      if (token) onSubmit(token);
    }
  };

  return (
    <Stack>
      <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
        {getProviderInstructions(provider)}
      </Text>
      <TextInput
        label="Access Token"
        placeholder="Paste your access token here"
        required
        onKeyDown={handleKeyDown}
      />
      <Text size="xs" c="dimmed">Press Enter to submit</Text>
    </Stack>
  );
}