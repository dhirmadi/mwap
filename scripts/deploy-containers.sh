#!/bin/bash

# Set environment variables
export HEROKU_APP_NAME=mwap-simpledeploy-g1u2y1hpkh0g

# Build containers
echo "Building containers..."
docker-compose -f docker-compose.prod.yml build

# Push containers to Heroku Container Registry
echo "Pushing containers to Heroku..."
docker push registry.heroku.com/${HEROKU_APP_NAME}/web
docker push registry.heroku.com/${HEROKU_APP_NAME}/api
docker push registry.heroku.com/${HEROKU_APP_NAME}/status

# Release containers
echo "Releasing containers..."
curl -X PATCH https://api.heroku.com/apps/${HEROKU_APP_NAME}/formation \
  -H "Authorization: Bearer ${HEROKU_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3" \
  -d '{
    "updates": [
      {
        "type": "web",
        "docker_image": "'$(docker inspect registry.heroku.com/${HEROKU_APP_NAME}/web --format={{.Id}})'"
      },
      {
        "type": "api",
        "docker_image": "'$(docker inspect registry.heroku.com/${HEROKU_APP_NAME}/api --format={{.Id}})'"
      },
      {
        "type": "status",
        "docker_image": "'$(docker inspect registry.heroku.com/${HEROKU_APP_NAME}/status --format={{.Id}})'"
      }
    ]
  }'

echo "Deployment complete!"