# MWAP (Modular Web Application Platform)

A modern, full-stack web application platform built with scalability and modularity in mind.

## 🌟 Features

- **Full-Stack TypeScript**: End-to-end type safety
- **Modern Frontend**: React 18 with Vite and Mantine UI
- **Robust Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: Auth0 integration
- **Deployment**: Heroku pipeline with staging and production environments
- **Security**: JWT validation, protected routes, and secure configurations

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
├── client/                 # Frontend application
│   ├── src/
│   │   ├── auth/          # Auth0 configuration
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── vite.config.ts    # Vite configuration
│
├── server/                # Backend application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # Express routes
│   │   ├── services/     # Business logic
│   │   └── index.js      # Entry point
│   └── package.json
│
└── package.json          # Root package.json
```

## 🔒 Authentication

This project uses Auth0 for authentication. Required setup:

1. Create an Auth0 account and application
2. Configure the following URLs in Auth0 dashboard:
   ```
   Allowed Callback URLs:
   - https://mwap-staging-a88e5b681617.herokuapp.com
   - https://mwap-production-d5a4ed63debf.herokuapp.com
   - http://localhost:5173

   Allowed Logout URLs:
   - https://mwap-staging-a88e5b681617.herokuapp.com
   - https://mwap-production-d5a4ed63debf.herokuapp.com
   - http://localhost:5173

   Allowed Web Origins:
   - https://mwap-staging-a88e5b681617.herokuapp.com
   - https://mwap-production-d5a4ed63debf.herokuapp.com
   - http://localhost:5173
   ```

## 🌐 API Endpoints

### Protected Routes

All routes require authentication via Auth0 JWT token.

#### User Management
- `GET /api/users/me` - Get current user profile
- `POST /api/users/me` - Update current user profile

#### Task Management
- `GET /api/tasks` - Get all tasks for the authenticated user
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

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
     MONGO_URI=your-mongodb-uri

   # For production (repeat with production values)
   ```

3. **Deploy**
   ```bash
   # Deploy to staging
   git push heroku-staging main

   # Deploy to production
   git push heroku-production main
   ```

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
