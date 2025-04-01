#!/bin/bash

# Exit on error
set -e

echo "Setting up review app environment..."

# Generate random strings for encryption keys
ENCRYPTION_KEY=$(openssl rand -base64 64)

# Configure environment variables for the review app
heroku config:set \
  NODE_ENV=production \
  NPM_CONFIG_PRODUCTION=false \
  LOG_LEVEL=debug \
  MONGO_CLIENT_ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  MONGO_ENCRYPTION_KEY_NAME="review_data_key" \
  STATUS_CHECK_INTERVAL=30000

echo "Review app environment setup complete!"