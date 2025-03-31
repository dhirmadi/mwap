# Container Deployment Guide

## Prerequisites
- Docker installed locally
- Heroku CLI installed
- Access to Heroku Container Registry

## Local Development

1. Build and run containers locally:
```bash
docker-compose up --build
```

2. Access services:
- Frontend: http://localhost:80
- API Gateway: http://localhost:3100
- Status Service: http://localhost:3101

## Production Deployment

1. Login to Heroku Container Registry:
```bash
heroku container:login
```

2. Build production containers:
```bash
docker-compose -f docker-compose.prod.yml build
```

3. Push containers to registry:
```bash
docker push registry.heroku.com/mwap-review/web
docker push registry.heroku.com/mwap-review/api
docker push registry.heroku.com/mwap-review/status
```

4. Release containers:
```bash
heroku container:release web api status -a mwap-review
```

Alternatively, use the deployment script:
```bash
./scripts/deploy-containers.sh
```

## Environment Variables

### Required for All Environments
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
MONGO_CLIENT_ENCRYPTION_KEY=...
MONGO_ENCRYPTION_KEY_NAME=mwap_data_key
```

### Auth0 Configuration
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### Service Configuration
```env
API_PORT=3100
STATUS_PORT=3101
LOG_LEVEL=info
STATUS_CHECK_INTERVAL=60000
```

## Container Structure

### Web Container (PWA)
- Nginx-based
- Serves static files
- Proxies API requests
- Handles CORS and security headers

### API Gateway Container
- Node.js application
- Handles API requests
- Manages authentication
- Connects to MongoDB

### Status Service Container
- Node.js application
- Monitors system health
- Checks MongoDB connection
- Provides metrics

## Health Checks

1. Check container status:
```bash
heroku ps -a mwap-review
```

2. View logs:
```bash
heroku logs --tail -a mwap-review
```

3. Test endpoints:
```bash
# Health check
curl https://mwap-review.herokuapp.com/health

# API status
curl https://mwap-review.herokuapp.com/api/status
```

## Troubleshooting

1. Container issues:
```bash
# Check container logs
heroku logs --tail -a mwap-review

# Restart containers
heroku dyno:restart -a mwap-review
```

2. Build issues:
```bash
# Clean local Docker cache
docker system prune -a

# Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache
```

3. Deployment issues:
```bash
# Check Heroku status
heroku ps -a mwap-review

# Check build logs
heroku builds:info -a mwap-review
```