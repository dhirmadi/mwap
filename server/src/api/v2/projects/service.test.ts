import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ProjectService } from './service';
import { Project } from '../../../models/project';

describe('ProjectService', () => {
  let mongoServer: MongoMemoryServer;

  const mockUser = {
    id: 'user123',
    tenantId: 'tenant123',
    email: 'test@example.com'
  };

  const validProjectData = {
    name: 'Test Project',
    cloudProvider: 'dropbox',
    folderId: 'folder123',
    projectTypeId: 'type123'
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Project.deleteMany({});
  });

  describe('createProject', () => {
    it('should create a project with valid data', async () => {
      const project = await ProjectService.createProject(mockUser, validProjectData);
      
      expect(project).toBeDefined();
      expect(project.name).toBe(validProjectData.name);
      expect(project.ownerId).toBe(mockUser.id);
      expect(project.tenantId).toBe(mockUser.tenantId);
    });

    it('should throw error for missing required fields', async () => {
      const invalidData = { ...validProjectData, name: '' };
      
      await expect(ProjectService.createProject(mockUser, invalidData))
        .rejects
        .toThrow('Invalid input');
    });

    it('should prevent duplicate projects for same folder', async () => {
      await ProjectService.createProject(mockUser, validProjectData);
      
      await expect(ProjectService.createProject(mockUser, validProjectData))
        .rejects
        .toThrow('Project already exists for this folder');
    });
  });

  describe('updateProject', () => {
    it('should update project fields', async () => {
      const project = await ProjectService.createProject(mockUser, validProjectData);
      const updates = { name: 'Updated Name' };
      
      const updated = await ProjectService.updateProject(project._id, mockUser.id, updates);
      expect(updated.name).toBe('Updated Name');
    });

    it('should throw error for non-existent project', async () => {
      await expect(ProjectService.updateProject('nonexistent', mockUser.id, { name: 'Test' }))
        .rejects
        .toThrow('Project not found');
    });
  });

  describe('archiveProject', () => {
    it('should set project as archived', async () => {
      const project = await ProjectService.createProject(mockUser, validProjectData);
      
      const archived = await ProjectService.archiveProject(project._id, mockUser.id);
      expect(archived.archived).toBe(true);
    });

    it('should throw error for non-existent project', async () => {
      await expect(ProjectService.archiveProject('nonexistent', mockUser.id))
        .rejects
        .toThrow('Project not found');
    });
  });
});