# MWAP (Modular Web Application Platform)

A modern, full-stack web application platform built with scalability and modularity in mind.

## 🌟 Features

- **Full-Stack TypeScript**: End-to-end type safety
- **Modern Frontend**: React 18 with Vite and Mantine UI
- **Robust Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: Simple Auth0 integration
- **Deployment**: Heroku pipeline with staging and production environments
- **Security**: JWT validation and protected routes

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
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-identifier
   VITE_API_URL=http://localhost:3000/api
   ```

   **Backend (.env)**
   ```env
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_AUDIENCE=your-api-identifier
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   MONGO_URI=your-mongodb-uri
   NODE_ENV=development
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
├── client/                 # Frontend application (ES Modules)
│   ├── src/
│   │   ├── auth/          # Auth0 configuration
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── vite.config.ts    # Vite configuration
│
├── server/                # Backend application (CommonJS)
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # Express routes (CommonJS)
│   │   ├── services/     # Business logic
│   │   └── index.js      # Entry point
│   └── package.json
│
└── package.json          # Root package.json

### Module System

The project uses different module systems for frontend and backend:

1. **Frontend (ES Modules)**
   - Uses ES Modules (import/export)
   - TypeScript with type safety
   - Vite handles module bundling
   - Modern JavaScript features

2. **Backend (CommonJS)**
   - Uses CommonJS (require/module.exports)
   - TypeScript for type checking only
   - No module bundling needed
   - Node.js native modules
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

### Protected Routes

All routes require authentication via Auth0 JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

#### User Info
- `GET /api/users/me` - Get current user info

#### Authentication
All authentication is handled through Auth0's endpoints. The application uses:
- Authorization Code flow with PKCE
- Automatic token renewal
- Secure token storage
- JWT validation middleware

## 🚀 Deployment

### Heroku Pipeline

The application uses a Heroku pipeline with review apps, staging, and production environments.

1. **Review Apps**
   - Automatically created for pull requests
   - Isolated testing environment
   - Configured via `app.json`
   - Temporary database instances

2. **Staging Environment**
   ```bash
   # Create staging app
   heroku create mwap-staging

   # Configure environment
   heroku config:set -a mwap-staging \
     NODE_ENV=production \
     AUTH0_DOMAIN=your-domain \
     AUTH0_CLIENT_ID=your-client-id \
     AUTH0_CLIENT_SECRET=your-client-secret \
     AUTH0_AUDIENCE=your-audience \
     MONGO_URI=your-mongodb-uri \
     VITE_API_URL=https://mwap-staging.herokuapp.com/api

   # Deploy to staging
   git push heroku-staging main
   ```

3. **Production Environment**
   ```bash
   # Create production app
   heroku create mwap-production

   # Configure environment
   heroku config:set -a mwap-production \
     NODE_ENV=production \
     AUTH0_DOMAIN=your-domain \
     AUTH0_CLIENT_ID=your-client-id \
     AUTH0_CLIENT_SECRET=your-client-secret \
     AUTH0_AUDIENCE=your-audience \
     MONGO_URI=your-mongodb-uri \
     VITE_API_URL=https://mwap-production.herokuapp.com/api

   # Deploy to production
   git push heroku-production main
   ```

### Review Apps

Review apps are automatically created for pull requests and configured via `app.json` and setup scripts:

1. **Environment**
   - Environment variables defined in app.json
   - Dynamic values set by setup-review.sh
   - Secure environment variables from parent app
   - Auth0 integration

2. **Configuration**
   - `app.json`: Static configuration and required variables
     - Do NOT use generator (only for random secrets)
     - Define required variables without values
     - Set static values where appropriate
   - `setup-review.sh`: Dynamic configuration
     - Sets VITE_API_URL using HEROKU_APP_NAME
     - Configures CORS for review app domain
     - Creates environment files
   - Environment inheritance from parent app

3. **Testing**
   - Isolated environment for each PR
   - Full application stack
   - Real Auth0 integration
   - Database seeding for testing

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