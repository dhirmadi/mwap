#!/bin/bash
# 🚀 build-check.sh
echo "📦 Cleaning up previous builds..."
rm -rf dist

echo "📄 Running TypeScript compilation..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ TypeScript build failed."
  exit 1
fi

echo "✅ TypeScript compiled successfully."

echo "🔍 Running ESLint for syntax and style..."
npx eslint 'src/**/*.{ts,tsx}' --max-warnings=0

if [ $? -ne 0 ]; then
  echo "❌ Linting errors found."
  exit 1
fi

echo "✅ No linting errors. You're good to go!"
