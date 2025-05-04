import "@jest/globals";
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { ProjectService } from './service';
import { ProjectModel } from '../../../models/v2/project.model';
import { TenantModel } from '../../../models/v2/tenant.model';
import { CloudProviderModel } from '../../../models/v2/cloudProvider.model';
import { ProjectTypeModel } from '../../../models/v2/projectType.model';
import { AppError } from '../../../core/errors/appError';

describe('ProjectService', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;
  let testTenant: any;
  let testProvider: any;
  let testProjectType: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Create test user
    testUser = {
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      name: 'Test User'
    };

    // Create test tenant
    testTenant = await TenantModel.create({
      name: 'Test Tenant',
      ownerId: testUser._id,
      archived: false
    });

    // Create test cloud provider
    testProvider = await CloudProviderModel.create({
      providerId: 'test-provider',
      name: 'Test Provider',
      authType: 'OAuth2',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/oauth/callback',
      configOptions: {
        authUrl: 'https://example.com/oauth/authorize'
      },
      archived: false
    });

    // Create test project type
    testProjectType = await ProjectTypeModel.create({
      projectTypeId: 'test-type',
      name: 'Test Type',
      description: 'Test project type',
      archived: false
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await ProjectModel.deleteMany({});
  });

  describe('createProject', () => {
    const validPayload = {
      name: 'Test Project',
      tenantId: new Types.ObjectId(),
      cloudProvider: 'test-provider',
      projectTypeId: 'test-type',
      folderId: 'test-folder',
      folderPath: '/test/path'
    };

    it('should create a project with valid input', async () => {
      const payload = {
        ...validPayload,
        tenantId: testTenant._id
      };

      const project = await ProjectService.createProject(testUser, payload);

      expect(project).toBeDefined();
      expect(project.name).toBe(payload.name);
      expect(project.tenantId).toEqual(testTenant._id);
      expect(project.cloudProvider).toBe(payload.cloudProvider);
      expect(project.projectTypeId).toBe(payload.projectTypeId);
      expect(project.folderId).toBe(payload.folderId);
      expect(project.folderPath).toBe(payload.folderPath);
      expect(project.ownerId).toEqual(testUser._id);
      expect(project.archived).toBe(false);
    });

    it('should reject if tenant does not exist', async () => {
      const payload = {
        ...validPayload,
        tenantId: new Types.ObjectId()
      };

      await expect(ProjectService.createProject(testUser, payload))
        .rejects
        .toThrow('Not authorized to create projects for this tenant');
    });

    it('should reject if cloud provider does not exist', async () => {
      const payload = {
        ...validPayload,
        tenantId: testTenant._id,
        cloudProvider: 'non-existent-provider'
      };

      await expect(ProjectService.createProject(testUser, payload))
        .rejects
        .toThrow('Invalid cloud provider');
    });

    it('should reject if project type does not exist', async () => {
      const payload = {
        ...validPayload,
        tenantId: testTenant._id,
        projectTypeId: 'non-existent-type'
      };

      await expect(ProjectService.createProject(testUser, payload))
        .rejects
        .toThrow('Invalid project type');
    });

    it('should reject duplicate folder in same tenant', async () => {
      const payload = {
        ...validPayload,
        tenantId: testTenant._id
      };

      await ProjectService.createProject(testUser, payload);
      await expect(ProjectService.createProject(testUser, payload))
        .rejects
        .toThrow('A project already exists with this folder in the tenant');
    });
  });

  describe('updateProject', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await ProjectModel.create({
        name: 'Original Name',
        tenantId: testTenant._id,
        ownerId: testUser._id,
        cloudProvider: testProvider.providerId,
        projectTypeId: testProjectType.projectTypeId,
        folderId: 'test-folder',
        folderPath: '/test/path',
        archived: false
      });
    });

    it('should update project name', async () => {
      const newName = 'Updated Name';
      const project = await ProjectService.updateProject(testProject._id.toString(), {
        name: newName
      });

      expect(project).toBeDefined();
      expect(project.name).toBe(newName);
      expect(project.tenantId).toEqual(testTenant._id);
      expect(project.cloudProvider).toBe(testProject.cloudProvider);
    });

    it('should reject invalid project ID', async () => {
      await expect(ProjectService.updateProject('invalid-id', { name: 'New Name' }))
        .rejects
        .toThrow();
    });

    it('should reject archived project', async () => {
      await ProjectModel.findByIdAndUpdate(testProject._id, { archived: true });

      await expect(ProjectService.updateProject(testProject._id.toString(), { name: 'New Name' }))
        .rejects
        .toThrow('Project not found or archived');
    });
  });

  describe('archiveProject', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await ProjectModel.create({
        name: 'Test Project',
        tenantId: testTenant._id,
        ownerId: testUser._id,
        cloudProvider: testProvider.providerId,
        projectTypeId: testProjectType.projectTypeId,
        folderId: 'test-folder',
        folderPath: '/test/path',
        archived: false
      });
    });

    it('should archive project', async () => {
      const project = await ProjectService.archiveProject(testProject._id.toString());

      expect(project).toBeDefined();
      expect(project.archived).toBe(true);
    });

    it('should reject invalid project ID', async () => {
      await expect(ProjectService.archiveProject('invalid-id'))
        .rejects
        .toThrow();
    });

    it('should reject already archived project', async () => {
      await ProjectModel.findByIdAndUpdate(testProject._id, { archived: true });

      await expect(ProjectService.archiveProject(testProject._id.toString()))
        .rejects
        .toThrow('Project not found or already archived');
    });
  });

  describe('addMember', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await ProjectModel.create({
        name: 'Test Project',
        tenantId: testTenant._id,
        ownerId: testUser._id,
        cloudProvider: testProvider.providerId,
        projectTypeId: testProjectType.projectTypeId,
        folderId: 'test-folder',
        folderPath: '/test/path',
        archived: false,
        members: [{
          userId: testUser._id.toString(),
          role: 'OWNER',
          joinedAt: new Date().toISOString()
        }]
      });
    });

    it('should add a member with valid data', async () => {
      const payload = {
        userId: 'user456',
        role: 'MEMBER'
      };

      const result = await ProjectService.addMember(
        testProject._id.toString(),
        testUser,
        payload
      );

      expect(result).toEqual({
        userId: 'user456',
        role: 'MEMBER',
        joinedAt: expect.any(String)
      });

      const updatedProject = await ProjectModel.findById(testProject._id);
      expect(updatedProject?.members).toHaveLength(2);
      expect(updatedProject?.members[1]).toEqual(result);
    });

    it('should reject if user is already a member', async () => {
      const payload = {
        userId: testUser._id.toString(),
        role: 'MEMBER'
      };

      await expect(
        ProjectService.addMember(testProject._id.toString(), testUser, payload)
      ).rejects.toThrow('User is already a member of this project');
    });

    it('should reject if current user is not OWNER/DEPUTY', async () => {
      testProject.members[0].role = 'MEMBER';
      await testProject.save();

      const payload = {
        userId: 'user456',
        role: 'MEMBER'
      };

      await expect(
        ProjectService.addMember(testProject._id.toString(), testUser, payload)
      ).rejects.toThrow('Only project owners and deputies can add members');
    });

    it('should reject if assigning role equal/higher than current user', async () => {
      testProject.members[0].role = 'DEPUTY';
      await testProject.save();

      const payload = {
        userId: 'user456',
        role: 'DEPUTY'
      };

      await expect(
        ProjectService.addMember(testProject._id.toString(), testUser, payload)
      ).rejects.toThrow('Cannot assign a role equal to or higher than your own');
    });

    it('should reject if project is archived', async () => {
      testProject.archived = true;
      await testProject.save();

      const payload = {
        userId: 'user456',
        role: 'MEMBER'
      };

      await expect(
        ProjectService.addMember(testProject._id.toString(), testUser, payload)
      ).rejects.toThrow('Project not found or archived');
    });
  });

  describe('removeMember', () => {
    let testProject: any;
    const memberUserId = new Types.ObjectId().toString();

    beforeEach(async () => {
      testProject = await ProjectModel.create({
        name: 'Test Project',
        tenantId: testTenant._id,
        ownerId: testUser._id,
        cloudProvider: testProvider.providerId,
        projectTypeId: testProjectType.projectTypeId,
        folderId: 'test-folder',
        folderPath: '/test/path',
        archived: false,
        members: [
          {
            userId: testUser._id.toString(),
            role: 'OWNER',
            joinedAt: new Date().toISOString()
          },
          {
            userId: memberUserId,
            role: 'MEMBER',
            joinedAt: new Date().toISOString()
          }
        ]
      });
    });

    it('should remove a member with valid data', async () => {
      await ProjectService.removeMember(
        testProject._id.toString(),
        testUser,
        memberUserId
      );

      const updatedProject = await ProjectModel.findById(testProject._id);
      expect(updatedProject?.members).toHaveLength(1);
      expect(updatedProject?.members[0].userId).toBe(testUser._id.toString());
    });

    it('should reject if member not found', async () => {
      const nonExistentUserId = new Types.ObjectId().toString();

      await expect(
        ProjectService.removeMember(testProject._id.toString(), testUser, nonExistentUserId)
      ).rejects.toThrow('Member not found in project');
    });

    it('should reject if current user is not OWNER/DEPUTY', async () => {
      testProject.members[0].role = 'MEMBER';
      await testProject.save();

      await expect(
        ProjectService.removeMember(testProject._id.toString(), testUser, memberUserId)
      ).rejects.toThrow('Only project owners and deputies can remove members');
    });

    it('should reject if removing self', async () => {
      await expect(
        ProjectService.removeMember(testProject._id.toString(), testUser, testUser._id.toString())
      ).rejects.toThrow('Cannot remove yourself from the project');
    });

    it('should reject if removing member with equal role', async () => {
      testProject.members[0].role = 'DEPUTY';
      testProject.members[1].role = 'DEPUTY';
      await testProject.save();

      await expect(
        ProjectService.removeMember(testProject._id.toString(), testUser, memberUserId)
      ).rejects.toThrow('Cannot remove a member with equal or higher role');
    });

    it('should reject if removing member with higher role', async () => {
      testProject.members[0].role = 'DEPUTY';
      testProject.members[1].role = 'OWNER';
      await testProject.save();

      await expect(
        ProjectService.removeMember(testProject._id.toString(), testUser, memberUserId)
      ).rejects.toThrow('Cannot remove a member with equal or higher role');
    });

    it('should reject if project is archived', async () => {
      testProject.archived = true;
      await testProject.save();

      await expect(
        ProjectService.removeMember(testProject._id.toString(), testUser, memberUserId)
      ).rejects.toThrow('Project not found or archived');
    });
  });

  describe('updateMemberRole', () => {
    let testProject: any;
    const memberUserId = new Types.ObjectId().toString();

    beforeEach(async () => {
      testProject = await ProjectModel.create({
        name: 'Test Project',
        tenantId: testTenant._id,
        ownerId: testUser._id,
        cloudProvider: testProvider.providerId,
        projectTypeId: testProjectType.projectTypeId,
        folderId: 'test-folder',
        folderPath: '/test/path',
        archived: false,
        members: [
          {
            userId: testUser._id.toString(),
            role: 'OWNER',
            joinedAt: new Date().toISOString()
          },
          {
            userId: memberUserId,
            role: 'MEMBER',
            joinedAt: new Date().toISOString()
          }
        ]
      });
    });

    it('should update member role with valid data', async () => {
      const payload = { role: 'DEPUTY' as const };

      const result = await ProjectService.updateMemberRole(
        testProject._id.toString(),
        testUser,
        memberUserId,
        payload
      );

      expect(result.role).toBe('DEPUTY');
      
      const updatedProject = await ProjectModel.findById(testProject._id);
      expect(updatedProject?.members[1].role).toBe('DEPUTY');
    });

    it('should reject invalid role value', async () => {
      const payload = { role: 'INVALID' as any };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, memberUserId, payload)
      ).rejects.toThrow();
    });

    it('should reject if member not found', async () => {
      const nonExistentUserId = new Types.ObjectId().toString();
      const payload = { role: 'DEPUTY' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, nonExistentUserId, payload)
      ).rejects.toThrow('Member not found in project');
    });

    it('should reject if current user is not OWNER/DEPUTY', async () => {
      testProject.members[0].role = 'MEMBER';
      await testProject.save();

      const payload = { role: 'DEPUTY' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, memberUserId, payload)
      ).rejects.toThrow('Only project owners and deputies can modify roles');
    });

    it('should reject if modifying own role', async () => {
      const payload = { role: 'DEPUTY' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, testUser._id.toString(), payload)
      ).rejects.toThrow('Cannot modify your own role');
    });

    it('should reject if modifying role of member with equal role', async () => {
      testProject.members[0].role = 'DEPUTY';
      testProject.members[1].role = 'DEPUTY';
      await testProject.save();

      const payload = { role: 'MEMBER' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, memberUserId, payload)
      ).rejects.toThrow('Cannot modify role of a member with equal or higher role');
    });

    it('should reject if modifying role of member with higher role', async () => {
      testProject.members[0].role = 'DEPUTY';
      testProject.members[1].role = 'OWNER';
      await testProject.save();

      const payload = { role: 'MEMBER' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, memberUserId, payload)
      ).rejects.toThrow('Cannot modify role of a member with equal or higher role');
    });

    it('should reject if assigning role equal to current user', async () => {
      testProject.members[0].role = 'DEPUTY';
      await testProject.save();

      const payload = { role: 'DEPUTY' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, memberUserId, payload)
      ).rejects.toThrow('Cannot assign a role equal to or higher than your own');
    });

    it('should reject if assigning role higher than current user', async () => {
      testProject.members[0].role = 'DEPUTY';
      await testProject.save();

      const payload = { role: 'OWNER' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, memberUserId, payload)
      ).rejects.toThrow('Cannot assign a role equal to or higher than your own');
    });

    it('should reject if project is archived', async () => {
      testProject.archived = true;
      await testProject.save();

      const payload = { role: 'DEPUTY' as const };

      await expect(
        ProjectService.updateMemberRole(testProject._id.toString(), testUser, memberUserId, payload)
      ).rejects.toThrow('Project not found or archived');
    });
  });
});