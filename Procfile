web: export NODE_OPTIONS="--max-old-space-size=512" && cd client && rm -rf dist node_modules && npm install && npm run build && cd ../server && rm -rf dist node_modules && npm install && cd /app/server && NODE_ENV=production npm start