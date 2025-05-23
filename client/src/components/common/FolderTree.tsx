import { useState } from 'react';
import {
  Box,
  Text,
  Group,
  UnstyledButton,
  Stack,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { 
  IconFolder, 
  IconFolderOpen, 
  IconChevronRight, 
  IconSearch,
  IconFolderOff,
  IconLock,
} from '@tabler/icons-react';
import { useCloudFolders } from '../../hooks/useCloudFolders';
import { useCloudIntegrations } from '../../hooks/useCloudIntegrations';
import { IntegrationProvider } from '../../types/tenant';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorDisplay } from './ErrorDisplay';

/**
 * Props for FolderTree component
 */
interface FolderTreeProps {
  /** Tenant ID for folder access */
  readonly tenantId: string;
  /** Cloud provider type */
  readonly provider: IntegrationProvider;
  /** Callback when a folder is selected */
  readonly onSelect: (path: string) => void;
  /** Currently selected folder path */
  readonly selectedPath?: string;
}

/**
 * Props for FolderNode component
 */
interface FolderNodeProps {
  /** Tenant ID for folder access */
  readonly tenantId: string;
  /** Cloud provider type */
  readonly provider: IntegrationProvider;
  /** Unique identifier for the folder */
  readonly folderId: string;
  /** Display name of the folder */
  readonly name: string;
  /** Full path to the folder */
  readonly path: string;
  /** Nesting level for indentation */
  readonly level: number;
  /** Whether the folder has subfolders */
  readonly hasChildren: boolean;
  /** Whether this folder is currently selected */
  readonly isSelected: boolean;
  /** Callback when folder is selected */
  readonly onSelect: (path: string) => void;
  /** Currently selected folder path */
  readonly selectedPath?: string;
}

/**
 * Renders a single folder node with expand/collapse functionality
 */
function FolderNode({
  tenantId,
  provider,
  folderId,
  name,
  path,
  level,
  hasChildren,
  isSelected,
  onSelect,
  selectedPath,
}: FolderNodeProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { data: subFolders, isLoading, error, refetch } = useCloudFolders(
    tenantId,
    provider,
    folderId,
    undefined
  );

  return (
    <Box>
      <UnstyledButton
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          }
        }}
        onDoubleClick={() => {
          onSelect(path);
        }}
        style={{ 
          width: '100%',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : undefined,
          borderRadius: 'var(--mantine-radius-sm)',
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-0)'
          }
        }}
      >
        <Group gap="xs" pl={level * 20} py="xs">
          {hasChildren && (
            <IconChevronRight
              size="1rem"
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'none',
                transition: 'transform 200ms ease',
              }}
            />
          )}
          <Checkbox
            checked={isSelected}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                onSelect(path);
              } else if (selectedPath === path) {
                onSelect(''); // Deselect if unchecking current selection
              }
            }}
            onClick={(e) => e.stopPropagation()} // Prevent folder expand/collapse
          />
          {isOpen ? (
            <IconFolderOpen size="1.2rem" />
          ) : (
            <IconFolder size="1.2rem" />
          )}
          <Text size="sm">{name}</Text>
        </Group>
      </UnstyledButton>

      {isOpen && (
        <Box pl={10}>
          {isLoading ? (
            <Box pl={level * 20}>
              <LoadingState />
            </Box>
          ) : error ? (
            <Box pl={level * 20}>
              <ErrorDisplay 
                error={error} 
                title="Failed to load subfolders"
              />
            </Box>
          ) : !subFolders?.length ? (
            <Box pl={level * 20}>
              <EmptyState
                icon={<IconFolderOff size="1.5rem" color="var(--mantine-color-gray-6)" />}
                message="No subfolders found"
                buttonText="Refresh"
                onAction={refetch}
              />
            </Box>
          ) : (
            subFolders.map((folder) => (
              <FolderNode
                key={folder.id}
                tenantId={tenantId}
                provider={provider}
                folderId={folder.id}
                name={folder.name}
                path={folder.path}
                level={level + 1}
                hasChildren={folder.hasChildren}
                isSelected={folder.path === selectedPath}
                onSelect={onSelect}
                selectedPath={selectedPath}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

/**
 * Folder tree component for browsing cloud provider folders
 * Supports search, folder selection, and nested folder browsing
 *
 * @example
 * ```tsx
 * <FolderTree
 *   tenantId="tenant-123"
 *   provider="dropbox"
 *   onSelect={(path) => console.log('Selected:', path)}
 *   selectedPath="/Documents"
 * />
 * ```
 */
export function FolderTree({
  tenantId,
  provider,
  onSelect,
  selectedPath,
}: FolderTreeProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);

  // Check cloud integration status
  const {
    integrations,
    isLoading: isLoadingIntegrations,
    error: integrationsError
  } = useCloudIntegrations(tenantId);

  // Find the current provider's integration
  const currentIntegration = integrations.find(
    i => i.provider.toUpperCase() === provider.toUpperCase()
  );

  // Fetch folders only if integration exists
  const {
    data: rootFolders,
    isLoading: isLoadingFolders,
    error: foldersError,
    refetch
  } = useCloudFolders(
    tenantId,
    provider,
    undefined,
    debouncedSearch,
    {
      enabled: !!currentIntegration
    }
  );

  const isLoading = isLoadingIntegrations || isLoadingFolders;
  const error = integrationsError || foldersError;

  return (
    <Stack>
      <TextInput
        placeholder="Search folders..."
        leftSection={<IconSearch size="0.9rem" />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />

      {isLoading ? (
        <LoadingState />
      ) : error?.status === 404 ? (
        <EmptyState
          icon={<IconFolderOff size="2rem" color="var(--mantine-color-yellow-6)" />}
          message={`${provider} integration not found`}
          description="Please connect your cloud provider account to access folders."
          buttonText="Connect Provider"
          onAction={() => {
            // Open integrations page in new tab to avoid losing state
            window.open(`/tenant/${tenantId}/settings/integrations`, '_blank');
          }}
        />
      ) : error?.status === 401 || error?.status === 403 ? (
        <EmptyState
          icon={<IconLock size="2rem" color="var(--mantine-color-red-6)" />}
          message={`Access denied to ${provider} folders`}
          description="Your cloud provider session may have expired. Please reconnect your account."
          buttonText="Reconnect"
          onAction={() => {
            // Open in new tab to avoid losing state
            window.open(`/tenant/${tenantId}/settings/integrations`, '_blank');
          }}
        />
      ) : error ? (
        <ErrorDisplay 
          error={error} 
          title={`Failed to load ${provider} folders`}
          description="An unexpected error occurred while fetching your folders."
        />
      ) : !rootFolders?.length ? (
        <EmptyState
          icon={<IconFolderOff size="2rem" color="var(--mantine-color-gray-6)" />}
          message={search ? "No matching folders found" : "No folders found"}
          buttonText="Refresh"
          onAction={refetch}
        />
      ) : (
        <Box>
          {rootFolders.map((folder) => (
            <FolderNode
              key={folder.id}
              tenantId={tenantId}
              provider={provider}
              folderId={folder.id}
              name={folder.name}
              path={folder.path}
              level={0}
              hasChildren={folder.hasChildren}
              isSelected={folder.path === selectedPath}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
}