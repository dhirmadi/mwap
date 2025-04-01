#!/bin/bash

# Exit on error
set -e

echo "Setting up review app environment..."

# Generate random strings for encryption keys
ENCRYPTION_KEY=$(openssl rand -base64 64)

# Set only the encryption key
heroku config:set MONGO_CLIENT_ENCRYPTION_KEY="$ENCRYPTION_KEY" --app "$HEROKU_APP_NAME"

echo "Review app environment setup complete!"