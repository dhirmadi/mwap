import { Card, Text, TextInput, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useInvites } from '../../hooks/useInvites';
import { useState } from 'react';

export function RedeemInvite() {
  const { redeemInvite, isRedeeming, error } = useInvites();
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = inviteCode.trim();
    if (!code) return;

    // Validate code format (6-32 alphanumeric)
    if (!/^[a-zA-Z0-9]{6,32}$/.test(code)) {
      notifications.show({
        title: 'Invalid Code',
        message: 'Invite code must be 6-32 alphanumeric characters',
        color: 'red'
      });
      return;
    }

    try {
      await redeemInvite(code);
      
      // Show success notification
      notifications.show({
        title: 'Success',
        message: 'Successfully joined project',
        color: 'green'
      });
      
      // Clear input
      setInviteCode('');
    } catch (error) {
      // Error is already handled by the hook and shown in the form
      console.error('[RedeemInvite] Error:', error);
    }
  };

  // Get error message based on error type
  const getErrorMessage = () => {
    if (!error) return '';
    return error instanceof Error ? error.message : 'Failed to redeem invite';
  };

  return (
    <Card withBorder p="md">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Text size="sm" c="dimmed">Join a Project</Text>
          
          <TextInput
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            error={getErrorMessage()}
            disabled={isRedeeming}
            data-testid="invite-code-input"
            description="Enter a 6-32 character invite code"
          />

          <Group justify="flex-end">
            <Button 
              type="submit" 
              loading={isRedeeming}
              disabled={!inviteCode.trim()}
              data-testid="redeem-invite-button"
            >
              Join Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}