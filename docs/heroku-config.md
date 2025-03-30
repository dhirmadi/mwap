# Heroku Configuration Guide

## Review Apps Configuration

### Required Environment Variables
These need to be set in the "Review Apps" environment variables section:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://[username]:[password]@[cluster]/mwap_review_${HEROKU_PR_NUMBER}
MONGO_CLIENT_ENCRYPTION_KEY=[generated-encryption-key]
MONGO_ENCRYPTION_KEY_NAME=mwap_data_key_review_${HEROKU_PR_NUMBER}

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_CLIENT_ID=[review-app-client-id]
AUTH0_CLIENT_SECRET=[review-app-client-secret]

# Application Settings
NODE_ENV=staging
LOG_LEVEL=debug
STATUS_CHECK_INTERVAL=30000
```

### app.json Configuration
Add to root directory to configure Review Apps:

```json
{
  "name": "MWAP Review",
  "description": "Review app for MWAP",
  "environments": {
    "review": {
      "addons": [],
      "scripts": {
        "postdeploy": "npm run db:setup"
      },
      "formation": {
        "web": {
          "quantity": 1,
          "size": "eco"
        }
      }
    }
  }
}
```

## Pipeline Configuration

### Review Apps Settings
- [x] Enable Review Apps
- [x] Create new review apps for new pull requests automatically
- [x] Create review apps for existing pull requests
- [x] Destroy stale review apps automatically
- [x] Pipeline test runs enabled

### Staging App (mwap)
Required Config Vars:
```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://[username]:[password]@[cluster]/mwap_staging
MONGO_CLIENT_ENCRYPTION_KEY=[staging-encryption-key]
MONGO_ENCRYPTION_KEY_NAME=mwap_data_key_staging

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_CLIENT_ID=[staging-client-id]
AUTH0_CLIENT_SECRET=[staging-client-secret]

# Application Settings
NODE_ENV=staging
LOG_LEVEL=info
STATUS_CHECK_INTERVAL=30000
```

### Production App (mwap-production)
Required Config Vars:
```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://[username]:[password]@[cluster]/mwap_production
MONGO_CLIENT_ENCRYPTION_KEY=[production-encryption-key]
MONGO_ENCRYPTION_KEY_NAME=mwap_data_key_production

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_CLIENT_ID=[production-client-id]
AUTH0_CLIENT_SECRET=[production-client-secret]

# Application Settings
NODE_ENV=production
LOG_LEVEL=info
STATUS_CHECK_INTERVAL=60000
```

## Auth0 Configuration Requirements

### Per Environment Setup
1. **Review Apps**:
   - Create dynamic client ID/secret
   - Use environment variables for configuration
   - Limit token lifetimes
   - Enable CORS for review app domains

2. **Staging**:
   - Dedicated Auth0 application
   - Staging-specific permissions
   - Test user accounts
   - Monitoring enabled

3. **Production**:
   - Production Auth0 application
   - Strict security settings
   - Production logging
   - Rate limiting enabled

## MongoDB Atlas Configuration

### Database Strategy
1. **Review Apps**:
   - Dynamic database creation
   - Temporary collections
   - Basic indexes only
   - Development-level monitoring

2. **Staging**:
   - Dedicated database
   - Full indexing
   - Monitoring enabled
   - Daily backups

3. **Production**:
   - Production database
   - Optimized indexes
   - Full monitoring
   - Continuous backup

## Security Considerations

### Review Apps
- Temporary credentials
- Limited permissions
- Debug logging enabled
- Basic rate limiting

### Staging
- Staging-specific credentials
- Moderate permissions
- Enhanced logging
- Standard rate limiting

### Production
- Production credentials
- Strict permissions
- Production logging
- Strict rate limiting

## Monitoring Setup

### Per Environment Monitoring
1. **Review Apps**:
   - Basic metrics
   - Debug logs
   - Error tracking
   - Performance monitoring

2. **Staging**:
   - Full metrics
   - Enhanced logging
   - Error alerts
   - Load testing metrics

3. **Production**:
   - Complete metrics
   - Production logging
   - Critical alerts
   - Performance alerts

## Deployment Checklist

### Before Enabling Review Apps
1. [ ] Configure environment variables in pipeline
2. [ ] Set up Auth0 dynamic client creation
3. [ ] Configure MongoDB Atlas access
4. [ ] Enable automatic SSL
5. [ ] Configure logging
6. [ ] Set up monitoring

### Before Production Deployment
1. [ ] Verify all environment variables
2. [ ] Test Auth0 production settings
3. [ ] Verify MongoDB Atlas production setup
4. [ ] Enable production logging
5. [ ] Configure alerts
6. [ ] Set up backup strategy