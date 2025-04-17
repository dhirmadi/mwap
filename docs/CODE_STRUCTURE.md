# Code Structure

## Server Architecture

### Core Components

#### Authentication (`/server/src/core/auth/`)
- `oauth-config.ts`: OAuth provider configuration and URL management
- `oauth-client.ts`: Token exchange and OAuth flow handling
- `middleware/auth.ts`: JWT validation and user extraction

#### Error Handling (`/server/src/core/errors/`)
- Custom error types for different scenarios
- Error transformation middleware
- Consistent error response format

#### Logging (`/server/src/core/logging/`)
- Request logging with correlation IDs
- Error tracking with stack traces
- Integration update logging
- Performance metrics

#### Validation (`/server/src/core/validation/`)
- Zod schemas for request validation
- Parameter validation middleware
- Type-safe request handling

### Feature Modules

#### Tenant Management (`/server/src/features/tenant/`)
- **Controllers**
  - `integrations.controller.ts`: Cloud storage integration management
  - `index.ts`: Core tenant operations
- **Routes**
  - `integrations.routes.ts`: Integration-specific endpoints
  - `index.ts`: Core tenant endpoints
- **Schemas**
  - `validation.ts`: Zod schemas for tenant operations
  - `index.ts`: Mongoose models and types
- **Types**
  - `api.ts`: API request/response types
  - `index.ts`: Shared type definitions

#### Project Management (`/server/src/features/projects/`)
- Controllers for project operations
- Member management
- Role-based access control
- Project settings

#### User Management (`/server/src/features/users/`)
- Profile management
- Role assignment
- Tenant association

### API Routes (`/server/src/routes/`)
- `auth.ts`: OAuth endpoints and callbacks
- `v1.ts`: API version routing
- Feature-specific route modules

## Client Architecture

### Core Components

#### Authentication (`/client/src/core/auth/`)
- `oauth.tsx`: OAuth flow management
- `provider-instructions.ts`: Provider-specific setup guides
- Auth0 integration

#### API Integration (`/client/src/core/api/`)
- Type-safe API client
- Request/response handling
- Error management

### Feature Components

#### Tenant Management (`/client/src/components/tenant/`)
- `CloudIntegrations.tsx`: Cloud storage provider management
- `TenantProjects.tsx`: Project listing and management
- `CreateProjectForm.tsx`: Project creation
- `TokenInput.tsx`: OAuth token management

#### Project Management (`/client/src/components/project/`)
- Project creation and editing
- Member management interface
- Role management

### Hooks (`/client/src/hooks/`)
- `useCloudIntegrations.ts`: Integration management
- `useCreateProject.ts`: Project creation
- `useProjectRole.ts`: Role management
- `useTenant.ts`: Tenant operations

### Types (`/client/src/types/`)
- API types
- Component props
- Shared interfaces

## Key Features

### Cloud Storage Integration
1. **OAuth Flow**
   - Provider configuration
   - Token exchange
   - State management
   - Error handling

2. **Integration Management**
   - Safe merge strategy
   - Multiple provider support
   - Token refresh handling
   - Integration removal

3. **Type Safety**
   - Zod validation
   - TypeScript interfaces
   - Runtime checks

### Project Management
1. **Creation and Setup**
   - Validation
   - Member assignment
   - Role configuration

2. **Access Control**
   - Role-based permissions
   - Member management
   - Resource protection

## Development Guidelines

### Code Organization
1. Feature-first organization
2. Shared core utilities
3. Clear separation of concerns
4. Type-safe interfaces

### Best Practices
1. Use TypeScript strictly
2. Implement proper error handling
3. Add comprehensive logging
4. Follow REST principles
5. Maintain test coverage

### Security
1. OAuth best practices
2. Token management
3. Role validation
4. Input sanitization
5. Error masking