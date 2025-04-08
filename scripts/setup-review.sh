#!/bin/bash
set -e

# Set up environment variables for the review app
echo "Setting up review app environment..."

# Ensure API URL is set and properly interpolated
if [ -z "$VITE_API_URL" ]; then
  if [ -z "$HEROKU_APP_NAME" ]; then
    echo "Error: Neither VITE_API_URL nor HEROKU_APP_NAME is set"
    exit 1
  fi
  VITE_API_URL="https://${HEROKU_APP_NAME}.herokuapp.com/api"
  echo "Setting VITE_API_URL to: $VITE_API_URL"
fi

# Create client .env file
echo "Creating client .env file..."
cat > client/.env << EOF
VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE
VITE_API_URL=$VITE_API_URL
EOF

# Create server .env file
echo "Creating server .env file..."
cat > server/.env << EOF
PORT=$PORT
LOG_LEVEL=$LOG_LEVEL
STATUS_CHECK_INTERVAL=$STATUS_CHECK_INTERVAL
MONGO_CLIENT_ENCRYPTION_KEY=$MONGO_CLIENT_ENCRYPTION_KEY
NODE_ENV=production
AUTH0_DOMAIN=$AUTH0_DOMAIN
AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET
AUTH0_AUDIENCE=$AUTH0_AUDIENCE
MONGO_URI=$MONGO_URI
MONGO_ENCRYPTION_KEY_NAME=$MONGO_ENCRYPTION_KEY_NAME
CORS_ORIGIN=https://${HEROKU_APP_NAME}.herokuapp.com
EOF

echo "Review app setup complete"
