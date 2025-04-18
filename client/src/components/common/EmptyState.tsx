import { Button, Center, Stack, Text } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Icon to display above the message */
  readonly icon: React.ReactNode;
  /** Message to display */
  readonly message: string;
  /** Text for the action button */
  readonly buttonText: string;
  /** Callback when action button is clicked */
  readonly onAction: () => void;
}

/**
 * Display empty state with icon, message and action button
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<IconFolderOff size="2rem" />}
 *   message="No folders found"
 *   buttonText="Refresh"
 *   onAction={handleRefresh}
 * />
 * ```
 */
export function EmptyState({ icon, message, buttonText, onAction }: EmptyStateProps): JSX.Element {
  return (
    <Center py="xl">
      <Stack align="center" gap="md">
        {icon}
        <Text c="dimmed" size="sm">{message}</Text>
        <Button 
          variant="light" 
          leftSection={<IconRefresh size="1rem" />}
          onClick={onAction}
        >
          {buttonText}
        </Button>
      </Stack>
    </Center>
  );
}