# Middleware Architecture

## Overview

The MWAP middleware system has been completely redesigned in v2 to provide enhanced type safety, better error handling, and more consistent patterns. The new architecture focuses on explicit dependencies, testability, and strict type checking.

## V2 Middleware Structure

```
server/
├── core-v2/           # Core foundation
│   ├── errors/        # Error handling
│   │   ├── AppError.ts    # Base error class
│   │   └── handlers.ts    # Error middleware
│   ├── types/         # Shared type definitions
│   │   ├── auth.ts        # Auth types
│   │   ├── request.ts     # Express augmentations
│   │   └── response.ts    # Response types
│   └── utils/         # Shared utilities
│       └── logger.ts      # Logging utilities
│
├── middleware-v2/     # Express middleware
│   ├── auth/          # Authentication & authorization
│   │   ├── extractUser.ts    # JWT user extraction
│   │   ├── requireRoles.ts   # Role checking
│   │   └── validateToken.ts  # Token validation
│   ├── security/      # Security middleware
│   │   ├── cors.ts         # CORS configuration
│   │   ├── helmet.ts       # Security headers
│   │   └── rateLimiter.ts  # Rate limiting
│   └── validation/    # Request validation
│       ├── schemas/       # Zod schemas
│       └── validate.ts    # Validation middleware
│
└── features-v2/      # Feature implementations
    └── projects/     # Example feature
        ├── model.ts      # Data models
        ├── service.ts    # Business logic
        ├── controller.ts # Request handling
        └── routes.ts     # Route definitions
```

## V2 Middleware Categories

### Core Foundation (`core-v2/`)
- **Purpose**: Provide foundational types and utilities
- **Key Features**:
  - Type definitions and augmentations
  - Error handling infrastructure
  - Logging and monitoring
  - Shared utilities
  - Test helpers

### Authentication (`middleware-v2/auth/`)
- **Purpose**: Handle user authentication and authorization
- **Key Features**:
  - JWT validation with Auth0
  - Role-based access control (RBAC)
  - User context extraction
  - Strong type safety
  - Testable auth flows

### Security (`middleware-v2/security/`)
- **Purpose**: Implement security best practices
- **Key Features**:
  - CORS with strict origin checking
  - Helmet security headers
  - Rate limiting with Redis
  - Request validation
  - XSS prevention

### Validation (`middleware-v2/validation/`)
- **Purpose**: Ensure data integrity with Zod
- **Key Features**:
  - Request body validation
  - Query parameter validation
  - Route parameter validation
  - Type inference
  - Custom validators

### Error Handling (`core-v2/errors/`)
- **Purpose**: Provide consistent error handling
- **Key Features**:
  - Structured error types
  - Error transformation
  - Request tracking
  - Safe error messages
  - Error logging

## V2 Usage Examples

### Project Routes
```typescript
// routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { extractUser } from '../../../middleware-v2/auth/extractUser';
import { requireRoles } from '../../../middleware-v2/auth/roles';
import { validateRequest } from '../../../middleware-v2/validation/validate';
import { ProjectController } from './controller';

const getProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export function createProjectRouter(): Router {
  const router = Router();
  const controller = new ProjectController();

  router.get('/:id',
    extractUser(),                    // Add user to request
    requireRoles(['OWNER', 'MEMBER']), // Check permissions
    validateRequest(getProjectSchema), // Validate params
    controller.getProject.bind(controller)
  );

  return router;
}
```

### Admin Routes
```typescript
// admin/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { extractUser } from '../../../middleware-v2/auth/extractUser';
import { requireRoles } from '../../../middleware-v2/auth/roles';
import { validateRequest } from '../../../middleware-v2/validation/validate';

const updateSettingsSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    features: z.array(z.string())
  })
});

export function createAdminRouter(): Router {
  const router = Router();
  const controller = new AdminController();

  router.post('/settings',
    extractUser(),
    requireRoles('ADMIN'),
    validateRequest(updateSettingsSchema),
    controller.updateSettings.bind(controller)
  );

  return router;
}
```

## V2 Best Practices

1. **Type Safety First**
   ```typescript
   // Define request schema with Zod
   const schema = z.object({
     body: z.object({
       name: z.string()
     }),
     params: z.object({
       id: z.string().uuid()
     })
   });

   // Type is inferred from schema
   type RequestType = z.infer<typeof schema>;

   // Controller is fully typed
   class Controller {
     async handle(
       req: Request & RequestType,
       res: Response
     ): Promise<void> {
       // req.body.name is string
       // req.params.id is string
     }
   }
   ```

2. **Error Handling**
   ```typescript
   import { AppError } from '../../../core-v2/errors';

   class ProjectService {
     async getProject(id: string): Promise<Project> {
       const project = await this.repo.findById(id);
       if (!project) {
         throw AppError.notFound('Project not found');
       }
       if (!project.isActive) {
         throw AppError.forbidden('Project is archived');
       }
       return project;
     }
   }
   ```

3. **Middleware Composition**
   ```typescript
   // Compose middleware in order:
   // 1. Authentication
   // 2. Authorization
   // 3. Validation
   // 4. Business Logic

   router.post('/projects',
     extractUser(),           // Auth
     requireRoles('OWNER'),   // Auth
     validateRequest(schema), // Validation
     controller.create        // Logic
   );
   ```

4. **Testing**
   ```typescript
   describe('ProjectController', () => {
     let controller: ProjectController;
     let mockService: jest.Mocked<ProjectService>;

     beforeEach(() => {
       mockService = {
         getProject: jest.fn()
       } as any;
       controller = new ProjectController(mockService);
     });

     it('should return 404 for missing project', async () => {
       mockService.getProject.mockRejectedValue(
         AppError.notFound('Project not found')
       );

       const req = mockRequest({ params: { id: '123' } });
       const res = mockResponse();
       const next = jest.fn();

       await controller.getProject(req, res, next);

       expect(next).toHaveBeenCalledWith(
         expect.any(AppError)
       );
     });
   });
   ```

## V2 Migration Guide

1. **Create V2 Structure**
   ```
   features-v2/
   └── projects/
       ├── model.ts      # Data models
       ├── service.ts    # Business logic
       ├── controller.ts # Request handling
       └── routes.ts     # Route definitions
   ```

2. **Update Imports**
   ```typescript
   // Old v1 imports
   import { auth } from '@middleware/auth';
   import { validate } from '@middleware/validation';

   // New v2 imports
   import { extractUser } from '@middleware-v2/auth/extractUser';
   import { validateRequest } from '@middleware-v2/validation/validate';
   ```

3. **Add Type Safety**
   ```typescript
   // Add Zod schemas
   const schema = z.object({/*...*/});
   type RequestType = z.infer<typeof schema>;

   // Use type-safe middleware
   router.use(validateRequest(schema));

   // Type-safe controller
   class Controller {
     async handle(
       req: Request & RequestType,
       res: Response
     ): Promise<void> {
       // Fully typed request
     }
   }
   ```

4. **Test Everything**
   ```typescript
   // Unit tests for service
   describe('ProjectService', () => {
     it('should validate input', () => {/*...*/});
     it('should handle errors', () => {/*...*/});
   });

   // Integration tests for routes
   describe('ProjectRoutes', () => {
     it('should require auth', () => {/*...*/});
     it('should validate input', () => {/*...*/});
   });
   ```