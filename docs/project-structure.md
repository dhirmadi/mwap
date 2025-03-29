# MWAP Project Structure

## Service Architecture

### Managed Services
- **Database**: MongoDB Atlas (mongodb.com)
  - Managed database service
  - Built-in monitoring
  - Automatic backups
  - Connection pooling

- **Authentication**: Auth0 (auth0.com)
  - User authentication
  - OAuth integration
  - JWT handling
  - User management

### Custom Services

#### 1. API Gateway Service
- Entry point for all client requests
- Route management
- Request validation
- Rate limiting
- CORS handling
- Auth0 integration
- Request logging

#### 2. Status Service
- System health monitoring
- Service status aggregation
- MongoDB connection monitoring
- Auth0 connection status
- Performance metrics

### Project Structure
```
mwap/
├── services/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── config/
│   │       │   ├── auth0.js        # Auth0 configuration
│   │       │   └── routes.js       # Route definitions
│   │       ├── middleware/
│   │       │   ├── auth.js         # Auth0 middleware
│   │       │   ├── validation.js   # Request validation
│   │       │   └── rateLimit.js    # Rate limiting
│   │       └── routes/
│   │           ├── api.js          # API routes
│   │           └── status.js       # Status endpoints
│   │
│   └── status-service/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── config/
│           │   └── monitoring.js    # Monitoring configuration
│           ├── collectors/
│           │   ├── mongodb.js      # MongoDB status
│           │   └── auth0.js        # Auth0 status
│           └── routes/
│               └── status.js       # Status endpoints
│
├── shared/
│   ├── utils/
│   │   ├── logger.js              # Centralized logging
│   │   └── metrics.js             # Metrics collection
│   ├── models/
│   │   └── status.js             # Status data models
│   └── config/
│       └── common.js             # Shared configuration
│
├── docker-compose.yml            # Local development
├── docker-compose.prod.yml       # Production setup
└── heroku.yml                    # Heroku container config
```

## Configuration Management

### Environment Variables
```env
# API Gateway Service
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Status Service
MONGO_URI=mongodb+srv://...
MONGO_DB_NAME=mwap
STATUS_CHECK_INTERVAL=30000

# Common
NODE_ENV=production
LOG_LEVEL=info
```

## Service Communication

### Internal Communication
- REST APIs between services
- Health check endpoints
- Metric collection

### External Communication
- API Gateway as single entry point
- JWT validation
- Rate limiting
- CORS handling

## Deployment Strategy

### Local Development
```bash
docker-compose up -d
```

### Production (Heroku)
```bash
heroku container:push web
heroku container:release web
```

## Monitoring Strategy

### Service Health
- Regular health checks
- Connection status monitoring
- Performance metrics collection

### Logging
- Structured JSON logging
- Log levels by environment
- Centralized log collection

### Metrics
- Response times
- Error rates
- Resource utilization
- Request counts