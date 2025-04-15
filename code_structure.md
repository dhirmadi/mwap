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

1. **App.tsx**
   - Main application shell
   - Navigation structure
   - Authentication state management
   - Route definitions

2. **Pages**
   - Modular page components
   - Each page is a standalone module
   - Lazy loading ready
   - TypeScript interfaces

3. **Auth**
   - Auth0 integration
   - Protected routes
   - User context
   - Token management

### Backend Components

1. **Environment Management**
   - Strong typing for all configurations
   - Validation on startup
   - Environment-specific settings
   - Secure secrets handling

2. **Middleware Stack**
   - Authentication validation
   - Error handling
   - Security headers
   - Request validation
   - Rate limiting
   - Request logging
   - Response transformation

3. **API Routes**
   - Modular routing system
   - Type-safe request/response
   - Protected endpoints
   - Error boundary
   - Health check endpoint

4. **Logging & Monitoring**
   - Winston logger for Heroku
   - Logfmt format for parsing
   - Request ID tracking
   - High-resolution timing
   - Memory statistics
   - Service uptime monitoring
   - Type-safe logging
   - Structured metadata

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

1. **Technical Debt**
   - Testing infrastructure removed (needs reimplementation)
   - Some 'any' types present in TypeScript
   - Limited error handling in some areas
   - Documentation needs regular updates

2. **Dependencies**
   - Multiple external services (Auth0, MongoDB)
   - Regular updates needed for security
   - Service coupling considerations
   - Cost implications for scaling

3. **Performance**
   - Memory usage warnings in build process
   - No caching implementation yet
   - Full page reloads on navigation
   - Large bundle potential

4. **Maintenance**
   - Regular dependency updates needed
   - Service configuration management
   - Environment variable coordination
   - Multiple deployment targets

## Future Improvements

1. **Testing**
   - Implement comprehensive testing suite
   - Add integration tests
   - Set up CI/CD testing
   - Add test coverage reporting

2. **TypeScript**
   - Stricter type checking
   - Remove remaining 'any' types
   - Add proper type documentation
   - Enhance type safety

3. **Performance**
   - Implement caching
   - Optimize build process
   - Add code splitting
   - Improve load times

4. **Features**
   - User management
   - Role-based access
   - Analytics integration
   - Enhanced profile features

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