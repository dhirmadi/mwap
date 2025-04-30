# MWAP Core V2 Documentation

## Overview

`core-v2` is MWAP's next-generation foundation layer that provides enhanced type safety, better error handling, and more consistent patterns for building features. It was created to address limitations in the legacy core:

- Lack of strict type checking
- Inconsistent error handling
- Mixed validation approaches
- Complex middleware chains
- Hard-to-test components

The v2 system enforces strict boundaries and provides a more robust foundation for building features.

## Key Principles

1. **Type Safety First**: Everything is TypeScript with `strict: true`
2. **Explicit Over Implicit**: No "magic" - dependencies and behaviors are clearly defined
3. **Testable By Default**: All components designed for easy unit testing
4. **Zero Legacy Dependencies**: V2 modules never import from legacy code

## Folder Structure

```
server/
├── core-v2/           # Core foundation
│   ├── errors/        # Error handling
│   ├── types/         # Shared type definitions
│   └── utils/         # Shared utilities
├── middleware-v2/     # Express middleware
│   ├── auth/          # Authentication & authorization
│   └── security/      # Security headers, CORS, etc.
├── validation-v2/     # Request validation
│   └── schemas/       # Zod schemas
└── types-v2/         # Global type definitions
```

## Authentication & Authorization

### Using `extractUser`

The `extractUser` middleware extracts user information from Auth0 tokens and adds it to the request:

```typescript
import { extractUser } from '../../../middleware-v2/auth/extractUser';
import type { MWAPUser } from '../../../types-v2/auth';

// In your router:
router.use(extractUser());

// In your controller:
async function handler(req: Request, res: Response) {
  const user = req.user as MWAPUser;
  // user.id, user.email, user.roles are now available
}
```

### Using `requireRoles`

The `requireRoles` middleware enforces role-based access control:

```typescript
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';

router.post('/projects',
  requireRoles(MWAP_ROLES.OWNER),  // Single role
  controller.createProject
);

router.get('/projects/:id',
  requireRoles([MWAP_ROLES.OWNER, MWAP_ROLES.DEPUTY]),  // Multiple roles
  controller.getProject
);
```

Available roles:
- `OWNER`: Full access to all resources
- `DEPUTY`: Can manage most resources but can't delete
- `CONTRIBUTOR`: Read access and limited write operations
- `MEMBER`: Basic read access

## Request Validation

### Using `validateRequest`

The `validateRequest` middleware uses Zod schemas to validate requests:

```typescript
import { z } from 'zod';
import { validateRequest } from '../../../validation-v2/validateRequest';

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    type: z.enum(['web', 'mobile', 'desktop'])
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

router.post('/projects',
  validateRequest(createProjectSchema),
  controller.createProject
);
```

The middleware will:
1. Validate the request against the schema
2. Type the validated data in the request object
3. Return 400 with validation errors if invalid

## Error Handling

Use the `AppError` class for consistent error handling:

```typescript
import { AppError } from '../../../core-v2/errors';

// In your service:
if (!project) {
  throw AppError.notFound('Project not found');
}

if (!hasPermission) {
  throw AppError.forbidden('Insufficient permissions');
}

// Custom errors:
throw AppError.custom({
  message: 'Custom error message',
  code: 'CUSTOM_ERROR',
  statusCode: 422
});
```

The error handler will automatically:
1. Log errors appropriately
2. Send consistent error responses
3. Hide sensitive information in production

## Building Features with Core V2

### Feature Module Structure

```typescript
// model.ts - Data models and validation
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  // ...
});

export type Project = z.infer<typeof ProjectSchema>;

// service.ts - Business logic
import { AppError } from '../../../core-v2/errors';
import type { Project } from './model';

export class ProjectService {
  async getProject(id: string): Promise<Project> {
    const project = await this.repo.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }
    return project;
  }
}

// controller.ts - Request handling
import type { Request, Response, NextFunction } from 'express';
import { ProjectService } from './service';

export class ProjectController {
  constructor(private service: ProjectService) {}

  async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await this.service.getProject(req.params.id);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
}

// routes.ts - Route definitions
import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { validateRequest } from '../../../validation-v2/validateRequest';
import { ProjectController } from './controller';
import { ProjectService } from './service';

export function createProjectRouter(): Router {
  const router = Router();
  const service = new ProjectService();
  const controller = new ProjectController(service);

  router.get('/:id',
    extractUser(),
    requireRoles(MWAP_ROLES.MEMBER),
    validateRequest(getProjectSchema),
    controller.getProject.bind(controller)
  );

  return router;
}
```

### Testing V2 Components

All v2 components are designed for easy testing:

```typescript
import { ProjectService } from './service';
import { ProjectRepo } from './repo';
import { AppError } from '../../../core-v2/errors';

describe('ProjectService', () => {
  let service: ProjectService;
  let repo: jest.Mocked<ProjectRepo>;

  beforeEach(() => {
    repo = {
      findById: jest.fn()
    } as any;
    service = new ProjectService(repo);
  });

  it('should throw NotFound when project does not exist', async () => {
    repo.findById.mockResolvedValue(null);
    
    await expect(service.getProject('123'))
      .rejects
      .toThrow(AppError.notFound('Project not found'));
  });
});
```

## Important Rules

1. **Never Mix V1 and V2**
   - V2 modules must never import from legacy code
   - Keep V1 and V2 routes separate in the Express app
   - Use version-specific middleware chains

2. **Always Use Type Safety**
   - Enable strict TypeScript checks
   - Use Zod for runtime validation
   - Avoid `any` and type assertions

3. **Consistent Error Handling**
   - Always use `AppError` for errors
   - Handle all async errors
   - Validate all inputs

4. **Clean Architecture**
   - Keep business logic in services
   - Controllers only handle HTTP concerns
   - Use dependency injection for testing

## Migration Guide

When migrating features to v2:

1. Create new v2 module structure
2. Implement new functionality using v2 patterns
3. Add tests for new code
4. Switch routes to v2 implementation
5. Remove old v1 code

Do not attempt to migrate everything at once. Migrate one feature at a time, ensuring full test coverage before removing old code.

## Getting Help

- Check the test files in `__tests__` directories for examples
- Review existing v2 implementations in `features-v2`
- Ask in #mwap-dev Slack channel
- Create GitHub issues for documentation improvements