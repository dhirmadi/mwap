# MWAP Deployment Guide

## Environment Configuration

MWAP uses Heroku's environment variables for all configuration. No local `.env` files are needed.

### Required Environment Variables

#### Frontend (Vite)
- `VITE_AUTH0_DOMAIN`: Auth0 domain
- `VITE_AUTH0_CLIENT_ID`: Auth0 client ID
- `VITE_AUTH0_AUDIENCE`: Auth0 API audience
- `VITE_API_URL`: API URL (automatically set for review apps)

#### Backend
- `AUTH0_DOMAIN`: Auth0 domain
- `AUTH0_CLIENT_ID`: Auth0 client ID
- `AUTH0_CLIENT_SECRET`: Auth0 client secret
- `AUTH0_AUDIENCE`: Auth0 API audience
- `MONGO_URI`: MongoDB connection string
- `MONGO_ENCRYPTION_KEY_NAME`: MongoDB encryption key name

### Review Apps

Review apps are automatically configured with the correct environment variables through:
- `app.json` configuration
- Heroku's environment propagation
- Automatic API URL configuration

### Production Deployment

1. Configure environment variables in Heroku dashboard
2. Deploy using Git or GitHub integration
3. Verify build completion
4. Check application logs for any issues

### Build Process

The build process is handled by:
- `Procfile`: Defines the build and start commands
- `package.json`: Contains build scripts
- Heroku buildpack: heroku/nodejs

The build process is fully automated and requires no setup scripts or local configuration:
1. Heroku automatically sets up the environment
2. The heroku-postbuild script builds the client and server
3. The Procfile starts the application

No local environment files, setup scripts, or manual configuration steps are needed.

### Troubleshooting

1. Build Failures
   - Check Heroku logs
   - Verify all environment variables are set
   - Check for any missing dependencies

2. Runtime Issues
   - Check application logs
   - Verify API connectivity
   - Check Auth0 configuration

3. Common Issues
   - Missing environment variables
   - Incorrect Auth0 configuration
   - Database connection issues

### Security Notes

- Never commit sensitive information
- Use Heroku Config Vars for all secrets
- Follow Auth0 security best practices
- Regularly rotate secrets and keys