# Project Management

## Overview

Project management is a core feature that enables users to create, organize, and manage projects within their tenant. Each project can be connected to cloud storage providers and has its own set of members and permissions.

## Features

### Project Creation
- Multiple project types support
- Cloud provider integration
- Custom project settings
- Member assignment

### Project Settings
- Update project details
- Configure cloud storage
- Manage project type settings
- Archive/unarchive projects

### Member Management
- Role-based access control
- Member invitations
- Permission management
- Activity tracking

## Implementation (V2)

### Data Model
```typescript
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  type: z.string(),
  tenantId: z.string().uuid(),
  settings: z.object({
    cloudProvider: z.string(),
    cloudFolderId: z.string(),
    visibility: z.enum(['private', 'tenant', 'public']),
    features: z.record(z.boolean())
  }),
  members: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['OWNER', 'DEPUTY', 'MEMBER']),
    joinedAt: z.string().datetime()
  })),
  status: z.enum(['active', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Project = z.infer<typeof ProjectSchema>;
```

### Service Layer
```typescript
export class ProjectService {
  constructor(
    private repo: ProjectRepository,
    private cloudService: CloudService
  ) {}

  async createProject(data: CreateProjectDTO): Promise<Project> {
    // Validate project type
    await this.validateProjectType(data.type);

    // Setup cloud storage
    const cloudFolder = await this.cloudService.createFolder({
      provider: data.settings.cloudProvider,
      name: data.name
    });

    // Create project
    const project = await this.repo.create({
      ...data,
      settings: {
        ...data.settings,
        cloudFolderId: cloudFolder.id
      }
    });

    return project;
  }

  async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    const project = await this.repo.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    if (project.status === 'archived') {
      throw AppError.forbidden('Cannot update archived project');
    }

    return this.repo.update(id, data);
  }

  async archiveProject(id: string): Promise<void> {
    const project = await this.repo.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    await this.repo.update(id, {
      status: 'archived',
      updatedAt: new Date().toISOString()
    });
  }
}
```

### API Routes
```typescript
export function createProjectRouter(): Router {
  const router = Router();
  const controller = new ProjectController(
    new ProjectService(
      new ProjectRepository(),
      new CloudService()
    )
  );

  router.post('/',
    extractUser(),
    requireRoles(['OWNER']),
    validateRequest(createProjectSchema),
    controller.createProject
  );

  router.put('/:id',
    extractUser(),
    requireRoles(['OWNER', 'DEPUTY']),
    validateRequest(updateProjectSchema),
    controller.updateProject
  );

  router.post('/:id/archive',
    extractUser(),
    requireRoles(['OWNER']),
    validateRequest(archiveProjectSchema),
    controller.archiveProject
  );

  return router;
}
```

## Security

### Access Control
- Project-level roles:
  - OWNER: Full control
  - DEPUTY: Can manage but not delete
  - MEMBER: Basic access
- Role inheritance from tenant
- Resource-level permissions

### Data Protection
- Project data encryption
- Secure cloud access
- Audit logging
- Activity monitoring

## Testing

### Integration Tests
```typescript
describe('ProjectAPI', () => {
  let app: Express;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = createTestApp(testDb);
  });

  it('should create project with cloud folder', async () => {
    const response = await request(app)
      .post('/api/v2/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send(createTestProjectData());

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: expect.any(String),
      settings: {
        cloudFolderId: expect.any(String)
      }
    });
  });

  it('should prevent updates to archived projects', async () => {
    const response = await request(app)
      .put('/api/v2/projects/archived-id')
      .set('Authorization', `Bearer ${testToken}`)
      .send(updateTestProjectData());

    expect(response.status).toBe(403);
  });
});
```

## Error Handling

Common error scenarios:
- Invalid project type
- Cloud provider errors
- Permission issues
- Resource conflicts
- Validation failures

## Migration Guide

When migrating from v1:

1. Update models to use Zod
2. Implement new service layer
3. Add cloud integration
4. Update routes with v2 middleware
5. Add comprehensive tests
6. Migrate existing projects

## Best Practices

1. Validate all inputs
2. Handle cloud errors gracefully
3. Maintain audit trail
4. Use proper error types
5. Test edge cases
6. Document API changes