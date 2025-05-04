#!/bin/bash
# 🧪 test-all.sh
echo "🧪 Running unit and integration tests with Jest..."
npx jest --coverage --passWithNoTests

if [ $? -ne 0 ]; then
  echo "❌ Tests failed."
  exit 1
fi

echo "✅ All tests passed!"
