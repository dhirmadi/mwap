import { Stack, Loader, Text } from '@mantine/core';

/**
 * Loading state component with centered spinner and text
 * 
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <LoadingState />;
 * }
 * ```
 */
export function LoadingState(): JSX.Element {
  return (
    <Stack align="center" py="xl">
      <Loader size="lg" />
      <Text size="sm" c="dimmed">Loading...</Text>
    </Stack>
  );
}