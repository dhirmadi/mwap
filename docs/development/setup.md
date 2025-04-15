# Development Setup Guide

## Prerequisites

### Required Software
- Node.js (v20.x)
- npm (v10.x)
- Git
- MongoDB Atlas account
- Auth0 account
- Heroku CLI (for deployment)

### Recommended Tools
- Visual Studio Code
- MongoDB Compass
- Postman or Insomnia
- Git client

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/dhirmadi/mwap.git
cd mwap
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install
```

### 3. Service Configuration

#### Auth0 Setup
1. Create a new Auth0 application
2. Set application type to "Single Page Application"
3. Configure allowed URLs:
   ```
   Allowed Callback URLs:
   - http://localhost:5173
   - https://*.herokuapp.com

   Allowed Logout URLs:
   - http://localhost:5173
   - https://*.herokuapp.com

   Allowed Web Origins:
   - http://localhost:5173
   - https://*.herokuapp.com
   ```

#### MongoDB Setup
1. Create MongoDB Atlas cluster
2. Create database user
3. Get connection string
4. Set up network access

### 4. Environment Configuration

All environment variables are managed in Heroku. For local development, you can use the Heroku CLI to pull environment variables:

```bash
# Login to Heroku
heroku login

# Pull environment variables from staging
heroku config:get -a mwap-staging AUTH0_DOMAIN
heroku config:get -a mwap-staging AUTH0_CLIENT_ID
# ... etc
```

Required environment variables:
```env
# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=your-auth0-api-identifier

# MongoDB Configuration
MONGO_URI=your-mongodb-uri
MONGO_CLIENT_ENCRYPTION_KEY=your-encryption-key
MONGO_ENCRYPTION_KEY_NAME=your-key-name

# API Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Security Configuration
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development Workflow

### 1. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Frontend only
cd client && npm run dev

# Backend only
cd server && npm run dev
```

### 2. Available Scripts

Frontend:
```bash
npm run dev          # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run format      # Run Prettier
```

Backend:
```bash
npm run dev          # Start development server
npm run build       # Build TypeScript
npm run build:prod  # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
```

### 3. Development Guidelines

#### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful comments
- Use proper type annotations

#### Git Workflow
1. Create feature branch
2. Make changes
3. Run linting and formatting
4. Commit changes
5. Push to remote
6. Create pull request

#### Commit Messages
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
```
feat(auth): Add role-based access control

- Implement role hierarchy
- Add permission checks
- Update documentation

Closes #123
```

## Deployment

### 1. Heroku Setup
```bash
# Login to Heroku
heroku login

# Add Heroku remotes
heroku git:remote -a mwap-staging -r heroku-staging
heroku git:remote -a mwap-production -r heroku-production
```

### 2. Deploy to Staging
```bash
git push heroku-staging main
```

### 3. Deploy to Production
```bash
git push heroku-production main
```

### 4. View Logs
```bash
# Staging logs
heroku logs -a mwap-staging --tail

# Production logs
heroku logs -a mwap-production --tail
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version
   - Clear npm cache
   - Delete node_modules
   - Reinstall dependencies

2. **Auth0 Issues**
   - Verify environment variables
   - Check allowed URLs
   - Validate token configuration
   - Check CORS settings

3. **MongoDB Issues**
   - Verify connection string
   - Check network access
   - Validate credentials
   - Check indexes

4. **TypeScript Errors**
   - Update type definitions
   - Check tsconfig.json
   - Verify import paths
   - Update dependencies

### Getting Help
1. Check existing documentation
2. Search issue tracker
3. Review pull requests
4. Contact team members