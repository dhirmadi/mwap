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

# Fetch environment variables from Heroku staging and format them for .env file
echo "🔄 Updating server/.env..."
heroku config -a mwap-staging --json | jq -r 'to_entries | .[] | .key + "=" + .value' > ./server/.env

# Add local development specific variables to server/.env
echo "Adding local development variables..."
{
    echo "PORT=3001"
    echo "NODE_ENV=development"
    echo "CORS_ORIGIN=http://localhost:5173"
} >> ./server/.env

# Create client .env file
echo "🔄 Creating client/.env..."
{
    echo "VITE_API_URL=http://localhost:3001"
    echo "VITE_AUTH0_DOMAIN=$(grep AUTH0_DOMAIN ./server/.env | cut -d '=' -f2)"
    echo "VITE_AUTH0_CLIENT_ID=$(grep AUTH0_CLIENT_ID ./server/.env | cut -d '=' -f2)"
    echo "VITE_AUTH0_AUDIENCE=$(grep AUTH0_AUDIENCE ./server/.env | cut -d '=' -f2)"
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
    echo "Stopping applications..."
    kill $SERVER_PID $CLIENT_PID
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait