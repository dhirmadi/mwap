# Heroku Deployment Guide

## Prerequisites
- [Heroku Account](https://signup.heroku.com/) - Free account required
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) - For local deployment testing
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register) - For database hosting
- GitHub repository access with admin privileges

## Step 1: MongoDB Atlas Setup

1. Log in to MongoDB Atlas
2. Create or select a cluster
3. Create a database user:
   - Go to Security → Database Access
   - Click "Add New Database User"
   - Username: Choose a username
   - Password: Generate a secure password
   - Built-in Role: "Read and write to any database"

4. Configure network access:
   - Go to Security → Network Access
   - Click "Add IP Address"
   - Add `0.0.0.0/0` for initial testing (restrict later)

5. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `<dbname>` with `mwap_db`

## Step 2: Heroku Setup

1. Create Heroku account:
   ```bash
   # Visit https://signup.heroku.com/ and complete registration
   ```

2. Install Heroku CLI:
   ```bash
   # On Ubuntu/Debian
   curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

   # On macOS
   brew tap heroku/brew && brew install heroku

   # On Windows
   # Download installer from: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. Login to Heroku:
   ```bash
   heroku login
   ```

4. Create new Heroku app:
   ```bash
   heroku create mwap-your-app-name
   # Note: Replace 'your-app-name' with a unique name
   ```

5. Get your Heroku API key:
   ```bash
   # Visit https://dashboard.heroku.com/account
   # Scroll to "API Key" section
   # Click "Reveal" and copy the key
   ```

## Step 3: GitHub Repository Setup

1. Configure GitHub Secrets:
   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Add the following secrets:
     ```
     HEROKU_API_KEY: [Your Heroku API key]
     HEROKU_APP_NAME: [Your Heroku app name]
     HEROKU_EMAIL: [Your Heroku account email]
     ```

## Step 4: Environment Variables Setup

1. Generate encryption key:
   ```bash
   node scripts/generate-keys.js
   # Copy the generated MONGO_CLIENT_ENCRYPTION_KEY
   ```

2. Set Heroku environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI="your_mongodb_atlas_uri"
   heroku config:set MONGO_CLIENT_ENCRYPTION_KEY="your_generated_key"
   heroku config:set MONGO_ENCRYPTION_KEY_NAME="mwap_data_key"
   heroku config:set LOG_LEVEL=info
   ```

## Step 5: Initial Deployment

1. Push to Heroku:
   ```bash
   git push heroku SimpleDeploy:main
   ```

2. Verify deployment:
   ```bash
   heroku open
   ```

3. Check logs:
   ```bash
   heroku logs --tail
   ```

## Step 6: Continuous Deployment Setup

1. Enable GitHub Integration:
   - Go to your app in Heroku Dashboard
   - Deploy tab → Deployment method
   - Choose GitHub
   - Connect to your repository
   - Enable automatic deploys from 'main' branch

2. Configure deployment settings:
   - Enable "Wait for CI to pass before deploy"
   - Enable "Automatic deploys"

## Monitoring and Maintenance

1. View application logs:
   ```bash
   heroku logs --tail
   ```

2. Check application status:
   ```bash
   heroku ps
   ```

3. Monitor MongoDB:
   - Visit MongoDB Atlas dashboard
   - Monitor → Performance Advisor
   - Monitor → Real-Time Performance Panel

## Troubleshooting

1. Connection Issues:
   ```bash
   # Check Heroku status
   heroku status

   # Verify environment variables
   heroku config

   # Restart application
   heroku restart
   ```

2. MongoDB Issues:
   - Check Network Access in MongoDB Atlas
   - Verify connection string
   - Check database user permissions

3. Deployment Issues:
   ```bash
   # View build logs
   heroku builds:output

   # Check release history
   heroku releases

   # Rollback if needed
   heroku rollback
   ```

## Security Best Practices

1. Update Network Access:
   - Remove `0.0.0.0/0` from MongoDB Atlas
   - Add specific Heroku IP ranges

2. Regular Maintenance:
   - Update dependencies regularly
   - Monitor GitHub security alerts
   - Rotate MongoDB credentials periodically
   - Update encryption keys periodically

3. Monitoring:
   - Set up Heroku alerts
   - Configure MongoDB Atlas alerts
   - Monitor application metrics

## Additional Resources

- [Heroku Node.js Documentation](https://devcenter.heroku.com/categories/nodejs-support)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
