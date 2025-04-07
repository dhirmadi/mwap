# MWAP Server

Express.js server with MongoDB and Auth0 integration.

## Features

- **Express.js**: Modern Node.js web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Auth0**: JWT validation and user management
- **TypeScript**: Type safety and better DX
- **Winston**: Advanced logging
- **Compression**: Response compression
- **CORS**: Secure cross-origin requests
- **Helmet**: Security headers

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Development environment
   cp .env.example .env
   
   # Test environment (if running tests)
   cp .env.test.example .env.test

   # Fill in the values:
   PORT=54014
   NODE_ENV=development
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_AUDIENCE=your-api-identifier
   MONGO_URI=your-mongodb-uri
   MONGO_ENCRYPTION_KEY_NAME=mwap_data_key
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

All endpoints require a valid Auth0 JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### User Management

- `GET /api/users/me`
  - Get current user profile
  - Returns: User object

- `POST /api/users/me`
  - Create user profile
  - Body: `{ auth0Id, email, name }`
  - Returns: Created user object

- `PATCH /api/users/me`
  - Update user profile
  - Body: Profile update data
  - Returns: Updated user object

- `GET /api/users/me/preferences`
  - Get user preferences
  - Returns: Preferences object

- `PATCH /api/users/me/preferences`
  - Update user preferences
  - Body: Preferences update data
  - Returns: Updated preferences

## Security

1. **Auth0 Integration**
   - JWT validation middleware
   - Role-based access control
   - Token scope validation

2. **Data Security**
   - MongoDB encryption at rest
   - Secure connection strings
   - Environment variable protection

3. **API Security**
   - CORS configuration
   - Helmet security headers
   - Rate limiting
   - Request validation

## Deployment

### Heroku

1. **Environment Variables**
   ```bash
   heroku config:set \
     NODE_ENV=production \
     AUTH0_DOMAIN=your-domain \
     AUTH0_CLIENT_ID=your-client-id \
     AUTH0_CLIENT_SECRET=your-client-secret \
     AUTH0_AUDIENCE=your-audience \
     MONGO_URI=your-mongodb-uri \
     MONGO_ENCRYPTION_KEY_NAME=prod_data_key
   ```

2. **Review Apps**
   - Automatic deployment
   - Environment configuration
   - Database provisioning
   - Security validation