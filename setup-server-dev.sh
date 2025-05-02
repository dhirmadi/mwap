#!/bin/bash

set -e

echo "🚀 MWAP - Backend Only: Server Bootstrap"

SERVER_DIR="./server"
ENV_FILE="$SERVER_DIR/.env"

# Check for Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Install with: npm install -g heroku"
    exit 1
fi

# Check login
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run: heroku login"
    exit 1
fi

echo "🔎 Checking for existing .env file..."
if [ -f "$ENV_FILE" ]; then
    echo "✅ Found existing .env file: $ENV_FILE"
    read -p "❓ Rebuild .env from Heroku? (y/N): " REBUILD_ENV
else
    echo "⚠️ .env not found. Will fetch from Heroku..."
    REBUILD_ENV="y"
fi

if [[ "$REBUILD_ENV" =~ ^[Yy]$ ]]; then
    echo "🔄 Rebuilding .env from Heroku staging..."
    {
        echo "PORT=3001"
        echo "NODE_ENV=development"
        echo "API_BASE_URL=http://localhost:3001"
        echo "CORS_ORIGIN=http://localhost:5173"
        echo "LOG_LEVEL=debug"
        echo "DEBUG=*"

        echo "MONGO_URI=$(heroku config:get MONGO_URI -a mwap-staging)"
        echo "AUTH0_DOMAIN=$(heroku config:get AUTH0_DOMAIN -a mwap-staging)"
        echo "AUTH0_CLIENT_ID=$(heroku config:get AUTH0_CLIENT_ID -a mwap-staging)"
        echo "AUTH0_CLIENT_SECRET=$(heroku config:get AUTH0_CLIENT_SECRET -a mwap-staging)"
        echo "AUTH0_AUDIENCE=$(heroku config:get AUTH0_AUDIENCE -a mwap-staging)"
        echo "DROPBOX_CLIENT_ID=$(heroku config:get DROPBOX_CLIENT_ID -a mwap-staging)"
        echo "DROPBOX_CLIENT_SECRET=$(heroku config:get DROPBOX_CLIENT_SECRET -a mwap-staging)"
        echo "GOOGLE_CLIENT_ID=$(heroku config:get GOOGLE_CLIENT_ID -a mwap-staging)"
        echo "GOOGLE_CLIENT_SECRET=$(heroku config:get GOOGLE_CLIENT_SECRET -a mwap-staging)"
        echo "# Google Redirect: $(heroku config:get GOOGLE_REDIRECT_URI -a mwap-staging)"
        echo "# Dropbox Redirect: $(heroku config:get DROPBOX_REDIRECT_URI -a mwap-staging)"
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
    } > "$ENV_FILE"
    echo "✅ .env file rebuilt."
fi

echo "📦 Installing server dependencies..."
cd "$SERVER_DIR"
npm install

echo "🧹 Killing any running server processes on port 3001..."
fuser -k 3001/tcp || true

echo "🚀 Starting server on port 3001..."
npm run dev
