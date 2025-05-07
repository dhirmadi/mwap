import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { InviteService } from './service';
import { InviteModel } from '../../../models/v2/invite.model';
import { ProjectModel } from '../../../models/v2/project.model';
import { ProjectRole } from '../../../features/projects/types/roles';

describe('InviteService', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;
  let testProject: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Create test user
    testUser = {
      _id: new Types.ObjectId(),
      email: 'owner@example.com',
      name: 'Test Owner'
    };

    // Create test project
    testProject = await ProjectModel.create({
      name: 'Test Project',
      ownerId: testUser._id,
      tenantId: new Types.ObjectId(),
      cloudProvider: 'test-provider',
      projectTypeId: 'test-type',
      folderId: 'test-folder',
      archived: false
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await InviteModel.deleteMany({});
  });

  describe('createInvite', () => {
    const validPayload = {
      email: 'test@example.com',
      role: ProjectRole.MEMBER,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    it('should create invite with valid input', async () => {
      const invite = await InviteService.createInvite(
        testUser,
        testProject._id.toString(),
        validPayload
      );

      expect(invite).toBeDefined();
      expect(invite.email).toBe(validPayload.email);
      expect(invite.role).toBe(validPayload.role);
      expect(invite.projectId).toEqual(testProject._id);
      expect(invite.code).toBeDefined();
      expect(invite.redeemed).toBe(false);
      expect(invite.expiresAt).toEqual(validPayload.expiresAt);
    });

    it('should reject if project not found', async () => {
      await expect(InviteService.createInvite(
        testUser,
        new Types.ObjectId().toString(),
        validPayload
      )).rejects.toThrow('Project not found or access denied');
    });

    it('should reject if user is not project owner', async () => {
      const otherUser = {
        _id: new Types.ObjectId(),
        email: 'other@example.com'
      };

      await expect(InviteService.createInvite(
        otherUser,
        testProject._id.toString(),
        validPayload
      )).rejects.toThrow('Project not found or access denied');
    });

    it('should reject duplicate active invite for same email', async () => {
      await InviteService.createInvite(
        testUser,
        testProject._id.toString(),
        validPayload
      );

      await expect(InviteService.createInvite(
        testUser,
        testProject._id.toString(),
        validPayload
      )).rejects.toThrow('Active invite already exists for this email');
    });
  });

  describe('redeemInvite', () => {
    let testInvite: any;

    beforeEach(async () => {
      testInvite = await InviteModel.create({
        projectId: testProject._id,
        email: 'test@example.com',
        role: ProjectRole.MEMBER,
        code: 'test-code',
        redeemed: false
      });
    });

    it('should redeem valid invite', async () => {
      const result = await InviteService.redeemInvite(testInvite.code);

      expect(result.invite.redeemed).toBe(true);
      expect(result.project._id).toEqual(testProject._id);
    });

    it('should reject invalid code', async () => {
      await expect(InviteService.redeemInvite('invalid-code'))
        .rejects.toThrow('Invalid invite code');
    });

    it('should reject already redeemed invite', async () => {
      await InviteModel.findByIdAndUpdate(testInvite._id, { redeemed: true });

      await expect(InviteService.redeemInvite(testInvite.code))
        .rejects.toThrow('Invite has already been redeemed');
    });

    it('should reject expired invite', async () => {
      await InviteModel.findByIdAndUpdate(testInvite._id, {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      });

      await expect(InviteService.redeemInvite(testInvite.code))
        .rejects.toThrow('Invite has expired');
    });

    it('should reject if project is archived', async () => {
      await ProjectModel.findByIdAndUpdate(testProject._id, { archived: true });

      await expect(InviteService.redeemInvite(testInvite.code))
        .rejects.toThrow('Project not found or has been archived');
    });
  });

  describe('listInvites', () => {
    beforeEach(async () => {
      // Create test invites
      await InviteModel.create([
        {
          projectId: testProject._id,
          email: 'active@example.com',
          role: ProjectRole.MEMBER,
          code: 'code-1',
          redeemed: false
        },
        {
          projectId: testProject._id,
          email: 'redeemed@example.com',
          role: ProjectRole.MEMBER,
          code: 'code-2',
          redeemed: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
        },
        {
          projectId: testProject._id,
          email: 'old@example.com',
          role: ProjectRole.MEMBER,
          code: 'code-3',
          redeemed: true,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
        }
      ]);
    });

    it('should list active and recent invites', async () => {
      const invites = await InviteService.listInvites(testProject._id.toString());

      expect(invites).toHaveLength(2); // Active + 15 days old
      expect(invites[0].code).toBe('code-1');
      expect(invites[1].code).toBe('code-2');
    });

    it('should not list old redeemed invites', async () => {
      const invites = await InviteService.listInvites(testProject._id.toString());

      const oldInvite = invites.find(i => i.code === 'code-3');
      expect(oldInvite).toBeUndefined();
    });
  });
});