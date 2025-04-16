# MWAP Code Structure Documentation

## Overview
MWAP (Modular Web Application Platform) is a full-stack TypeScript application built with modern technologies. It provides a foundation for building scalable web applications with authentication, user management, and a modular architecture.

## Project Structure

```
mwap/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── auth/          # Auth0 configuration and hooks
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx   # Home page
│   │   │   └── Profile.tsx# User profile page
│   │   ├── services/      # API services
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
│   ├── index.html         # HTML entry point
│   ├── tsconfig.json      # TypeScript configuration
│   └── vite.config.ts     # Vite build configuration
│
├── server/                # Backend application
│   ├── src/
│   │   ├── core/         # Core functionality
│   │   │   ├── logging/  # Logging infrastructure
│   │   │   │   ├── config.ts   # Winston configuration
│   │   │   │   ├── logfmt.ts   # Logfmt formatter
│   │   │   │   └── test.ts     # Logger tests
│   │   │   ├── middleware/     # Core middleware
│   │   │   │   ├── auth.ts     # Authentication
│   │   │   │   ├── error-handler.ts  # Error handling
│   │   │   │   ├── request-logger.ts # Request logging
│   │   │   │   ├── transform.ts      # Response transformation
│   │   │   │   └── validation.ts     # Request validation
│   │   │   ├── routes/         # Core routes
│   │   │   │   ├── health.ts   # Health check endpoint
│   │   │   │   └── index.ts    # Route aggregation
│   │   │   ├── types/          # Core type definitions
│   │   │   │   ├── auth.ts     # Auth types
│   │   │   │   ├── errors.ts   # Error types
│   │   │   │   ├── responses.ts # Response types
│   │   │   │   └── index.ts    # Type exports
│   │   │   └── validation/     # Validation schemas
│   │   │       └── schemas.ts  # Zod schemas
│   │   ├── config/       # Configuration management
│   │   │   ├── db.ts     # Database configuration
│   │   │   └── environment.ts # Environment configuration
│   │   ├── features/     # Feature modules
│   │   │   ├── tenant/  # Tenant management
│   │   │   │   ├── routes.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── schema.ts
│   │   │   │   └── types/
│   │   │   │       ├── api.ts  # API types
│   │   │   │       └── index.ts
│   │   │   ├── projects/      # Project management
│   │   │   │   └── types/
│   │   │   │       ├── api.ts
│   │   │   │       ├── roles.ts
│   │   │   │       └── project.ts
│   │   │   ├── invites/       # Invitation system
│   │   │   │   └── types/
│   │   │   │       └── api.ts
│   │   │   └── superadmin/    # Admin features
│   │   └── index.ts      # Server entry point
│   └── tsconfig.json     # TypeScript configuration
│
├── scripts/              # Utility scripts
├── .env.example         # Environment variable templates
└── Procfile            # Heroku deployment configuration

```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine UI
- **Routing**: React Router v6
- **Authentication**: Auth0 React SDK
- **State Management**: React hooks and context
- **Type Safety**: TypeScript with strict mode

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Auth0
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
  - Health monitoring
  - Memory metrics

### Infrastructure
- **Hosting**: Heroku
- **Database**: MongoDB Atlas
- **Authentication**: Auth0
- **CI/CD**: Heroku Pipeline with review apps

## Key Components

### Frontend Components

1. **Auth Module**
   - Auth0Provider: Configuration and setup
   - useAuth: Token and state management
   - Protected routes with role checks
   - Error handling and recovery
   - Token refresh logic

2. **Tenant Module**
   - TenantStatus: Workspace management
   - TenantForm: Creation and updates
   - TenantContext: State management
   - Member management
   - Role-based access

3. **Project Module**
   - MyProjects: Project listing
   - ProjectForm: Creation and updates
   - ProjectContext: State management
   - Member management
   - Role validation

### Backend Components

1. **Auth Module**
   - Token validation middleware
   - User extraction from tokens
   - Role-based access control
   - Error handling and logging
   - Token refresh handling
   - Auth0 integration

2. **Tenant Module**
   - Schema with string IDs
   - Member management
   - Role validation
   - Optimized indexes
   - Detailed logging
   - Error handling

3. **Project Module**
   - Schema with string IDs
   - Member management
   - Role validation
   - Optimized indexes
   - Detailed logging
   - Error handling

4. **Core Infrastructure**
   - Error handling middleware
   - Validation middleware
   - Logging system
   - Type definitions
   - Security headers
   - Rate limiting

5. **Database Layer**
   - MongoDB with Mongoose
   - Optimized indexes
   - Type-safe schemas
   - Validation rules
   - Error handling
   - Connection management

6. **Logging & Monitoring**
   - Structured logging
   - Request tracking
   - Error tracking
   - Performance metrics
   - Debug information
   - Health checks

## Development Workflow

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
   - Configure security settings

3. **Deployment**
   - Automatic review apps for PRs
   - Staging environment for testing
   - Production deployment via Heroku

## Opportunities

1. **Extensibility**
   - Modular architecture allows easy feature addition
   - Strong typing supports safe extensions
   - Component-based design for reusability
   - Environment-aware configuration

2. **Security**
   - Built-in security best practices
   - Auth0 integration for reliable auth
   - Environment variable management
   - Type safety reduces vulnerabilities

3. **Scalability**
   - MongoDB for flexible data storage
   - Stateless authentication
   - Rate limiting built-in
   - Heroku scaling capabilities

4. **Developer Experience**
   - Full TypeScript support
   - Modern tooling (Vite, React 18)
   - Comprehensive documentation
   - Quick setup process

## Risks and Challenges

1. **Authentication**
   - Token refresh could be more robust
   - Need better error messages for auth failures
   - Need better handling of expired tokens
   - Need to improve auth state management

2. **Tenant Management**
   - Need better validation for tenant names
   - Need to handle tenant deletion more gracefully
   - Need proper tenant settings management
   - Need better member role validation

3. **Project Management**
   - Project creation needs proper tenant context
   - Project roles need better validation
   - Need proper project settings
   - Need better project member management

4. **Technical Debt**
   - Some duplicate indexes still present
   - Need to improve error handling consistency
   - Need better logging structure
   - Need to improve type safety in some areas

5. **Testing**
   - Need to add unit tests
   - Need to add integration tests
   - Need to add end-to-end tests
   - Need proper test coverage

6. **Documentation**
   - API documentation needs improvement
   - Need better code documentation
   - Need better setup documentation
   - Need deployment documentation update

## Future Improvements

1. **Authentication**
   - Improve token refresh mechanism
   - Add better error messages
   - Improve token validation
   - Add session management
   - Add role-based access control

2. **Tenant Management**
   - Add tenant settings
   - Improve member management
   - Add tenant analytics
   - Add tenant customization
   - Add tenant backup/restore

3. **Project Management**
   - Add project templates
   - Add project settings
   - Add project analytics
   - Add project sharing
   - Add project archiving

4. **Technical Infrastructure**
   - Add comprehensive testing
   - Improve error handling
   - Add performance monitoring
   - Add caching layer
   - Add search functionality

5. **Developer Experience**
   - Add API documentation
   - Improve code documentation
   - Add development guides
   - Add contribution guidelines
   - Add deployment guides

6. **Security**
   - Add audit logging
   - Add security monitoring
   - Add data encryption
   - Add backup system
   - Add compliance features

## Getting Started

1. **Prerequisites**
   - Node.js 20.x
   - npm 10.x
   - MongoDB Atlas account
   - Auth0 account

2. **Setup Steps**
   ```bash
   # Clone repository
   git clone https://github.com/dhirmadi/mwap.git
   cd mwap

   # Install dependencies
   npm install
   cd client && npm install
   cd ../server && npm install

   # Configure environment
   cp .env.example .env
   # Edit .env with your credentials

   # Start development
   npm run dev
   ```

3. **First Steps**
   - Review documentation
   - Set up Auth0 application
   - Configure MongoDB connection
   - Test authentication flow

## Best Practices

1. **Code Organization**
   - Follow existing module structure
   - Use TypeScript for all new code
   - Maintain component isolation
   - Document new features

2. **Security**
   - Never commit secrets
   - Use environment variables
   - Follow Auth0 best practices
   - Implement rate limiting

3. **Development**
   - Create feature branches
   - Write meaningful commits
   - Update documentation
   - Test thoroughly

4. **Deployment**
   - Use review apps for testing
   - Verify staging deployment
   - Monitor performance
   - Check security headers

## Support and Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Mantine UI Documentation](https://mantine.dev/)