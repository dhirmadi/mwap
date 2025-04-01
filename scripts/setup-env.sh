#!/bin/bash

# Set the API URL based on the current app's hostname
if [ "$HEROKU_APP_NAME" != "" ]; then
    echo "Setting VITE_API_URL for Heroku app: $HEROKU_APP_NAME"
    export VITE_API_URL="https://$HEROKU_APP_NAME.herokuapp.com/api"
fi
