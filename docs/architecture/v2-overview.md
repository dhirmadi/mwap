# MWAP V2 Architecture Overview

## System Architecture

### Core Principles
- Modular Design
- Type Safety
- Scalable Microservices
- Security-First Approach
- Cloud-Native Implementation

### Technology Stack
- **Frontend**: React 18 + Vite + Mantine UI
- **Backend**: Node.js (ESM) + Express
- **Database**: MongoDB Atlas
- **Authentication**: Auth0 (PKCE, MFA)
- **Cloud Storage**: Multi-provider integration
- **Hosting**: Heroku Standard-2X Dynos
- **CI/CD**: GitHub Actions

## Architectural Components

### 1. Authentication Layer
- **Provider**: Auth0
- **Authentication Flow**: 
  - PKCE (Proof Key for Code Exchange)
  - Single Page Application (SPA) Flow
- **User Identification**:
  - Unique `sub` claim as primary identifier
  - No local user model persistence
  - Direct Auth0 token validation

#### User Identity Management
```typescript
interface UserIdentity {
  sub: string;        // Unique Auth0 identifier
  email: string;
  name: string;
  provider: string;   // Authentication provider
}
```

### 2. Core V2 Architecture
#### Directory Structure
```
core-v2/
├── auth/             # Authentication utilities
├── config/           # Configuration management
├── errors/           # Centralized error handling
├── logging/          # Logging infrastructure
└── middleware/       # Shared middleware components
```

### 3. Features Architecture
#### Design Pattern
- Modular feature-based design
- Separation of concerns
- Type-safe implementations

#### Feature Structure
```
features-v2/
├── projects/
│   ├── model.ts      # Feature data model
│   ├── service.ts    # Business logic
│   └── members.ts    # Member management
├── tenants/
│   ├── model.ts
│   └── service.ts
└── invites/
    ├── model.ts
    └── service.ts
```

### 4. API Layer
#### API Design Principles
- RESTful endpoint design
- Consistent error handling
- Type-safe request/response
- Role-based access control

#### API Versioning
- `/api/v2/` prefix for all endpoints
- Explicit version management
- Backward compatibility considerations

### 5. Data Model Evolution
#### Key Changes
- No local user persistence
- Auth0 `sub` as primary identifier
- Simplified model relationships
- Enhanced type safety

#### Example Model
```typescript
interface Project {
  id: string;
  name: string;
  ownerId: string;  // Auth0 sub
  members: {
    userId: string; // Auth0 sub
    role: ProjectRole;
  }[];
}
```

### 6. Security Considerations
- JWT token validation
- Role-based access control
- Input sanitization
- Secure cloud storage integration
- Rate limiting
- CORS protection

### 7. Error Handling
#### Centralized Error Management
```typescript
class AppError extends Error {
  statusCode: number;
  code: string;
  details?: ErrorDetails;

  // Static methods for common error types
  static forbidden(): AppError;
  static badRequest(): AppError;
  static internal(): AppError;
}
```

### 8. Logging and Monitoring
- Structured logging
- Performance tracking
- Error tracking
- Audit trail generation

## Deployment Strategy
- Heroku Standard-2X Dynos
- Environment-specific configurations
- Automated CI/CD pipeline
- Review apps for pull requests

## Migration Considerations
- Gradual feature migration
- No breaking changes
- Backward compatibility
- Comprehensive test coverage

## Performance Optimization
- Efficient database queries
- Minimal data transformation
- Caching strategies
- Lazy loading

## Future Roadmap
- Serverless architecture exploration
- Enhanced multi-tenant support
- Advanced analytics
- Machine learning integrations

## Best Practices
- DRY (Don't Repeat Yourself) principles
- Comprehensive test coverage
- Continuous refactoring
- Regular security audits

## Monitoring and Observability
- Centralized logging
- Performance metrics
- Error tracking
- User activity monitoring