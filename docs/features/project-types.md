# Project Types

## Overview

Project Types define the templates and configurations available when creating new projects. They provide standardized settings, workflows, and integrations based on the project's purpose.

## Features

### Type Management
- Create custom project types
- Configure type settings
- Set default values
- Define required integrations

### Type Settings
- Cloud provider requirements
- Default permissions
- Required features
- Workflow templates

### Type Validation
- Schema validation
- Required fields
- Integration checks
- Permission rules

## Implementation (V2)

### Data Model
```typescript
import { z } from 'zod';

export const ProjectTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(50),
  description: z.string(),
  category: z.enum(['web', 'mobile', 'desktop', 'other']),
  settings: z.object({
    requiredCloudProviders: z.array(z.string()),
    defaultPermissions: z.record(z.array(z.string())),
    requiredFeatures: z.array(z.string()),
    maxMembers: z.number().int().positive(),
    allowArchive: z.boolean(),
    workflowTemplate: z.string().optional()
  }),
  validation: z.object({
    namePattern: z.string().optional(),
    requiredFields: z.array(z.string()),
    customValidation: z.record(z.any())
  }),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ProjectType = z.infer<typeof ProjectTypeSchema>;
```

### Service Layer
```typescript
export class ProjectTypeService {
  constructor(private repo: ProjectTypeRepository) {}

  async createType(data: CreateProjectTypeDTO): Promise<ProjectType> {
    // Validate unique name
    const existing = await this.repo.findByName(data.name);
    if (existing) {
      throw AppError.conflict('Project type already exists');
    }

    // Validate settings
    await this.validateTypeSettings(data.settings);

    return this.repo.create({
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async updateType(id: string, data: UpdateProjectTypeDTO): Promise<ProjectType> {
    const type = await this.repo.findById(id);
    if (!type) {
      throw AppError.notFound('Project type not found');
    }

    // Validate settings changes
    if (data.settings) {
      await this.validateTypeSettings(data.settings);
    }

    return this.repo.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  private async validateTypeSettings(settings: ProjectTypeSettings): Promise<void> {
    // Validate cloud providers exist
    for (const provider of settings.requiredCloudProviders) {
      const exists = await this.cloudService.providerExists(provider);
      if (!exists) {
        throw AppError.validation(`Invalid cloud provider: ${provider}`);
      }
    }

    // Validate workflow template
    if (settings.workflowTemplate) {
      const valid = await this.workflowService.validateTemplate(
        settings.workflowTemplate
      );
      if (!valid) {
        throw AppError.validation('Invalid workflow template');
      }
    }
  }
}
```

### API Routes
```typescript
export function createProjectTypeRouter(): Router {
  const router = Router();
  const controller = new ProjectTypeController(new ProjectTypeService());

  router.post('/',
    extractUser(),
    requireRoles(['ADMIN']),
    validateRequest(createTypeSchema),
    controller.createType
  );

  router.put('/:id',
    extractUser(),
    requireRoles(['ADMIN']),
    validateRequest(updateTypeSchema),
    controller.updateType
  );

  router.get('/',
    extractUser(),
    validateRequest(listTypesSchema),
    controller.listTypes
  );

  return router;
}
```

## Security

### Access Control
- Only admins can create/modify types
- All users can view types
- Type-specific permissions
- Usage tracking

### Validation
- Schema validation
- Integration checks
- Permission validation
- Custom rules

## Testing

### Unit Tests
```typescript
describe('ProjectTypeService', () => {
  let service: ProjectTypeService;
  let mockRepo: jest.Mocked<ProjectTypeRepository>;

  beforeEach(() => {
    mockRepo = createMockRepo();
    service = new ProjectTypeService(mockRepo);
  });

  it('should validate cloud providers', async () => {
    const data = createTestTypeData({
      settings: {
        requiredCloudProviders: ['invalid-provider']
      }
    });

    await expect(
      service.createType(data)
    ).rejects.toThrow('Invalid cloud provider');
  });

  it('should prevent duplicate names', async () => {
    mockRepo.findByName.mockResolvedValue(createTestType());

    await expect(
      service.createType(createTestTypeData())
    ).rejects.toThrow('Project type already exists');
  });
});
```

## Error Handling

Common errors:
- Invalid settings
- Missing integrations
- Permission errors
- Validation failures
- Duplicate names

## Migration Guide

When migrating from v1:

1. Update type definitions
2. Add validation rules
3. Implement new service methods
4. Update admin interface
5. Migrate existing types
6. Update documentation

## Best Practices

1. Validate all settings
2. Document type requirements
3. Test all validations
4. Handle upgrades gracefully
5. Monitor type usage
6. Regular maintenance