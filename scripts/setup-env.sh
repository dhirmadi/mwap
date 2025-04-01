#!/bin/bash

# Exit on error
set -e

echo "Setting up environment variables..."

# Set VITE_API_URL for review apps
if [ "$HEROKU_APP_NAME" != "" ]; then
    export VITE_API_URL="https://$HEROKU_APP_NAME.herokuapp.com/api"
    echo "Set VITE_API_URL for app: $HEROKU_APP_NAME"
fi

echo "Environment setup completed"
