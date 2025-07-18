#!/bin/bash

# Script to set up Git hooks

echo "🔧 Setting up Git hooks..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "❌ No .git directory found. Make sure you're in the root of a Git repository."
  exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create symbolic link for pre-commit hook
ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks set up successfully!"
echo "Pre-commit hook will now run before each commit."