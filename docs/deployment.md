# Simple Heroku Deployment Guide

This guide explains how to set up automatic deployments from GitHub to Heroku. Once configured, every push to the SimpleDeploy branch will automatically deploy to Heroku.

## One-Time Setup

1. **Create Heroku App**:
   - Go to [Heroku Dashboard](https://dashboard.heroku.com)
   - Click "New" → "Create new app"
   - Choose an app name
   - Click "Create app"

2. **Connect to GitHub**:
   - In your Heroku app, go to the "Deploy" tab
   - Select "GitHub" as deployment method
   - Search for your repository and connect
   - Select the "SimpleDeploy" branch
   - Enable "Automatic Deploys"

3. **Set Environment Variables**:
   - In your Heroku app, go to "Settings" tab
   - Click "Reveal Config Vars"
   - Add these variables:
     ```
     MONGO_URI=your_mongodb_atlas_connection_string
     MONGO_CLIENT_ENCRYPTION_KEY=your_encryption_key
     NODE_ENV=production
     ```

That's it! Now every time you push to the SimpleDeploy branch, Heroku will automatically deploy your changes.

## Testing the Deployment

1. Visit your app URL: `https://your-app-name.herokuapp.com`
2. Check the MongoDB status page: `https://your-app-name.herokuapp.com/api/status`

## Viewing Logs

- In Heroku Dashboard, click "More" → "View logs"
- Or use Heroku CLI: `heroku logs --tail`

## Troubleshooting

If deployment fails:
1. Check Heroku logs for errors
2. Verify MongoDB connection string
3. Make sure all environment variables are set
4. Try manual deploy through Heroku Dashboard