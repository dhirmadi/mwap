# Tenant Management

## Overview

Tenant management is a core feature of MWAP that provides multi-tenant isolation and management capabilities. Each tenant represents an organization or team with its own projects, members, and settings.

## Features

### Tenant Creation
- tenant creation obly possible if no tenant already exists
- Custom tenant name and settings
- Tenant owner assignment

### Project Management (using project )
- Create projects
- Archive Projects
- Delete Projects

### Tenant Settings
- Update tenant name
- Configure tenant-wide settings
- Set default project settings
- Manage billing information

## Implementation (V2)

### Data Model
```typescript
import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  ownerId: z.string().uuid(),
  settings: z.object({
    defaultProjectType: z.string(),
    allowedCloudProviders: z.array(z.string()),
    maxProjects: z.number().int().positive(),
    maxMembersPerProject: z.number().int().positive()
  }),
  members: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
    joinedAt: z.string().datetime()
  })),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Tenant = z.infer<typeof TenantSchema>;
```

### Service Layer
```typescript
export class TenantService {
  constructor(private repo: TenantRepository) {}

  async createTenant(data: CreateTenantDTO): Promise<Tenant> {
    const tenant = await this.repo.create({
      ...data,
      settings: this.getDefaultSettings(),
      members: [{
        userId: data.ownerId,
        role: 'OWNER',
        joinedAt: new Date().toISOString()
      }]
    });
    return tenant;
  }

  async addMember(tenantId: string, userId: string, role: TenantRole): Promise<void> {
    const tenant = await this.repo.findById(tenantId);
    if (!tenant) {
      throw AppError.notFound('Tenant not found');
    }

    if (tenant.members.some(m => m.userId === userId)) {
      throw AppError.conflict('User is already a member');
    }

    await this.repo.addMember(tenantId, {
      userId,
      role,
      joinedAt: new Date().toISOString()
    });
  }

  async updateSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<void> {
    const tenant = await this.repo.findById(tenantId);
    if (!tenant) {
      throw AppError.notFound('Tenant not found');
    }

    await this.repo.updateSettings(tenantId, {
      ...tenant.settings,
      ...settings
    });
  }
}
```

### API Routes
```typescript
export function createTenantRouter(): Router {
  const router = Router();
  const controller = new TenantController(new TenantService());

  router.post('/',
    extractUser(),
    validateRequest(createTenantSchema),
    controller.createTenant
  );

  router.post('/:id/members',
    extractUser(),
    requireRoles(['OWNER', 'ADMIN']),
    validateRequest(addMemberSchema),
    controller.addMember
  );

  router.put('/:id/settings',
    extractUser(),
    requireRoles(['OWNER']),
    validateRequest(updateSettingsSchema),
    controller.updateSettings
  );

  return router;
}
```

## Security

### Access Control
- Only tenant owners can:
  - Update tenant settings
  - Transfer ownership
  - Delete tenant
- Tenant admins can:
  - Manage members (except owners)
  - Update project settings
- Regular members can:
  - View tenant information
  - Access allowed projects

### Data Isolation
- Strict tenant data separation
- No cross-tenant access
- Encrypted tenant data
- Audit logging for sensitive operations

## Testing

### Unit Tests
```typescript
describe('TenantService', () => {
  let service: TenantService;
  let mockRepo: jest.Mocked<TenantRepository>;

  beforeEach(() => {
    mockRepo = createMockRepo();
    service = new TenantService(mockRepo);
  });

  it('should create tenant with owner', async () => {
    const data = createTestTenantData();
    const tenant = await service.createTenant(data);

    expect(tenant.members).toContainEqual({
      userId: data.ownerId,
      role: 'OWNER',
      joinedAt: expect.any(String)
    });
  });

  it('should prevent duplicate members', async () => {
    mockRepo.findById.mockResolvedValue(createTestTenant());

    await expect(
      service.addMember('tenant-1', 'existing-user', 'MEMBER')
    ).rejects.toThrow(AppError);
  });
});
```

## Error Handling

Common error scenarios:
- Tenant not found
- Duplicate member
- Insufficient permissions
- Invalid settings
- Resource limits exceeded

Each error is handled with appropriate status codes and messages using the `AppError` class.

## Migration Guide

When migrating from v1 to v2:

1. Update tenant model to use Zod schema
2. Implement new service methods
3. Update routes with v2 middleware
4. Add comprehensive tests
5. Migrate existing data
6. Update client code

## Best Practices

1. Always validate tenant access
2. Use role-based permissions
3. Audit sensitive operations
4. Handle edge cases (deletion, transfer)
5. Maintain data consistency