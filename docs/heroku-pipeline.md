# Heroku Pipeline Configuration

## Pipeline: MWAP

### Pipeline Stages

1. **Review Apps**
   - Automatically created from Pull Requests
   - Configuration: Enabled with GitHub Pull Request integration
   - Purpose: Testing and reviewing feature branches
   - Lifecycle: Created on PR open, destroyed on PR close

2. **Review Environment**
   - App Name: mwap-review
   - Purpose: Feature testing and review
   - Branch: SimpleDeploy
   - URL: https://mwap-review.herokuapp.com

3. **Staging Environment**
   - App Name: mwap
   - Purpose: Integration testing and QA
   - Branch: SimpleDeploy
   - URL: https://mwap.herokuapp.com

4. **Production Environment**
   - App Name: mwap-production
   - Purpose: Live production environment
   - Branch: main
   - URL: https://mwap-production.herokuapp.com

### Deployment Flow
```
GitHub PR → Review App → Staging (mwap) → Production (mwap-production)
```

### Environment Configuration

Each environment should have these variables configured:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://...
MONGO_CLIENT_ENCRYPTION_KEY=...
MONGO_ENCRYPTION_KEY_NAME=mwap_data_key

# Environment Settings
NODE_ENV=production (staging/production)
PORT=3100

# Application Settings
LOG_LEVEL=info
STATUS_CHECK_INTERVAL=30000
```

### Promotion Process
1. Review Apps: Automatically created from Pull Requests
2. Staging: Automatic deployment from SimpleDeploy branch
3. Production: Manual promotion from staging

### Monitoring
- Each environment has its own logging
- Application metrics tracked separately
- Status endpoints available for each environment