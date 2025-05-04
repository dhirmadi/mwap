# 🚀 MWAP - Modular Web Application Platform v2

MWAP is a secure, scalable SaaS framework for building multi-tenant web applications with modern cloud storage integration.

## 🌟 Overview

MWAP v2 provides:
- Multi-tenant user management with role-based access control
- Project-based collaboration with granular permissions
- Cloud storage integration (Dropbox, Google Drive, Box, OneDrive)
- Secure authentication via Auth0 with PKCE flow
- API-first architecture with TypeScript end-to-end

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + Mantine UI
- **Backend**: Node.js (ESM) + Express + MongoDB Atlas
- **Authentication**: Auth0 (PKCE, MFA)
- **Storage**: Multi-provider cloud integration
- **Hosting**: Heroku Standard-2X Dynos
- **CI/CD**: GitHub Actions

## ⚠️ Legacy Code Notice

V1 modules have been moved to `server/src/legacy/` and are deprecated. Do not use these in new code. See the [migration guide](docs/migration-checklist.md) for details on upgrading to v2.

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.x)
- npm (v10.x)
- MongoDB Atlas account
- Auth0 account
- Heroku CLI (for deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhirmadi/mwap.git
   cd mwap
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd client && npm install

   # Install backend dependencies
   cd ../server && npm install
   ```

3. **Environment Configuration**

   Create `.env` files in both client and server directories:

   ```bash
   # In /client
   cp .env.example .env

   # In /server
   cp .env.example .env
   ```

   Fill in the environment variables:

   **Frontend (.env)**
   ```env
   # Auth0 Configuration
   VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_AUTH0_AUDIENCE=your-auth0-api-identifier

   # API Configuration
   VITE_API_URL=http://localhost:3000/api

   # Feature Flags (optional)
   VITE_ENABLE_DEBUG=false
   VITE_ENABLE_ANALYTICS=false
   ```

   **Backend (.env)**
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=debug

   # MongoDB Configuration
   MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
   MONGO_CLIENT_ENCRYPTION_KEY=your-encryption-key
   MONGO_ENCRYPTION_KEY_NAME=your-key-name

   # Auth0 Configuration
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_CLIENT_SECRET=your-auth0-client-secret
   AUTH0_AUDIENCE=your-auth0-api-identifier

   # Security Configuration
   CORS_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Monitoring Configuration
   STATUS_CHECK_INTERVAL=30000
   ENABLE_REQUEST_LOGGING=true
   ```

4. **Start Development Servers**

   ```bash
   # Start both frontend and backend in development mode
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 🏗️ Project Structure

```
mwap/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── auth/          # Auth0 configuration
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
│   ├── vite.config.ts     # Vite configuration
│   └── package.json       # Frontend dependencies
│
├── server/                # Backend application
│   ├── src/
│   │   ├── api/          # API routes and handlers
│   │   │   ├── v2/       # V2 API implementation
│   │   │   └── router.ts # API router configuration
│   │   ├── core-v2/      # Core functionality
│   │   │   ├── errors/   # Error handling
│   │   │   ├── rbac/     # Role-based access control
│   │   │   └── utils/    # Shared utilities
│   │   ├── middleware-v2/ # Modular middleware
│   │   │   ├── auth/     # Authentication middleware
│   │   │   ├── errors/   # Error handling middleware
│   │   │   ├── scoping/  # Tenant/Project scoping
│   │   │   ├── security/ # Security middleware
│   │   │   └── validation/ # Request validation
│   │   ├── models-v2/    # Database models
│   │   ├── types-v2/     # TypeScript type definitions
│   │   ├── legacy/       # Deprecated v1 code
│   │   └── index.ts      # Entry point
│   └── package.json      # Backend dependencies
│
└── package.json          # Root package.json
```

## 🔒 Authentication

This project uses Auth0 for authentication, implementing a Single Page Application (SPA) flow with PKCE.

### Auth0 Setup

1. Create an Auth0 account and application
2. Set Application Type to "Single Page Application"
3. Configure the following URLs in Auth0 dashboard:
   ```
   Allowed Callback URLs:
   - https://*.herokuapp.com
   - http://localhost:5173

   Allowed Logout URLs:
   - https://*.herokuapp.com
   - http://localhost:5173

   Allowed Web Origins:
   - https://*.herokuapp.com
   - http://localhost:5173
   ```

### Authentication Features

- **Secure Authentication Flow**:
  - Authorization Code Flow with PKCE
  - Token management and renewal
  - Secure session handling
  - Protected API routes
  - Consistent ID handling (auth vs internal)

- **Developer Experience**:
  - Custom useAuth hook
  - TypeScript support
  - Error handling
  - Loading states
  - ID mapping utilities

- **ID Management**:
  - Auth0 sub for storage/queries
  - Internal IDs for responses/logs
  - Type-safe ID handling
  - Consistent middleware chain

### Usage in Components

```typescript
import { useAuth } from '../hooks/useAuth';

export function MyComponent() {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    login, 
    logout,
    getToken 
  } = useAuth();

  // Use authentication state and functions
}
```

## 🌐 API Endpoints

The API is currently in development. The following features are implemented:

### Authentication
Authentication is handled through Auth0's endpoints:
- Authorization Code flow with PKCE
- Automatic token renewal
- Secure token storage
- JWT validation middleware

### API Security
All routes are protected by:
```
Authorization: Bearer <token>
```

The following security measures are in place:
- JWT token validation
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- HTTP security headers via Helmet
- Request logging for monitoring

### Available Endpoints

#### Tenant Management
- `POST /api/v2/tenants` - Create new tenant
- `GET /api/v2/tenants/me` - Get current tenant
- `PATCH /api/v2/tenants/:id` - Update tenant
- `DELETE /api/v2/tenants/:id` - Archive tenant

#### Cloud Storage Integration
- `GET /api/v2/cloud/providers` - List available cloud providers
- `POST /api/v2/cloud/oauth/start` - Start OAuth flow
- `POST /api/v2/cloud/oauth/complete` - Complete OAuth flow
- `GET /api/v2/cloud/folders` - List cloud storage folders

#### Project Management
- `GET /api/v2/projects/:id` - Get project details
- `POST /api/v2/projects` - Create new project
- `PATCH /api/v2/projects/:id` - Update project
- `DELETE /api/v2/projects/:id` - Delete project

#### Project Types & Invites
- `GET /api/v2/admin/project-types` - List project types
- `POST /api/v2/projects/:id/invites` - Create project invite
- `GET /api/v2/projects/:id/invites` - List project invites
- `POST /api/v2/invites/redeem` - Redeem invite code

#### System Administration
- `GET /api/v2/admin/providers` - List cloud providers
- `POST /api/v2/admin/providers` - Add cloud provider
- `PATCH /api/v2/admin/providers/:id` - Update provider
- `DELETE /api/v2/admin/providers/:id` - Remove provider

See [API Documentation](./docs/api/v2/README.md) for detailed endpoint specifications.

## 🚀 Deployment

The application is prepared for deployment on Heroku, though the pipeline setup is still in development.

### Current Deployment Setup

1. **Environment Configuration**
   The application supports different environments through:
   - Environment-specific `.env` files
   - Configuration for development, staging, and production
   - Secure credential management

2. **Application Configuration**
   Basic Heroku configuration is in place:
   - `Procfile` for process management
   - `app.json` for application metadata
   - Node.js and npm version specifications
   - Port configuration for Heroku compatibility

### Planned Deployment Features

1. **Heroku Pipeline**
   - Review apps for pull requests
   - Staging environment
   - Production environment
   - Automated deployments

2. **Environment Management**
   ```bash
   # Example staging configuration (planned)
   heroku config:set -a mwap-staging \
     NODE_ENV=production \
     AUTH0_DOMAIN=your-domain \
     AUTH0_CLIENT_ID=your-client-id \
     AUTH0_CLIENT_SECRET=your-client-secret \
     AUTH0_AUDIENCE=your-audience \
     MONGO_URI=your-mongodb-uri \
     VITE_API_URL=https://mwap-staging.herokuapp.com/api
   ```

3. **Review Apps**
   - Automatic creation for pull requests
   - Isolated testing environments
   - Database provisioning
   - Auth0 integration

Note: The deployment pipeline is under development. Manual deployment is currently supported while automated features are being implemented.

## 🔧 Development Guidelines

### Branch Strategy
- Feature branches from `main`
- PRs must be reviewed before merge
- Staging must be tested before production deploy

### Code Style
- Use TypeScript where possible
- Follow ESLint configuration
- Write unit tests for critical functionality

### Commit Messages
- Use clear, descriptive commit messages
- Reference issue numbers when applicable

### Coding Standards
- [DRY Principles](./docs/standards/DRY.md) - Guidelines for writing maintainable, reusable code
- TypeScript Best Practices - Coming soon
- Error Handling Standards - Coming soon
- Testing Guidelines - Coming soon

## 📚 Documentation

### API Documentation
- [API Overview](./docs/api/v2/README.md)
- [Tenant Management](./docs/api/v2/tenants.md)
- [Project Management](./docs/api/v2/projects.md)
- [Cloud Integration](./docs/api/v2/cloud.md)
- [Invite System](./docs/api/v2/invites.md)
- [Admin Features](./docs/api/v2/admin/project-types.md)

### Core Documentation
- [Core v2 Architecture](./docs/core-v2.md)
- [Permissions & RBAC](./docs/permissions.md)
- [Development Setup](./docs/development/setup.md)
- [Client Development](./docs/development/client.md)

### Architecture
- [Overview](./docs/architecture/overview.md)
- [API Patterns](./docs/architecture/api-patterns.md)
- [Cloud Providers](./docs/architecture/cloud-providers.md)
- [Auth ID Handling](./docs/architecture/auth-id-handling.md)
- [Tenant Management](./docs/architecture/tenant-management.md)

### Standards & Guidelines
- [DRY Principles](./docs/standards/DRY.md)
- [Contributing Guidelines](./docs/contributing/CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

### Legacy Documentation
- [V1 API Reference](./docs/legacy/README.md)

### Deployment
- [Deployment Guide](./docs/deployment.md)

## 🔐 Security

- All API routes are protected with Auth0 JWT validation
- Sensitive data is stored in environment variables
- MongoDB connection uses encrypted credentials
- CORS is configured for security
- Regular dependency updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.