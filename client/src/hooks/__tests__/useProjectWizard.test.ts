import { renderHook, act } from '@testing-library/react';
import { useProjectWizard } from '../useProjectWizard';
import { useCreateProject } from '../useCreateProject';
import { showSuccessNotification, showRoleError } from '../../components/tenant/project-creation/errors';
import { handleApiError } from '../../utils/error';

// Mock dependencies
jest.mock('../useCreateProject');
jest.mock('../../components/tenant/project-creation/errors');
jest.mock('../../utils/error');

describe('useProjectWizard', () => {
  const mockTenantId = 'test-tenant';
  const mockProviders = ['GDRIVE', 'DROPBOX', 'BOX', 'ONEDRIVE'];
  const mockOnSuccess = jest.fn();

  const mockCreateProject = jest.fn();
  const mockIsLoading = false;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mocks
    (useCreateProject as jest.Mock).mockReturnValue({
      createProject: mockCreateProject,
      isLoading: mockIsLoading
    });
  });

  it('initializes with correct values', () => {
    const { result } = renderHook(() =>
      useProjectWizard({
        tenantId: mockTenantId,
        availableProviders: mockProviders,
        onSuccess: mockOnSuccess
      })
    );

    expect(result.current.wizard.values).toEqual({
      name: '',
      provider: 'GDRIVE',
      folderPath: ''
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('handles successful project creation', async () => {
    const { result } = renderHook(() =>
      useProjectWizard({
        tenantId: mockTenantId,
        availableProviders: mockProviders,
        onSuccess: mockOnSuccess
      })
    );

    const values = {
      name: 'test-project',
      provider: 'GDRIVE',
      folderPath: '/test/path'
    };

    await act(async () => {
      await result.current.wizard.onSubmit(values);
    });

    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'test-project',
      description: 'Project using GDRIVE at /test/path',
      provider: 'GDRIVE',
      folderPath: '/test/path',
      tenantId: mockTenantId
    });
    expect(showSuccessNotification).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('handles permission error', async () => {
    mockCreateProject.mockRejectedValueOnce({ status: 403 });

    const { result } = renderHook(() =>
      useProjectWizard({
        tenantId: mockTenantId,
        availableProviders: mockProviders,
        onSuccess: mockOnSuccess
      })
    );

    const values = {
      name: 'test-project',
      provider: 'GDRIVE',
      folderPath: '/test/path'
    };

    await act(async () => {
      await result.current.wizard.onSubmit(values);
    });

    expect(showRoleError).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles other errors', async () => {
    const error = new Error('API Error');
    mockCreateProject.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useProjectWizard({
        tenantId: mockTenantId,
        availableProviders: mockProviders,
        onSuccess: mockOnSuccess
      })
    );

    const values = {
      name: 'test-project',
      provider: 'GDRIVE',
      folderPath: '/test/path'
    };

    await act(async () => {
      await result.current.wizard.onSubmit(values);
    });

    expect(handleApiError).toHaveBeenCalledWith(error, 'Failed to create project');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});