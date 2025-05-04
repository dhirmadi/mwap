# MWAP Core V2 Documentation

## Overview

`core-v2` is MWAP's next-generation foundation layer that provides enhanced type safety, better error handling, and more consistent patterns for building features. It was created to address limitations in the legacy core:

- Lack of strict type checking
- Inconsistent error handling
- Mixed validation approaches
- Complex middleware chains
- Hard-to-test components

The v2 system enforces strict boundaries and provides a more robust foundation for building features.

## Core Middleware Stack

### Purpose of `initCoreV2(app)`

The `initCoreV2(app)` function initializes the core middleware stack for MWAP v2. It:

1. Sets up essential security and performance middleware
2. Configures authentication and authorization
3. Establishes error handling and logging
4. Ensures consistent request processing

```typescript
// Example usage in app.ts
import { initCoreV2 } from './core-v2/init';

async function bootstrap() {
  const app = express();
  await initCoreV2(app);  // Initialize core middleware
  
  // Add feature routes after core initialization
  app.use('/api/v2/projects', projectRouter);
  
  return app;
}
```

### Middleware Order

The middleware stack is applied in a specific order to ensure proper security and request handling:

1. **Security Layer** (First)
   ```typescript
   // Applied in initCoreV2
   app.use(helmet());  // Security headers
   app.use(cors(corsOptions));  // CORS protection
   app.use(rateLimit(rateLimitConfig));  // Rate limiting
   ```

2. **Request Processing**
   ```typescript
   app.use(compression());  // Compression
   app.use(express.json({ limit: '10mb' }));  // Body parsing
   app.use(requestLogger());  // Request logging
   ```

3. **Authentication**
   ```typescript
   app.use(extractUser());  // JWT validation & user extraction
   ```

4. **Feature Middleware** (Your routes go here)

5. **Error Handling** (Last)
   ```typescript
   app.use(notFoundHandler);  // 404 handler
   app.use(errorHandler);     // Global error handler
   ```

⚠️ **WARNING**: Never mix v1 and v2 middleware in the same chain. Always use the complete v2 stack for v2 routes.

### Core Middleware Components

#### `validateRequest(schema)`

Request validation middleware using Zod:

```typescript
const schema = z.object({
  body: z.object({
    name: z.string(),
    type: z.enum(['web', 'mobile'])
  }),
  params: z.object({
    id: z.string().uuid()
  })
});

router.post('/:id',
  validateRequest(schema),  // Validates body and params
  controller.handleRequest
);
```

Key features:
- Type inference for validated data
- Nested object validation
- Custom error messages
- Automatic 400 responses for invalid requests

#### `extractUser()`

JWT validation and user extraction:

```typescript
router.get('/profile',
  extractUser(),  // Required for protected routes
  (req, res) => {
    const user = req.user;  // TypeScript knows user exists
    res.json({ profile: user });
  }
);
```

Features:
- Auth0 JWT validation
- User object injection
- Role information extraction
- Automatic 401 for invalid tokens

#### `requireRoles(roles)`

Role-based access control:

```typescript
router.delete('/projects/:id',
  requireRoles([ROLES.ADMIN, ROLES.OWNER]),
  controller.deleteProject
);
```

Features:
- Single or multiple role support
- Role hierarchy awareness
- Project-specific roles
- Automatic 403 for insufficient permissions

### Adding New Feature Middleware

To add new middleware to the v2 stack:

1. Create in correct location:
   ```typescript
   // middleware-v2/feature/myMiddleware.ts
   import type { Request, Response, NextFunction } from 'express';
   import { AppError } from '../../core-v2/errors';
   
   export function myMiddleware() {
     return async (req: Request, res: Response, next: NextFunction) => {
       try {
         // Middleware logic here
         next();
       } catch (error) {
         next(error);  // Pass to error handler
       }
     };
   }
   ```

2. Add tests:
   ```typescript
   // __tests__/myMiddleware.test.ts
   describe('myMiddleware', () => {
     it('should process request correctly', async () => {
       const middleware = myMiddleware();
       // Test implementation
     });
   });
   ```

3. Use in routes:
   ```typescript
   router.use(myMiddleware());  // Global for all routes
   // or
   router.get('/path', myMiddleware(), controller);  // Route specific
   ```

⚠️ **Important Guidelines**:

1. Always handle async errors with try/catch
2. Use typed request/response objects
3. Pass errors to next() - don't handle directly
4. Add middleware-specific types in types-v2/
5. Keep middleware focused and single-purpose
6. Document behavior and requirements
7. Add comprehensive tests

## Key Principles

1. **Type Safety First**: Everything is TypeScript with `strict: true`
2. **Explicit Over Implicit**: No "magic" - dependencies and behaviors are clearly defined
3. **Testable By Default**: All components designed for easy unit testing
4. **Zero Legacy Dependencies**: V2 modules never import from legacy code

## Folder Structure

```
server/src/
├── api/              # API routes and handlers
│   ├── v2/           # V2 API implementation
│   └── router.ts     # API router configuration
├── core-v2/          # Core foundation
│   ├── errors/       # Error handling
│   ├── rbac/         # Role-based access control
│   └── utils/        # Shared utilities
├── middleware-v2/    # Express middleware
│   ├── auth/         # Authentication & authorization
│   ├── errors/       # Error handling middleware
│   ├── scoping/      # Tenant/Project scoping
│   ├── security/     # Security headers, CORS, etc.
│   └── validation/   # Request validation
├── models-v2/        # Database models
├── types-v2/         # Global type definitions
└── legacy/           # Deprecated v1 code
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