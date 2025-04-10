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
- **Security**: 
  * CORS configuration
  * Rate limiting
  * Helmet for HTTP headers
  * Request logging

Planned Features:
- **Database**: MongoDB integration with Mongoose (dependencies installed)
- **Deployment**: Heroku pipeline setup
- **API Layer**: RESTful API endpoints with controllers
- **Business Logic**: Service layer implementation

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
│   │   ├── middleware/   # Custom middleware
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

- **Developer Experience**:
  - Custom useAuth hook
  - TypeScript support
  - Error handling
  - Loading states

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

### Planned Endpoints
The following endpoints are planned for implementation:
- User management
- Tenant management
- Resource access control
- System configuration

Note: The API structure is being developed. Check back for updates on available endpoints.

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

1. **Branch Strategy**
   - Feature branches from `main`
   - PRs must be reviewed before merge
   - Staging must be tested before production deploy

2. **Code Style**
   - Use TypeScript where possible
   - Follow ESLint configuration
   - Write unit tests for critical functionality

3. **Commit Messages**
   - Use clear, descriptive commit messages
   - Reference issue numbers when applicable

## 📚 Additional Documentation

- [Project Status](./status_project.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

## 🔐 Security

- All API routes are protected with Auth0 JWT validation
- Sensitive data is stored in environment variables
- MongoDB connection uses encrypted credentials
- CORS is configured for security
- Regular dependency updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.