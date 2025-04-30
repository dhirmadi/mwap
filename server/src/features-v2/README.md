# MWAP v2 Features

New API modules for v2 endpoints. These modules follow a standardized structure and use only core-v2 dependencies.

## Module Structure

Each feature module follows this structure:
- `controller.ts` - Request handlers and response formatting
- `service.ts` - Business logic and data operations
- `model.ts` - Data models and validation schemas
- `routes.ts` - Route definitions and middleware
- `index.ts` - Public API exports

## Features

- `tenants/` - Tenant management and settings
- `projects/` - Project CRUD and access control
- `invites/` - User invitations and role assignments
- `project-types/` - Project type definitions and validation

## Guidelines

1. Use only `core-v2` and `middleware-v2` imports
2. Follow REST API best practices
3. Implement proper validation and error handling
4. Write unit tests for all components
5. Document public APIs