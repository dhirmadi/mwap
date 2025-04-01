import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Paper,
  Avatar,
  Tabs,
  TextInput,
  Textarea,
  Select,
  Switch,
  Grid,
  Card,
  Badge,
  Divider,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUser,
  IconSettings,
  IconShield,
  IconBell,
  IconPencil,
  IconCheck,
  IconX,
  IconRefresh,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { User, useUserService, ProfileUpdateData } from '../services/userService';
import { useState } from 'react';

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
}

interface ProfileForm extends ProfileUpdateData {
  company: string;
  socialLinks: SocialLinks;
}

interface PreferencesForm {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
    security: boolean;
  };
  language: string;
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
  };
}

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      title: user?.title || '',
      bio: user?.bio || '',
      location: user?.location || '',
      timezone: user?.timezone || 'UTC',
      company: '',
      department: user?.department || '',
      phoneNumber: user?.phoneNumber || '',
      socialLinks: {
        github: '',
        linkedin: '',
        twitter: '',
      },
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

  const preferencesForm = useForm<PreferencesForm>({
    initialValues: {
      theme: user?.preferences?.theme || 'system',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
        updates: true,
        security: true,
      },
      language: 'en',
      accessibility: {
        reduceMotion: false,
        highContrast: false,
      },
    },
  });

  const userService = useUserService();

  const handleProfileSubmit = async (values: ProfileForm) => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract the profile update data
      const profileData: ProfileUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        title: values.title,
        bio: values.bio,
        location: values.location,
        timezone: values.timezone,
        department: values.department,
        phoneNumber: values.phoneNumber,
      };

      await userService.updateProfile(profileData);
      
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
      });
    } catch (error) {
      setError('Failed to update profile');
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (values: PreferencesForm) => {
    try {
      setLoading(true);
      setError(null);

      await userService.updatePreferences({
        theme: values.theme,
        notifications: {
          email: values.notifications.email,
          push: values.notifications.push,
        },
        language: values.language,
      });

      notifications.show({
        title: 'Preferences Updated',
        message: 'Your preferences have been successfully updated.',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
      });
    } catch (error) {
      setError('Failed to update preferences');
      notifications.show({
        title: 'Error',
        message: 'Failed to update preferences. Please try again.',
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          User profile not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />
      
      <Stack spacing="xl">
        {/* Profile Header */}
        <Paper shadow="sm" p="lg" withBorder>
          <Group justify="space-between" align="flex-start">
            <Group>
              <Avatar 
                src={user.picture} 
                size={100} 
                radius={100}
                alt={user.name}
              />
              <Stack gap="xs">
                <Title order={2}>{user.name}</Title>
                <Group gap="xs">
                  <Badge color="blue">Member</Badge>
                  <Badge color="gray">{user.email}</Badge>
                </Group>
                <Group gap="xs">
                  <Tooltip label="GitHub">
                    <ActionIcon variant="subtle" color="gray">
                      <IconBrandGithub size="1.2rem" />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="LinkedIn">
                    <ActionIcon variant="subtle" color="gray">
                      <IconBrandLinkedin size="1.2rem" />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Twitter">
                    <ActionIcon variant="subtle" color="gray">
                      <IconBrandTwitter size="1.2rem" />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Stack>
            </Group>
            <Button 
              variant="light"
              leftSection={<IconPencil size="1.1rem" />}
            >
              Edit Profile
            </Button>
          </Group>
        </Paper>

        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
            {error}
          </Alert>
        )}

        {/* Profile Content */}
        <Tabs defaultValue="profile">
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<IconUser size="1rem" />}>
              Profile
            </Tabs.Tab>
            <Tabs.Tab value="preferences" leftSection={<IconSettings size="1rem" />}>
              Preferences
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShield size="1rem" />}>
              Security
            </Tabs.Tab>
            <Tabs.Tab value="notifications" leftSection={<IconBell size="1rem" />}>
              Notifications
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile" pt="xl">
            <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
              <Stack>
                <Grid>
                  <Grid.Col span={6}>
                    <Card withBorder>
                      <Card.Section withBorder inheritPadding py="xs">
                        <Title order={3}>Personal Information</Title>
                      </Card.Section>
                      <Stack gap="md" p="md">
                        <TextInput
                          label="First Name"
                          placeholder="Enter your first name"
                          {...profileForm.getInputProps('firstName')}
                        />
                        <TextInput
                          label="Last Name"
                          placeholder="Enter your last name"
                          {...profileForm.getInputProps('lastName')}
                        />
                        <TextInput
                          label="Email"
                          value={user.email}
                          disabled
                          description="Email cannot be changed"
                        />
                        <TextInput
                          label="Phone Number"
                          placeholder="+1 (555) 555-5555"
                          {...profileForm.getInputProps('phoneNumber')}
                        />
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <Card withBorder>
                      <Card.Section withBorder inheritPadding py="xs">
                        <Title order={3}>Professional Information</Title>
                      </Card.Section>
                      <Stack gap="md" p="md">
                        <TextInput
                          label="Job Title"
                          placeholder="Enter your job title"
                          {...profileForm.getInputProps('title')}
                        />
                        <TextInput
                          label="Company"
                          placeholder="Enter your company name"
                          {...profileForm.getInputProps('company')}
                        />
                        <TextInput
                          label="Department"
                          placeholder="Enter your department"
                          {...profileForm.getInputProps('department')}
                        />
                        <Select
                          label="Time Zone"
                          placeholder="Select your time zone"
                          data={[
                            { value: 'UTC', label: 'UTC' },
                            { value: 'America/New_York', label: 'Eastern Time' },
                            { value: 'America/Chicago', label: 'Central Time' },
                            { value: 'America/Denver', label: 'Mountain Time' },
                            { value: 'America/Los_Angeles', label: 'Pacific Time' },
                          ]}
                          {...profileForm.getInputProps('timezone')}
                        />
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Card withBorder>
                      <Card.Section withBorder inheritPadding py="xs">
                        <Title order={3}>About Me</Title>
                      </Card.Section>
                      <Stack gap="md" p="md">
                        <Textarea
                          label="Bio"
                          placeholder="Tell us about yourself"
                          minRows={3}
                          {...profileForm.getInputProps('bio')}
                        />
                        <TextInput
                          label="Location"
                          placeholder="City, Country"
                          {...profileForm.getInputProps('location')}
                        />
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>

                <Divider />

                <Group justify="flex-end">
                  <Button 
                    variant="light" 
                    color="gray"
                    onClick={() => profileForm.reset()}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="preferences" pt="xl">
            <form onSubmit={preferencesForm.onSubmit(handlePreferencesSubmit)}>
              <Stack>
                <Grid>
                  <Grid.Col span={6}>
                    <Card withBorder>
                      <Card.Section withBorder inheritPadding py="xs">
                        <Title order={3}>Display Settings</Title>
                      </Card.Section>
                      <Stack gap="md" p="md">
                        <Select
                          label="Theme"
                          placeholder="Select theme"
                          data={[
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' },
                            { value: 'system', label: 'System' },
                          ]}
                          {...preferencesForm.getInputProps('theme')}
                        />
                        <Select
                          label="Language"
                          placeholder="Select language"
                          data={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Spanish' },
                            { value: 'fr', label: 'French' },
                          ]}
                          {...preferencesForm.getInputProps('language')}
                        />
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <Card withBorder>
                      <Card.Section withBorder inheritPadding py="xs">
                        <Title order={3}>Accessibility</Title>
                      </Card.Section>
                      <Stack gap="md" p="md">
                        <Switch
                          label="Reduce Motion"
                          description="Minimize animations throughout the interface"
                          {...preferencesForm.getInputProps('accessibility.reduceMotion', { type: 'checkbox' })}
                        />
                        <Switch
                          label="High Contrast"
                          description="Increase contrast for better visibility"
                          {...preferencesForm.getInputProps('accessibility.highContrast', { type: 'checkbox' })}
                        />
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Card withBorder>
                      <Card.Section withBorder inheritPadding py="xs">
                        <Title order={3}>Notification Preferences</Title>
                      </Card.Section>
                      <Stack gap="md" p="md">
                        <Switch
                          label="Email Notifications"
                          description="Receive important updates via email"
                          {...preferencesForm.getInputProps('notifications.email', { type: 'checkbox' })}
                        />
                        <Switch
                          label="Push Notifications"
                          description="Receive notifications in your browser"
                          {...preferencesForm.getInputProps('notifications.push', { type: 'checkbox' })}
                        />
                        <Switch
                          label="Product Updates"
                          description="Get notified about new features and improvements"
                          {...preferencesForm.getInputProps('notifications.updates', { type: 'checkbox' })}
                        />
                        <Switch
                          label="Security Alerts"
                          description="Receive notifications about security-related events"
                          {...preferencesForm.getInputProps('notifications.security', { type: 'checkbox' })}
                        />
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>

                <Divider />

                <Group justify="flex-end">
                  <Button 
                    variant="light" 
                    color="gray"
                    onClick={() => preferencesForm.reset()}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save Preferences
                  </Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="security" pt="xl">
            <Stack>
              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Title order={3}>Security Settings</Title>
                </Card.Section>
                <Stack gap="md" p="md">
                  <Text>
                    Security settings are managed through Auth0. Click the button below to access your security settings.
                  </Text>
                  <Button 
                    variant="light"
                    component="a"
                    href={`https://${import.meta.env.VITE_AUTH0_DOMAIN}/u/settings`}
                    target="_blank"
                  >
                    Manage Security Settings
                  </Button>
                </Stack>
              </Card>

              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Title order={3}>Active Sessions</Title>
                </Card.Section>
                <Stack gap="md" p="md">
                  <Text>
                    View and manage your active sessions across different devices.
                  </Text>
                  <Button variant="light">
                    View Active Sessions
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="notifications" pt="xl">
            <Stack>
              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Title order={3}>Recent Notifications</Title>
                </Card.Section>
                <Stack gap="md" p="md">
                  <Text color="dimmed">No recent notifications</Text>
                </Stack>
              </Card>

              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Title order={3}>Notification History</Title>
                </Card.Section>
                <Stack gap="md" p="md">
                  <Text color="dimmed">Your notification history will appear here</Text>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}