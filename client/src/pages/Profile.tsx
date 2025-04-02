import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Select,
  Switch,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { User, useUserService, ProfileUpdateData } from '../services/userService';

export function Profile() {
  const { user: auth0User, isLoading: authLoading } = useAuth0();
  const userService = useUserService();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileUpdateData>({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      title: '',
      department: '',
      location: '',
      timezone: '',
      bio: '',
    },

    validate: {
      phoneNumber: (value) => 
        value && !/^\+?[\d\s-()]{8,}$/.test(value) 
          ? 'Invalid phone number format' 
          : null,
      bio: (value) => 
        value && value.length > 500 
          ? 'Bio must be less than 500 characters' 
          : null,
    },
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await userService.getCurrentUser();
        setUser(userData);
        form.setValues({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || '',
          title: userData.title || '',
          department: userData.department || '',
          location: userData.location || '',
          timezone: userData.timezone || '',
          bio: userData.bio || '',
        });
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSubmit = async (values: ProfileUpdateData) => {
    try {
      setSaving(true);
      setError(null);
      const updatedUser = await userService.updateProfile(values);
      setUser(updatedUser);
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Container size="md" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <div>
            <Title order={1}>Profile</Title>
            <Text color="dimmed">Manage your profile information</Text>
          </div>
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          )}
        </Group>

        <Paper p="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="md">
              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="Enter your first name"
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Enter your last name"
                  {...form.getInputProps('lastName')}
                />
              </Group>

              <TextInput
                label="Email"
                value={auth0User?.email || ''}
                disabled
                description="Email cannot be changed"
              />

              <TextInput
                label="Phone Number"
                placeholder="+1 (555) 555-5555"
                {...form.getInputProps('phoneNumber')}
              />

              <Group grow>
                <TextInput
                  label="Title"
                  placeholder="Enter your job title"
                  {...form.getInputProps('title')}
                />
                <TextInput
                  label="Department"
                  placeholder="Enter your department"
                  {...form.getInputProps('department')}
                />
              </Group>

              <Group grow>
                <TextInput
                  label="Location"
                  placeholder="Enter your location"
                  {...form.getInputProps('location')}
                />
                <Select
                  label="Timezone"
                  placeholder="Select your timezone"
                  data={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Chicago', label: 'Central Time' },
                    { value: 'America/Denver', label: 'Mountain Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' },
                  ]}
                  {...form.getInputProps('timezone')}
                />
              </Group>

              <Textarea
                label="Bio"
                placeholder="Tell us about yourself"
                minRows={3}
                {...form.getInputProps('bio')}
              />

              <Group position="right" mt="xl">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => form.reset()}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        {/* Preferences Section */}
        <Paper p="md" withBorder>
          <Title order={2} size="h3" mb="md">
            Preferences
          </Title>
          <Stack spacing="md">
            <Select
              label="Theme"
              defaultValue={user?.preferences.theme}
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              onChange={(value) =>
                userService.updatePreferences({
                  theme: value as 'light' | 'dark' | 'system',
                })
              }
            />
            <Switch
              label="Email Notifications"
              defaultChecked={user?.preferences.notifications.email}
              onChange={(event) =>
                userService.updatePreferences({
                  notifications: {
                    ...user?.preferences.notifications,
                    email: event.currentTarget.checked,
                  },
                })
              }
            />
            <Switch
              label="Push Notifications"
              defaultChecked={user?.preferences.notifications.push}
              onChange={(event) =>
                userService.updatePreferences({
                  notifications: {
                    ...user?.preferences.notifications,
                    push: event.currentTarget.checked,
                  },
                })
              }
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}