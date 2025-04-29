import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { ProjectService } from './service';
import { ProjectModel } from '@models/v2/project.model';
import { TenantModel } from '@models/v2/tenant.model';
import { CloudProviderModel } from '@models/v2/cloudProvider.model';
import { ProjectTypeModel } from '@models/v2/projectType.model';
import { AppError } from '@core/errors/appError';

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
});