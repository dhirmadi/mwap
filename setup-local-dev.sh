#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up local development environment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "npm install -g heroku"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run:"
    echo "heroku login"
    exit 1
fi

echo "📥 Fetching environment variables from Heroku staging..."

# Create .env files if they don't exist
touch ./server/.env
touch ./client/.env

# Set up server configuration
echo "🔄 Setting up server configuration..."

# Create fresh .env file with development settings
echo "Configuring local development variables..."
{
    echo "PORT=3001"
    echo "NODE_ENV=development"
    echo "API_BASE_URL=http://localhost:3001"
    echo "CORS_ORIGIN=http://localhost:5173"
    echo "LOG_LEVEL=debug"
    echo "DEBUG=*"
    
    # Fetch all required variables from Heroku staging
    echo "Fetching environment variables from Heroku..."
    echo "MONGO_URI=$(heroku config:get MONGO_URI -a mwap-staging)"
    echo "AUTH0_DOMAIN=$(heroku config:get AUTH0_DOMAIN -a mwap-staging)"
    echo "AUTH0_CLIENT_ID=$(heroku config:get AUTH0_CLIENT_ID -a mwap-staging)"
    echo "AUTH0_CLIENT_SECRET=$(heroku config:get AUTH0_CLIENT_SECRET -a mwap-staging)"
    echo "AUTH0_AUDIENCE=$(heroku config:get AUTH0_AUDIENCE -a mwap-staging)"
    echo "DROPBOX_CLIENT_ID=$(heroku config:get DROPBOX_CLIENT_ID -a mwap-staging)"
    echo "DROPBOX_CLIENT_SECRET=$(heroku config:get DROPBOX_CLIENT_SECRET -a mwap-staging)"
    echo "GOOGLE_CLIENT_ID=$(heroku config:get GOOGLE_CLIENT_ID -a mwap-staging)"
    echo "GOOGLE_CLIENT_SECRET=$(heroku config:get GOOGLE_CLIENT_SECRET -a mwap-staging)"
    # Store original redirect URIs as comments
    echo "# Production Google redirect: $(heroku config:get GOOGLE_REDIRECT_URI -a mwap-staging)"
    echo "# Production Dropbox redirect: $(heroku config:get DROPBOX_REDIRECT_URI -a mwap-staging)"
    
    # Set local development redirect URIs
    echo "GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/auth/google/callback"
    echo "DROPBOX_REDIRECT_URI=http://localhost:3001/api/v1/auth/dropbox/callback"
    
    echo "MONGO_CLIENT_ENCRYPTION_KEY=$(heroku config:get MONGO_CLIENT_ENCRYPTION_KEY -a mwap-staging)"
    echo "MONGO_ENCRYPTION_KEY_NAME=mwap_data_key"
    echo "MONGO_MAX_POOL_SIZE=10"
    echo "MONGO_MIN_POOL_SIZE=2"
    echo "MONGO_CONNECT_TIMEOUT_MS=10000"
    echo "MONGO_SOCKET_TIMEOUT_MS=45000"
    echo "RATE_LIMITING_ENABLED=true"
    echo "RATE_LIMIT_WINDOW_MS=900000"
    echo "RATE_LIMIT_MAX_REQUESTS=100"
    echo "ENABLE_REQUEST_LOGGING=true"
    echo "METRICS_ENABLED=true"
    echo "METRICS_INTERVAL=60000"
    echo "CACHE_ENABLED=true"
    echo "CACHE_TTL=300"
    echo "CACHE_CHECK_PERIOD=600"
} > ./server/.env

# Set up client configuration
echo "🔄 Setting up client configuration..."
cp ./client/.env.example ./client/.env

# Override with local development settings
echo "Configuring client environment..."
{
    echo "VITE_API_URL=http://localhost:3001/api"
    # Fetch Auth0 configuration from Heroku staging
    echo "VITE_AUTH0_DOMAIN=$(heroku config:get AUTH0_DOMAIN -a mwap-staging)"
    echo "VITE_AUTH0_CLIENT_ID=$(heroku config:get AUTH0_CLIENT_ID -a mwap-staging)"
    echo "VITE_AUTH0_AUDIENCE=$(heroku config:get AUTH0_AUDIENCE -a mwap-staging)"
} > ./client/.env

echo "📦 Installing dependencies..."

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Build the client
echo "🏗️ Building client..."
cd client
npm run build
cd ..

# Start the applications
echo "🚀 Starting the applications..."

# Start the server in the background
echo "Starting server on port 3001..."
cd server
npm run dev &
SERVER_PID=$!
cd ..

# Wait a bit for the server to start
sleep 5

# Start the client
echo "Starting client on port 5173..."
cd client
npm run dev -- --port 5173 --host 0.0.0.0 &
CLIENT_PID=$!
cd ..

echo "✨ Setup complete!"
echo "📝 Server running on http://localhost:3001"
echo "🌐 Client running on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both applications"

# Handle cleanup on script termination
cleanup() {
    echo ""
    echo "🛑 Shutting down server and client..."

    # Send SIGTERM to server
    if [ -n "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
        echo "➤ Sending SIGTERM to server (PID: $SERVER_PID)..."
        kill -TERM $SERVER_PID 2>/dev/null
    fi

    # Send SIGTERM to client
    if [ -n "$CLIENT_PID" ] && kill -0 $CLIENT_PID 2>/dev/null; then
        echo "➤ Sending SIGTERM to client (PID: $CLIENT_PID)..."
        kill -TERM $CLIENT_PID 2>/dev/null
    fi

    # Wait briefly for them to terminate gracefully
    sleep 2

    # Force kill if still running
    if [ -n "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
        echo "➤ Force stopping server..."
        kill -9 $SERVER_PID 2>/dev/null
    fi

    if [ -n "$CLIENT_PID" ] && kill -0 $CLIENT_PID 2>/dev/null; then
        echo "➤ Force stopping client..."
        kill -9 $CLIENT_PID 2>/dev/null
    fi

    echo "✅ All processes stopped. Exiting."
    exit 0
}

# Handle termination signals
trap cleanup SIGINT SIGTERM SIGHUP EXIT ERR

# Wait for either process to exit
wait $SERVER_PID $CLIENT_PID