# MWAP (Modular Web Application Platform)

A modern, full-stack web application platform built with scalability and modularity in mind.

## 🌟 Features

Current Features:
- **Full-Stack TypeScript**: End-to-end type safety with TypeScript configuration
- **Modern Frontend**: 
  * React 18 with Vite build system
  * Mantine UI v7 for components and styling
  * React Router v6 for navigation
- **Backend Foundation**: 
  * Node.js with Express
  * Structured routing system
  * Middleware support
- **Authentication**: 
  * Auth0 integration with PKCE flow
  * Protected routes with JWT validation
  * Multiple OAuth provider support
- **Cloud Storage Integration**:
  * Multiple simultaneous providers
  * Google Drive, Dropbox, Box, OneDrive support
  * Safe provider-aware merge strategy
  * Token management and refresh
- **Security**: 
  * CORS configuration
  * Rate limiting
  * Helmet for HTTP headers
  * Request logging

Planned Features:
- **Deployment**: Heroku pipeline setup
- **API Layer**: RESTful API endpoints with controllers
- **Business Logic**: Service layer implementation

Completed Features:
- **Database**: MongoDB integration with Mongoose
  * Connection management with retry
  * Health monitoring
  * Buffer timeout handling
  * Connection state reporting

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
│   │   ├── __tests__/    # Test files
│   │   │   ├── unit/     # Unit tests
│   │   │   └── utils/    # Test utilities
│   │   ├── config/       # Configuration files
│   │   ├── middleware/   # Modular middleware
│   │   │   ├── auth/     # Authentication middleware
│   │   │   ├── errors/   # Error handling middleware
│   │   │   ├── scoping/  # Tenant/Project scoping
│   │   │   ├── security/ # Security middleware
│   │   │   └── validation/ # Request validation
│   │   ├── routes/       # Express routes
│   │   └── index.js      # Entry point
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
- `POST /api/v1/tenant` - Create new tenant
- `GET /api/v1/tenant/me` - Get current tenant
- `PATCH /api/v1/tenant/:id` - Update tenant
- `DELETE /api/v1/tenant/:id` - Archive tenant

#### Cloud Storage Integration
- `GET /api/v1/tenant/:id/integrations` - List cloud storage integrations
- `POST /api/v1/tenant/:id/integrations` - Add cloud storage integration
- `DELETE /api/v1/tenant/:id/integrations/:provider` - Remove integration
- `GET /api/v1/auth/:provider` - Start OAuth flow
- `GET /api/v1/auth/:provider/callback` - Handle OAuth callback

#### Project Management
- `GET /api/v1/projects/:id` - Get project details
- `PATCH /api/v1/projects/:id` - Update project (archive)
- `DELETE /api/v1/projects/:id` - Delete project
- Project admin view at `/projects/:id/manage` (requires ADMIN role)

#### Authentication
- Auth0 token validation
- Role-based access control
- OAuth provider support

See [API Documentation](./docs/API.md) for detailed endpoint specifications.

### Planned Endpoints
The following endpoints are in development:
- Project management
- User management
- Invite system
- Admin features

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
- [API Overview](./docs/api/API.md)
- [Tenant Endpoints](./docs/api/v1/tenants.md)
- [Project Endpoints](./docs/api/v1/projects.md)
- [Auth Endpoints](./docs/api/v1/auth.md)

### Development
- [Project Status](./docs/STATUS.md)
- [Development Setup](./docs/development/setup.md)
- [Client Development](./docs/development/client.md)

### Architecture
- [Overview](./docs/architecture/overview.md)
- [API Patterns](./docs/architecture/api-patterns.md)
- [Middleware Architecture](./docs/architecture/middleware.md)
- [Auth ID Handling](./docs/architecture/auth-id-handling.md)

### Standards & Guidelines
- [DRY Principles](./docs/standards/DRY.md)
- [Contributing Guidelines](./docs/contributing/CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

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