import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Modal,
  TextInput
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArchive, IconTrash } from '@tabler/icons-react';
import { useProjectAdmin } from '../hooks/useProjectAdmin';
import { LoadingState } from '../components/common';
import { handleApiError } from '../core/errors';
import { useProjectRole } from '../hooks/useProjectRole';
import { ProjectRole } from '../types';

/**
 * Project admin page with archive/delete actions
 * Only accessible to project admins
 */
export function ProjectAdmin() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const {
    project,
    isLoadingProject,
    projectError,
    archiveProject,
    isArchiving,
    deleteProject,
    isDeleting
  } = useProjectAdmin(id);

  const { role, isLoadingRole } = useProjectRole(id);

  // Only allow ADMIN access
  if (!isLoadingRole && role !== ProjectRole.ADMIN) {
    navigate('/');
    return null;
  }

  if (isLoadingProject || isLoadingRole) {
    return <LoadingState />;
  }

  if (projectError) {
    return (
      <Text c="red" ta="center">
        Error loading project: {projectError.message}
      </Text>
    );
  }

  if (!project) {
    return (
      <Text c="dimmed" ta="center">
        Project not found
      </Text>
    );
  }

  const handleArchive = async () => {
    try {
      await archiveProject();
      notifications.show({
        title: 'Success',
        message: 'Project archived successfully',
        color: 'green'
      });
      setArchiveModalOpen(false);
      navigate('/');
    } catch (error) {
      handleApiError(error, 'Failed to archive project');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== project.name) {
      notifications.show({
        title: 'Error',
        message: 'Project name does not match',
        color: 'red'
      });
      return;
    }

    try {
      await deleteProject();
      notifications.show({
        title: 'Success',
        message: 'Project deleted successfully',
        color: 'green'
      });
      setDeleteModalOpen(false);
      navigate('/');
    } catch (error) {
      handleApiError(error, 'Failed to delete project');
    }
  };

  return (
    <>
      <Card withBorder>
        <Stack>
          <Title order={2}>{project.name} Administration</Title>

          <Group mt="xl">
            <Button
              variant="light"
              color="yellow"
              leftSection={<IconArchive size="1rem" />}
              onClick={() => setArchiveModalOpen(true)}
              loading={isArchiving}
            >
              Archive Project
            </Button>

            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size="1rem" />}
              onClick={() => setDeleteModalOpen(true)}
              loading={isDeleting}
            >
              Delete Project
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Archive Confirmation Modal */}
      <Modal
        opened={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        title="Archive Project"
      >
        <Stack>
          <Text>
            Are you sure you want to archive {project.name}? This action can be
            undone later.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => setArchiveModalOpen(false)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <Button
              color="yellow"
              onClick={handleArchive}
              loading={isArchiving}
            >
              Archive Project
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
      >
        <Stack>
          <Text c="red">
            This action cannot be undone. This will permanently delete the project
            {project.name} and all associated data.
          </Text>

          <Text size="sm">
            Please type <strong>{project.name}</strong> to confirm.
          </Text>

          <TextInput
            placeholder="Enter project name"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={deleteConfirmName !== project.name}
            >
              Delete Project
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}