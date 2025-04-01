#!/bin/bash

# Function to write environment variables to a file that can be sourced later
setup_env_vars() {
    # Create the env file
    ENV_FILE="$1"
    echo "Creating environment file at: $ENV_FILE"
    
    # Set API URL based on the app name
    if [ "$HEROKU_APP_NAME" != "" ]; then
        echo "export VITE_API_URL=https://$HEROKU_APP_NAME.herokuapp.com/api" >> "$ENV_FILE"
        echo "Setting VITE_API_URL for app: $HEROKU_APP_NAME"
    else
        echo "export VITE_API_URL=http://localhost:3000/api" >> "$ENV_FILE"
        echo "Setting VITE_API_URL for local development"
    fi
}

# Set up environment for the client build
CLIENT_ENV_DIR="client/.env.production.local"
setup_env_vars "$CLIENT_ENV_DIR"

# Make the script executable
chmod +x "$CLIENT_ENV_DIR"

echo "Environment setup completed"
echo "Contents of $CLIENT_ENV_DIR:"
cat "$CLIENT_ENV_DIR"
