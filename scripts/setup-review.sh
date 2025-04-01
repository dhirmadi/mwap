#!/bin/bash
set -e

# Set up environment variables for the review app
echo "Setting up review app environment..."

# Ensure API URL is set
if [ -z "$VITE_API_URL" ]; then
  echo "Error: VITE_API_URL is not set"
  exit 1
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
PORT=\${PORT}
NODE_ENV=production
AUTH0_DOMAIN=$AUTH0_DOMAIN
AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET
AUTH0_AUDIENCE=$AUTH0_AUDIENCE
MONGO_URI=$MONGO_URI
MONGO_ENCRYPTION_KEY_NAME=$MONGO_ENCRYPTION_KEY_NAME
CORS_ORIGIN=*
EOF

echo "Review app setup complete"
