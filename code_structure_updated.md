# MWAP Code Structure Documentation (Updated)

## Overview
MWAP (Modular Web Application Platform) is a full-stack TypeScript application built with modern technologies. It provides a foundation for building scalable web applications with authentication, user management, and a modular architecture.

## Project Structure

```
mwap/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── assets/        # Static assets (react.svg)
│   │   ├── auth/          # Auth0 configuration
│   │   │   └── Auth0Provider.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useAuth.ts # Authentication hook
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx   # Home page
│   │   │   └── Profile.tsx# User profile page
│   │   ├── services/      # API services
│   │   │   └── api.ts     # API client configuration
│   │   ├── App.tsx        # Main application component
│   │   ├── main.tsx       # Application entry point
│   │   ├── index.css      # Global styles
│   │   └── vite-env.d.ts  # Vite type definitions
│   ├── index.html         # HTML entry point
│   ├── tsconfig.json      # TypeScript configuration
│   ├── tsconfig.app.json  # App-specific TS config
│   ├── tsconfig.node.json # Node-specific TS config
│   └── vite.config.ts     # Vite build configuration
│
├── server/                # Backend application
│   ├── src/
│   │   ├── config/       # Configuration management
│   │   │   ├── db.ts     # Database configuration
│   │   │   └── environment.ts # Environment configuration
│   │   ├── middleware/   # Express middleware
│   │   │   ├── auth.ts   # Authentication middleware
│   │   │   ├── errors.ts # Error handling
│   │   │   └── security.ts# Security middleware
│   │   ├── routes/       # API routes
│   │   │   ├── index.ts  # Route aggregation
│   │   │   └── users.ts  # User-related routes
│   │   ├── types/        # TypeScript type definitions
│   │   │   └── user.ts   # User-related types
│   │   └── index.ts      # Server entry point
│   └── tsconfig.json     # TypeScript configuration
│
├── scripts/              # Utility scripts
├── .env.example         # Environment variable templates
└── Procfile            # Heroku deployment configuration
```

## Technology Stack

### Frontend (Updated)
- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 5.1.4
- **UI Library**: Mantine UI 7.6.1
- **Form Management**: Mantine Form 7.17.3
- **Routing**: React Router v6.30.0
- **Authentication**: Auth0 React SDK 2.2.4
- **HTTP Client**: Axios 1.6.7
- **Icons**: Tabler Icons React 3.31.0
- **Type Safety**: TypeScript 5.3.3

### Backend (Updated)
- **Runtime**: Node.js 20.x
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose 8.2.1
- **Authentication**: 
  - express-oauth2-jwt-bearer 1.6.0
  - express-jwt 8.4.1
- **Security**: 
  - Helmet 7.1.0
  - Rate limiting
  - CORS 2.8.5
  - Compression 1.8.0
- **Logging**: Winston 3.11.0
- **Development**: ts-node-dev for hot reloading

### Development Tools (Updated)
- **Linting**: ESLint 8.57.0
- **Formatting**: Prettier 3.2.5
- **Git Hooks**: Husky 9.0.11
- **Concurrent Development**: concurrently 8.2.2
- **TypeScript**: 5.3.3

## Key Components

### Frontend Components

1. **Auth0Provider.tsx**
   - Auth0 authentication context provider
   - Centralized authentication state
   - Token management
   - User session handling

2. **useAuth.ts**
   - Custom hook for Auth0 integration
   - Authentication state access
   - User profile management
   - Login/logout functionality

3. **Pages**
   - Home.tsx: Landing page component
   - Profile.tsx: User profile management
   - Modular structure for easy expansion

4. **API Service**
   - Centralized API client configuration
   - Axios instance setup
   - Request/response interceptors
   - Error handling

### Backend Components

1. **Environment Management**
   - TypeScript-based configuration
   - Environment variable validation
   - Secure secrets handling
   - Database connection management

2. **Middleware Stack**
   - JWT authentication validation
   - Error handling and logging
   - Security headers (Helmet)
   - Rate limiting protection
   - CORS configuration
   - Request compression

3. **API Routes**
   - Modular routing system
   - Type-safe request/response handling
   - Protected endpoints
   - User management endpoints

## Development Workflow

1. **Local Development**
   ```bash
   # Full stack development
   npm run dev

   # Frontend only
   cd client && npm run dev

   # Backend only
   cd server && npm run dev
   ```

2. **Environment Setup**
   - Configure .env file from .env.example
   - Set up Auth0 application credentials
   - Configure MongoDB connection string
   - Set security parameters

3. **Build Process**
   ```bash
   # Full application build
   npm run build

   # Frontend build
   npm run build:client

   # Backend build
   npm run build:server
   ```

## Current Status

### Strengths
1. **Modern Stack**: Latest versions of React, TypeScript, and Node.js
2. **Security**: Comprehensive security middleware implementation
3. **Development Experience**: Hot reloading, concurrent development
4. **UI Components**: Rich UI library with Mantine
5. **Type Safety**: Full TypeScript implementation

### Areas for Improvement
1. **Testing**: No visible test infrastructure
2. **Documentation**: Limited inline documentation
3. **Error Handling**: Could be more comprehensive
4. **API Documentation**: No API specs or documentation

## Getting Started

1. **Prerequisites**
   - Node.js 20.x
   - npm 10.x
   - MongoDB instance
   - Auth0 account

2. **Installation**
   ```bash
   # Clone and setup
   git clone https://github.com/dhirmadi/mwap.git
   cd mwap
   npm run setup

   # Start development
   npm run dev
   ```

## Best Practices

1. **Code Quality**
   - Use TypeScript for all new code
   - Follow ESLint configuration
   - Run Prettier before commits
   - Use Husky git hooks

2. **Security**
   - Never commit secrets
   - Use environment variables
   - Implement rate limiting
   - Follow Auth0 best practices

3. **Development Process**
   - Create feature branches
   - Write meaningful commits
   - Update documentation
   - Test thoroughly

## Future Recommendations

1. **Testing Infrastructure**
   - Implement Jest/React Testing Library
   - Add API integration tests
   - Set up CI/CD testing
   - Add test coverage reporting

2. **Documentation**
   - Add JSDoc comments
   - Create API documentation
   - Update component documentation
   - Add architecture diagrams

3. **Performance**
   - Implement caching
   - Add code splitting
   - Optimize bundle size
   - Add performance monitoring

4. **Features**
   - Enhanced user management
   - Role-based access control
   - Analytics integration
   - Real-time features

## Resources

- [Auth0 React SDK Documentation](https://auth0.com/docs/libraries/auth0-react)
- [Mantine UI Documentation](https://mantine.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)