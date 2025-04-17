# MWAP Architecture Documentation

## Overview

MWAP (Modular Web Application Platform) is a full-stack TypeScript application built with modern technologies. It provides a foundation for building scalable web applications with authentication, cloud storage integration, and a modular architecture.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine UI v7
- **Routing**: React Router v6
- **Authentication**: Auth0 React SDK
- **State Management**: React hooks and context
- **Type Safety**: TypeScript with strict mode

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: 
  - Auth0 for user authentication
  - OAuth for cloud storage providers
- **Security**: 
  - JWT validation
  - Rate limiting
  - CORS
  - Helmet
- **Configuration**: Environment-based with validation
- **Logging & Monitoring**:
  - Winston logger
  - Logfmt format
  - Request tracking
  - Integration state logging
  - Health monitoring
  - Memory metrics

### Infrastructure
- **Hosting**: Heroku
- **Database**: MongoDB Atlas
- **Authentication**: Auth0
- **Cloud Storage**: Multiple provider support
- **CI/CD**: Heroku Pipeline with review apps

## Project Structure

```
mwap/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── core/          # Core functionality
│   │   │   ├── auth/      # Auth0 and OAuth configuration
│   │   │   │   ├── oauth.tsx    # OAuth flow management
│   │   │   │   └── provider-instructions.ts
│   │   │   └── api/      # API integration
│   │   ├── components/    # React components
│   │   │   ├── tenant/   # Tenant management
│   │   │   │   ├── CloudIntegrations.tsx
│   │   │   │   ├── TenantProjects.tsx
│   │   │   │   └── TokenInput.tsx
│   │   │   └── project/  # Project management
│   │   ├── hooks/        # Custom React hooks
│   │   │   ├── useCloudIntegrations.ts
│   │   │   ├── useCreateProject.ts
│   │   │   └── useTenant.ts
│   │   ├── pages/        # Page components
│   │   ├── types/        # TypeScript definitions
│   │   ├── App.tsx       # Main application
│   │   └── main.tsx      # Entry point
│   └── vite.config.ts    # Build configuration
│
├── server/                # Backend application
│   ├── src/
│   │   ├── core/         # Core functionality
│   │   │   ├── auth/     # Authentication
│   │   │   │   ├── oauth-config.ts   # Provider config
│   │   │   │   └── oauth-client.ts   # Token handling
│   │   │   ├── logging/  # Logging infrastructure
│   │   │   ├── middleware/ # Core middleware
│   │   │   ├── types/    # Core type definitions
│   │   │   └── validation/ # Request validation
│   │   ├── features/     # Feature modules
│   │   │   ├── tenant/   # Tenant management
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── integrations.controller.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── routes/
│   │   │   │   ├── schemas/
│   │   │   │   └── types/
│   │   │   ├── projects/ # Project management
│   │   │   └── users/    # User management
│   │   ├── routes/       # API routes
│   │   │   ├── auth.ts   # OAuth endpoints
│   │   │   └── v1.ts     # API versioning
│   │   └── index.ts      # Server entry
│   └── tsconfig.json     # TypeScript config
│
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── development/      # Development guides
│   └── standards/        # Coding standards
│
├── scripts/              # Utility scripts
├── .env.example         # Environment templates
└── Procfile            # Heroku configuration
```

## Key Components

### Authentication System

1. **User Authentication (Auth0)**
   - JWT validation and refresh
   - Role-based access control
   - User profile management
   - Session handling

2. **OAuth Integration**
   - Multiple provider support
   - Token exchange and refresh
   - State management
   - Error handling
   - Provider-specific configuration

### Cloud Storage Integration

1. **Provider Management**
   - Multiple simultaneous providers
   - Safe merge strategy
   - Token refresh handling
   - Integration removal
   - State persistence

2. **OAuth Flow**
   - Provider configuration
   - Token exchange
   - State management
   - Error handling
   - Callback processing

3. **Type Safety**
   - Zod validation
   - TypeScript interfaces
   - Runtime checks
   - Error boundaries

### Tenant Management

1. **Core Features**
   - Tenant creation and updates
   - Member management
   - Role-based access
   - Integration management
   - Project organization

2. **Cloud Integration**
   - Provider connections
   - Token management
   - Integration status
   - Usage tracking

### Project Management

1. **Core Features**
   - Project creation
   - Member management
   - Role assignment
   - Resource access

2. **Integration**
   - Cloud storage access
   - Permission management
   - Resource sharing

## Development Guidelines

### Code Organization

1. **Feature-First Structure**
   - Modular feature organization
   - Clear separation of concerns
   - Shared core utilities
   - Type-safe interfaces

2. **Component Design**
   - Single responsibility
   - Clear interfaces
   - Proper error handling
   - Comprehensive logging

### Best Practices

1. **TypeScript Usage**
   - Strict mode enabled
   - Proper type definitions
   - Interface segregation
   - Type safety

2. **Error Handling**
   - Consistent error types
   - Proper error propagation
   - User-friendly messages
   - Error logging

3. **Security**
   - OAuth best practices
   - Token management
   - Input validation
   - Error masking
   - Rate limiting

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E testing
   - Test coverage

### Development Workflow

1. **Local Development**
   ```bash
   # Frontend
   cd client
   npm install
   npm run dev

   # Backend
   cd server
   npm install
   npm run dev
   ```

2. **Environment Setup**
   - Copy .env.example to .env
   - Configure Auth0 credentials
   - Set up MongoDB connection
   - Configure OAuth providers
   - Set security parameters

3. **Deployment**
   - Review apps for PRs
   - Staging environment
   - Production deployment
   - Performance monitoring

## Future Improvements

1. **Authentication**
   - Enhanced token refresh
   - Better error messages
   - Session management
   - MFA support

2. **Cloud Integration**
   - Additional providers
   - Better token management
   - Usage analytics
   - Quota management

3. **Project Management**
   - Project templates
   - Resource sharing
   - Usage analytics
   - Archival system

4. **Technical Infrastructure**
   - Enhanced testing
   - Performance monitoring
   - Caching layer
   - Search functionality

5. **Security**
   - Audit logging
   - Security monitoring
   - Data encryption
   - Compliance features

## Support and Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Mantine UI Documentation](https://mantine.dev/)