import { AppError } from '../../../core-v2/errors';
import { logger } from '../../../core-v2/logger';
import { verifyProjectRole } from '../../projects/members';
import { ProjectModel } from '../../projects/model';
import { InviteModel } from '../model';
import { InviteService } from '../service';

jest.mock('../../../core-v2/logger');
jest.mock('../../projects/members');
jest.mock('../../projects/model');
jest.mock('../model');

describe('InviteService', () => {
  let service: InviteService;
  const mockUser = {
    sub: 'user-123',
    tenantId: 'tenant-123',
  };

  const mockInvite = {
    id: 'invite-123',
    code: 'ABC123XYZ',
    projectId: 'project-123',
    tenantId: 'tenant-123',
    role: 'MEMBER' as const,
    createdBy: 'user-123',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const mockProject = {
    id: 'project-123',
    name: 'Test Project',
    status: 'active' as const,
    members: {},
  };

  beforeEach(() => {
    service = new InviteService();
    jest.clearAllMocks();

    // Mock project operations
    (ProjectModel.findById as jest.Mock).mockResolvedValue(mockProject);
    (ProjectModel.update as jest.Mock).mockResolvedValue(undefined);

    // Mock invite operations
    (InviteModel.findOne as jest.Mock).mockResolvedValue(mockInvite);
    (InviteModel.findMany as jest.Mock).mockResolvedValue([mockInvite]);
    (InviteModel.create as jest.Mock).mockResolvedValue(undefined);
    (InviteModel.update as jest.Mock).mockResolvedValue(undefined);
    (InviteModel.delete as jest.Mock).mockResolvedValue(undefined);

    // Mock role verification
    (verifyProjectRole as jest.Mock).mockResolvedValue(undefined);
  });

  describe('createInvite', () => {
    it('should create invite with valid role', async () => {
      const invite = await service.createInvite('project-123', 'MEMBER', mockUser);

      expect(verifyProjectRole).toHaveBeenCalledWith(
        mockUser,
        'project-123',
        ['OWNER', 'DEPUTY']
      );

      expect(invite).toMatchObject({
        code: expect.any(String),
        role: 'MEMBER',
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      });

      expect(InviteModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-123',
          role: 'MEMBER',
          tenantId: mockUser.tenantId,
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'createInvite',
          user: expect.any(Object),
          invite: expect.any(Object),
        })
      );
    });

    it('should throw error for invalid role', async () => {
      await expect(
        service.createInvite('project-123', 'OWNER' as any, mockUser)
      ).rejects.toThrow(AppError.validation('Invalid role. Must be MEMBER or DEPUTY'));
    });

    it('should throw error when user lacks permission', async () => {
      (verifyProjectRole as jest.Mock).mockRejectedValue(
        AppError.forbidden('Insufficient permissions')
      );

      await expect(
        service.createInvite('project-123', 'MEMBER', mockUser)
      ).rejects.toThrow(AppError.forbidden('Insufficient permissions'));
    });
  });

  describe('redeemInvite', () => {
    it('should redeem valid invite', async () => {
      const result = await service.redeemInvite('ABC123XYZ', mockUser);

      expect(result).toEqual({
        projectId: mockInvite.projectId,
        role: mockInvite.role,
      });

      expect(ProjectModel.update).toHaveBeenCalledWith(
        mockProject.id,
        expect.objectContaining({
          members: expect.objectContaining({
            [mockUser.sub]: expect.objectContaining({
              role: mockInvite.role,
            }),
          }),
        })
      );

      expect(InviteModel.delete).toHaveBeenCalledWith(mockInvite.id);
    });

    it('should throw error for expired invite', async () => {
      (InviteModel.findOne as jest.Mock).mockResolvedValue({
        ...mockInvite,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.redeemInvite('ABC123XYZ', mockUser)
      ).rejects.toThrow(AppError.gone('Invite has expired'));

      expect(InviteModel.delete).toHaveBeenCalledWith(mockInvite.id);
    });

    it('should throw error for different tenant', async () => {
      await expect(
        service.redeemInvite('ABC123XYZ', { ...mockUser, tenantId: 'other-tenant' })
      ).rejects.toThrow(AppError.forbidden('Invite belongs to a different tenant'));
    });

    it('should throw error for inactive project', async () => {
      (ProjectModel.findById as jest.Mock).mockResolvedValue({
        ...mockProject,
        status: 'archived',
      });

      await expect(
        service.redeemInvite('ABC123XYZ', mockUser)
      ).rejects.toThrow(AppError.forbidden('Project is not active'));
    });
  });

  describe('revokeInvite', () => {
    it('should revoke invite with permission', async () => {
      await service.revokeInvite('ABC123XYZ', mockUser);

      expect(verifyProjectRole).toHaveBeenCalledWith(
        mockUser,
        mockInvite.projectId,
        ['OWNER', 'DEPUTY']
      );

      expect(InviteModel.delete).toHaveBeenCalledWith(mockInvite.id);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'revokeInvite',
          user: expect.any(Object),
          invite: expect.any(Object),
        })
      );
    });

    it('should throw error when invite not found', async () => {
      (InviteModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.revokeInvite('INVALID', mockUser)
      ).rejects.toThrow(AppError.notFound('Invite not found'));
    });
  });

  describe('listInvites', () => {
    it('should list valid invites', async () => {
      const invites = await service.listInvites('project-123', mockUser);

      expect(verifyProjectRole).toHaveBeenCalledWith(
        mockUser,
        'project-123',
        ['OWNER', 'DEPUTY']
      );

      expect(InviteModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-123',
          expiresAt: expect.any(Object),
        })
      );

      expect(invites).toHaveLength(1);
      expect(invites[0]).toEqual({
        code: mockInvite.code,
        role: mockInvite.role,
        createdAt: mockInvite.createdAt,
        expiresAt: mockInvite.expiresAt,
      });
    });

    it('should return empty array when no invites', async () => {
      (InviteModel.findMany as jest.Mock).mockResolvedValue([]);

      const invites = await service.listInvites('project-123', mockUser);
      expect(invites).toEqual([]);
    });
  });

  describe('resendInvite', () => {
    it('should refresh invite expiry', async () => {
      const invite = await service.resendInvite('ABC123XYZ', mockUser);

      expect(verifyProjectRole).toHaveBeenCalledWith(
        mockUser,
        mockInvite.projectId,
        ['OWNER', 'DEPUTY']
      );

      expect(InviteModel.update).toHaveBeenCalledWith(
        mockInvite.id,
        expect.objectContaining({
          expiresAt: expect.any(Date),
        })
      );

      expect(invite).toEqual({
        code: mockInvite.code,
        role: mockInvite.role,
        createdAt: mockInvite.createdAt,
        expiresAt: expect.any(Date),
      });

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'resendInvite',
          user: expect.any(Object),
          invite: expect.any(Object),
        })
      );
    });

    it('should throw error when invite not found', async () => {
      (InviteModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.resendInvite('INVALID', mockUser)
      ).rejects.toThrow(AppError.notFound('Invite not found'));
    });
  });
});