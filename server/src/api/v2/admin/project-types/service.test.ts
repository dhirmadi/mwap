import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ProjectTypeService } from './service';
import { ProjectTypeModel } from '@models/v2/projectType.model';
import { AppError } from '@core/errors/appError';

describe('ProjectTypeService', () => {
  let mongoServer: MongoMemoryServer;

  const validProjectType = {
    projectTypeId: 'test-project',
    name: 'Test Project',
    description: 'A test project type',
    iconUrl: 'https://example.com/icon.png',
    configSchema: { type: 'object' }
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
    await ProjectTypeModel.deleteMany({});
  });

  describe('createProjectType', () => {
    it('should create a project type with valid data', async () => {
      const result = await ProjectTypeService.createProjectType(validProjectType);
      
      expect(result.projectTypeId).toBe(validProjectType.projectTypeId);
      expect(result.name).toBe(validProjectType.name);
      expect(result.description).toBe(validProjectType.description);
    });

    it('should reject invalid projectTypeId format', async () => {
      const invalidData = {
        ...validProjectType,
        projectTypeId: 'Invalid ID'
      };

      await expect(ProjectTypeService.createProjectType(invalidData))
        .rejects
        .toThrow(AppError);
    });

    it('should reject duplicate projectTypeId', async () => {
      await ProjectTypeService.createProjectType(validProjectType);
      
      await expect(ProjectTypeService.createProjectType(validProjectType))
        .rejects
        .toThrow('Project type ID already exists');
    });
  });

  describe('listProjectTypes', () => {
    it('should list all project types', async () => {
      await ProjectTypeService.createProjectType(validProjectType);
      await ProjectTypeService.createProjectType({
        ...validProjectType,
        projectTypeId: 'another-project'
      });

      const result = await ProjectTypeService.listProjectTypes();
      expect(result).toHaveLength(2);
    });
  });

  describe('updateProjectType', () => {
    it('should update project type fields', async () => {
      await ProjectTypeService.createProjectType(validProjectType);
      
      const updates = { name: 'Updated Name' };
      const result = await ProjectTypeService.updateProjectType(
        validProjectType.projectTypeId,
        updates
      );

      expect(result.name).toBe(updates.name);
      expect(result.description).toBe(validProjectType.description);
    });

    it('should reject invalid updates', async () => {
      await ProjectTypeService.createProjectType(validProjectType);
      
      const invalidUpdates = { name: '' };
      await expect(ProjectTypeService.updateProjectType(
        validProjectType.projectTypeId,
        invalidUpdates
      )).rejects.toThrow(AppError);
    });
  });

  describe('deleteProjectType', () => {
    it('should delete an existing project type', async () => {
      await ProjectTypeService.createProjectType(validProjectType);
      
      await ProjectTypeService.deleteProjectType(validProjectType.projectTypeId);
      
      const result = await ProjectTypeModel.findOne({
        projectTypeId: validProjectType.projectTypeId
      });
      expect(result).toBeNull();
    });

    it('should throw error for non-existent project type', async () => {
      await expect(ProjectTypeService.deleteProjectType('non-existent'))
        .rejects
        .toThrow('Project type not found');
    });
  });
});