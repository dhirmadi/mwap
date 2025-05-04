import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core-v2/errors';
import { verifyProjectRole } from '../project';
import { ProjectModel } from '../../features-v2/projects/model';

jest.mock('../../features-v2/projects/model');

describe('Project Middleware', () => {
  const mockUser = {
    sub: 'user-123',
    tenantId: 'tenant-123',
  };

  const mockProject = {
    id: 'project-123',
    name: 'Test Project',
    tenantId: 'tenant-123',
    members: {
      'user-123': {
        role: 'OWNER',
        addedAt: new Date(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ProjectModel.findById as jest.Mock).mockResolvedValue(mockProject);
  });

  describe('verifyProjectRole', () => {
    it('should allow user with exact role', async () => {
      await verifyProjectRole(mockUser, 'project-123', ['OWNER']);
      // No error thrown
    });

    it('should allow user with any required role', async () => {
      await verifyProjectRole(mockUser, 'project-123', ['OWNER', 'DEPUTY']);
      // No error thrown
    });

    it('should block user without required role', async () => {
      await expect(
        verifyProjectRole(mockUser, 'project-123', ['MEMBER'])
      ).rejects.toThrow(AppError.forbidden('Insufficient permissions'));
    });

    it('should block user not in members list', async () => {
      await expect(
        verifyProjectRole({ ...mockUser, sub: 'other-user' }, 'project-123', ['OWNER'])
      ).rejects.toThrow(AppError.forbidden('Insufficient permissions'));
    });

    it('should block user from different tenant', async () => {
      await expect(
        verifyProjectRole({ ...mockUser, tenantId: 'other-tenant' }, 'project-123', ['OWNER'])
      ).rejects.toThrow(AppError.forbidden('Project belongs to a different tenant'));
    });

    it('should handle missing project', async () => {
      (ProjectModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        verifyProjectRole(mockUser, 'invalid', ['OWNER'])
      ).rejects.toThrow(AppError.notFound('Project not found'));
    });

    it('should handle missing user', async () => {
      await expect(
        verifyProjectRole(undefined as any, 'project-123', ['OWNER'])
      ).rejects.toThrow(AppError.unauthorized('User not authenticated'));
    });
  });
});