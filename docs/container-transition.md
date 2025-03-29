# Container-Based Microservices Transition Plan

## Current Architecture
- Single Node.js application
- MongoDB Atlas integration
- Basic CRUD operations
- Status monitoring

## Target Architecture

### 1. Service Breakdown
```
mwap/
├── services/
│   ├── data-service/        # MongoDB CRUD operations
│   ├── auth-service/        # Authentication & Authorization
│   ├── status-service/      # System status & monitoring
│   └── gateway-service/     # API Gateway
└── shared/                  # Shared utilities and configurations
```

### 2. Service Descriptions

#### Data Service
- MongoDB operations
- Data encryption
- CRUD endpoints
- Data validation

#### Auth Service
- User authentication
- JWT management
- Permission control
- User management

#### Status Service
- System health monitoring
- MongoDB connection status
- Service discovery
- Health checks

#### Gateway Service
- Route management
- Request forwarding
- Rate limiting
- CORS handling

### 3. Container Structure

Each service will have:
```
services/<service-name>/
├── Dockerfile
├── package.json
├── src/
│   ├── config/
│   ├── routes/
│   ├── models/
│   └── app.js
├── tests/
└── docker-compose.yml
```

### 4. Shared Resources
```
shared/
├── utils/
│   ├── logging.js
│   └── encryption.js
├── models/
│   └── common-types.js
└── config/
    └── database.js
```

## Implementation Steps

### Phase 1: Project Restructuring
1. Create new directory structure
2. Move existing code to data-service
3. Set up shared resources
4. Create base Dockerfile template

### Phase 2: Service Separation
1. Extract authentication logic
2. Extract status monitoring
3. Create API gateway
4. Update service communication

### Phase 3: Container Setup
1. Create service-specific Dockerfiles
2. Set up Docker Compose
3. Configure networking
4. Set up environment variables

### Phase 4: Deployment Updates
1. Update Heroku deployment
2. Configure container orchestration
3. Set up service discovery
4. Update monitoring

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  gateway:
    build: ./services/gateway-service
    ports:
      - "3100:3100"
    environment:
      - NODE_ENV=production
    depends_on:
      - data-service
      - auth-service
      - status-service

  data-service:
    build: ./services/data-service
    environment:
      - MONGO_URI=${MONGO_URI}
      - MONGO_CLIENT_ENCRYPTION_KEY=${MONGO_CLIENT_ENCRYPTION_KEY}

  auth-service:
    build: ./services/auth-service
    environment:
      - JWT_SECRET=${JWT_SECRET}

  status-service:
    build: ./services/status-service
    environment:
      - MONGO_URI=${MONGO_URI}
```

## Service Communication

### Internal Communication
- Service discovery using container names
- Internal network for service communication
- Health check endpoints

### External Communication
- API Gateway as single entry point
- JWT-based authentication
- Rate limiting at gateway level

## Development Workflow

1. Local Development:
   ```bash
   docker-compose up -d
   docker-compose logs -f [service-name]
   ```

2. Testing:
   ```bash
   docker-compose -f docker-compose.test.yml up
   ```

3. Production Deployment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Migration Strategy

### Step 1: Create Base Structure
```bash
mkdir -p services/{data,auth,status,gateway}-service
mkdir -p shared/{utils,models,config}
```

### Step 2: Move Existing Code
```bash
mv src services/data-service/
cp -r src/config/database.js shared/config/
```

### Step 3: Create Service Templates
```bash
for service in data auth status gateway; do
  cp Dockerfile services/${service}-service/
  cp package.json services/${service}-service/
done
```

### Step 4: Update Dependencies
- Remove unused dependencies from each service
- Add service-specific dependencies
- Update shared dependencies

## Testing Strategy

1. Unit Tests:
   - Service-specific tests
   - Shared utility tests
   - Mock external services

2. Integration Tests:
   - Service communication tests
   - Database integration tests
   - API gateway tests

3. End-to-End Tests:
   - Complete flow tests
   - Container orchestration tests
   - Performance tests

## Monitoring and Logging

1. Centralized Logging:
   - Winston for service logging
   - Log aggregation service
   - Structured log format

2. Health Monitoring:
   - Service-level health checks
   - Container health monitoring
   - Resource usage tracking

3. Metrics Collection:
   - Response times
   - Error rates
   - Resource utilization

## Security Considerations

1. Container Security:
   - Minimal base images
   - Non-root users
   - Resource limits

2. Network Security:
   - Internal network isolation
   - TLS for external communication
   - Rate limiting

3. Data Security:
   - Environment variable management
   - Secrets management
   - Encryption at rest and in transit