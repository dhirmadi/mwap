#!/bin/bash

# Authentication Routes Migration Script

# Find all router files
ROUTER_FILES=$(find /Users/evert/Documents/GitHub/mwap/server/src -type f \( -name "*router.ts" -o -name "*routes.ts" \) | grep -E "v2|features-v2")

# Backup original files
for file in $ROUTER_FILES; do
    cp "$file" "$file.bak"
done

# Perform sed replacements
for file in $ROUTER_FILES; do
    # Replace import statements
    sed -i '' 's/import { requireAuth } from '\''@core-v2\/auth'\''/import { RouterAuth } from '\''@core-v2\/auth\/router'\''/g' "$file"

    # Replace .use(requireAuth()) with .use(RouterAuth.authenticated())
    sed -i '' 's/\.use(requireAuth())/\.use(RouterAuth.authenticated())/g' "$file"

    # Add logging for migration
    echo "Migrated authentication routes in $file"
done


echo "Route migration complete. Please review and test each migrated file."
echo "Backup files have been created with .bak extension."