# MWAP (Modular Web Application Platform)

A modern, full-stack web application platform built with scalability and modularity in mind, featuring multi-tenant user management and role-based access control.

## 🌟 Features

- **Multi-Tenant Architecture**: Isolated tenant environments with role-based access
- **Full-Stack TypeScript**: End-to-end type safety with React and Node.js
- **Modern Frontend**: React 18 with Vite, Mantine UI, and Tabler Icons
- **Robust Backend**: Node.js with Express and MongoDB
- **Authentication**: Auth0 integration with JWT validation
- **Deployment**: Heroku pipeline with staging, production, and review apps
- **Security**: Role-based access control, tenant isolation, and secure configurations

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
   MONGO_CLIENT_ENCRYPTION_KEY=your-encryption-key
   MONGO_ENCRYPTION_KEY_NAME=your-key-name
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
├── client/                 # Frontend application
│   ├── src/
│   │   ├── auth/          # Auth0 configuration
│   │   ├── components/    # React components
│   │   │   └── tenants/   # Tenant management components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── vite.config.ts     # Vite configuration
│
├── server/                # Backend application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   │   ├── auth.js   # Auth0 middleware
│   │   │   └── tenantAccess.js # Tenant access control
│   │   ├── models/       # Mongoose models
│   │   │   ├── User.js   # User model with tenant support
│   │   │   └── Tenant.js # Tenant model
│   │   ├── routes/       # Express routes
│   │   ├── services/     # Business logic
│   │   └── index.js      # Entry point
│   └── package.json
│
├── app.json              # Heroku review apps configuration
└── package.json          # Root package.json
```

## 🔒 Authentication and Authorization

This project uses Auth0 for authentication and implements custom role-based access control:

1. **Auth0 Configuration**
   Configure the following URLs in Auth0 dashboard:
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

2. **Role-Based Access Control**
   - Super Admin: Global access to all tenants
   - Tenant Admin: Full control within their tenant
   - Editor: Can manage content within their tenant
   - User: Basic access within their tenant

3. **Tenant Isolation**
   - Each tenant has its own isolated environment
   - Users can belong to multiple tenants with different roles
   - Resources are scoped to tenants

## 🌐 API Endpoints

### Protected Routes

All routes require authentication via Auth0 JWT token.

#### Tenant Management
- `GET /api/tenants` - List all tenants (super admin only)
- `POST /api/tenants` - Create new tenant (super admin only)
- `GET /api/tenants/:id` - Get tenant details
- `PATCH /api/tenants/:id` - Update tenant (admin only)

#### Member Management
- `GET /api/tenants/:id/members` - List tenant members
- `POST /api/tenants/:id/members` - Add member to tenant (admin only)
- `PATCH /api/tenants/:id/members/:userId` - Update member role (admin only)
- `DELETE /api/tenants/:id/members/:userId` - Remove member (admin only)

#### Join Requests
- `POST /api/tenants/:id/join` - Request to join tenant
- `POST /api/tenants/:id/requests/:userId` - Handle join request (admin only)

## 🚀 Deployment

### Heroku Setup

1. **Create Heroku apps**
   ```bash
   heroku create mwap-staging
   heroku create mwap-production
   ```

2. **Configure environment variables**
   ```bash
   # For staging
   heroku config:set -a mwap-staging \
     NODE_ENV=production \
     AUTH0_DOMAIN=your-domain \
     AUTH0_CLIENT_ID=your-client-id \
     AUTH0_CLIENT_SECRET=your-client-secret \
     AUTH0_AUDIENCE=your-audience \
     MONGO_URI=your-mongodb-uri \
     MONGO_CLIENT_ENCRYPTION_KEY=your-key \
     MONGO_ENCRYPTION_KEY_NAME=your-key-name

   # For production (repeat with production values)
   ```

3. **Deploy**
   ```bash
   # Deploy to staging
   git push heroku-staging main

   # Deploy to production
   git push heroku-production main
   ```

### Review Apps

Review apps are automatically created for pull requests:

1. Environment variables are configured in `app.json`
2. Each PR gets its own isolated environment
3. Auth0 wildcard URLs allow authentication
4. Database is shared but tenant-isolated

## 🔧 Development Guidelines

1. **Branch Strategy**
   - Feature branches from `main`
   - PRs must be reviewed before merge
   - Staging must be tested before production deploy
   - Review apps for testing PR changes

2. **Code Style**
   - Use TypeScript where possible
   - Follow ESLint configuration
   - Write unit tests for critical functionality
   - Use Mantine UI components

3. **Commit Messages**
   - Use clear, descriptive commit messages
   - Reference issue numbers when applicable

4. **Testing**
   - Test tenant isolation thoroughly
   - Verify role-based access control
   - Test member management workflows
   - Ensure proper error handling

## 📚 Additional Documentation

- [Project Status](./status_project.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

## 🔐 Security

- Auth0 integration with JWT validation
- Role-based access control at API and UI levels
- Tenant isolation enforced
- MongoDB encryption for sensitive data
- Environment variables secured
- CORS configured for security
- Regular dependency updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
