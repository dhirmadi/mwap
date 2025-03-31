import React, { useState } from 'react';
import {
  Table,
  Group,
  Text,
  ActionIcon,
  Menu,
  Button,
  Badge,
  Modal,
  TextInput,
  Select,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconUserPlus,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useTenant } from '../../contexts/TenantContext';

export function MemberList() {
  const {
    currentTenant,
    members,
    userRole,
    addMember,
    updateMemberRole,
    removeMember,
    handleJoinRequest,
  } = useTenant();

  const [addModalOpen, setAddModalOpen] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      role: 'user',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      role: (value) => (!value ? 'Role is required' : null),
    },
  });

  const handleAddMember = async (values: typeof form.values) => {
    try {
      await addMember(values.email, values.role);
      setAddModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding member:', error);
      // You might want to show an error notification here
    }
  };

  const isAdmin = userRole === 'admin';

  if (!currentTenant) {
    return null;
  }

  return (
    <>
      <Stack>
        <Group position="apart">
          <Text size="xl" weight={500}>
            Members - {currentTenant.name}
          </Text>
          {isAdmin && (
            <Button
              leftIcon={<IconUserPlus size={16} />}
              onClick={() => setAddModalOpen(true)}
            >
              Add Member
            </Button>
          )}
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <Group spacing="sm">
                    {member.picture && (
                      <img
                        src={member.picture}
                        alt={member.name}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                        }}
                      />
                    )}
                    <Text size="sm">{member.name}</Text>
                  </Group>
                </td>
                <td>{member.email}</td>
                <td>
                  <Badge
                    color={
                      member.membership.role === 'admin'
                        ? 'red'
                        : member.membership.role === 'editor'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    {member.membership.role}
                  </Badge>
                </td>
                <td>
                  <Badge
                    color={member.membership.status === 'approved' ? 'green' : 'yellow'}
                  >
                    {member.membership.status}
                  </Badge>
                </td>
                <td>
                  {isAdmin && member.membership.role !== 'admin' && (
                    <Menu>
                      <Menu.Target>
                        <ActionIcon>
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        {member.membership.status === 'pending' ? (
                          <>
                            <Menu.Item
                              icon={<IconCheck size={14} />}
                              onClick={() => handleJoinRequest(member.id, 'approve')}
                            >
                              Approve Request
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconX size={14} />}
                              color="red"
                              onClick={() => handleJoinRequest(member.id, 'reject')}
                            >
                              Reject Request
                            </Menu.Item>
                          </>
                        ) : (
                          <>
                            <Menu.Item
                              icon={<IconEdit size={14} />}
                              onClick={() =>
                                updateMemberRole(
                                  member.id,
                                  member.membership.role === 'user' ? 'editor' : 'user'
                                )
                              }
                            >
                              Toggle Role
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconTrash size={14} />}
                              color="red"
                              onClick={() => removeMember(member.id)}
                            >
                              Remove Member
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>

      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Member"
      >
        <form onSubmit={form.onSubmit(handleAddMember)}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="Enter member email"
              {...form.getInputProps('email')}
            />

            <Select
              required
              label="Role"
              data={[
                { value: 'user', label: 'User' },
                { value: 'editor', label: 'Editor' },
              ]}
              {...form.getInputProps('role')}
            />

            <Group position="right" mt="md">
              <Button type="submit">Add Member</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}