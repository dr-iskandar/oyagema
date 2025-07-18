#!/bin/bash

# Pre-commit hook to run type checking and linting

echo "🔍 Running pre-commit checks..."

# Save current staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.tsx?$')

if [ -z "$STAGED_FILES" ]; then
  echo "No TypeScript files to check. Skipping type check."
  exit 0
fi

# Run type checking
echo "Running type checking..."
npm run type-check

if [ $? -ne 0 ]; then
  echo "❌ Type checking failed! Please fix the type errors before committing."
  exit 1
fi

# Run linting
echo "Running linting..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linting failed! Please fix the linting errors before committing."
  exit 1
fi

echo "✅ All checks passed! Proceeding with commit."
exit 0