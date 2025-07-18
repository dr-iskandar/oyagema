#!/bin/bash

# Script to check TypeScript types in the codebase

echo "🔍 Checking TypeScript types..."

# Run TypeScript compiler in noEmit mode to check types without generating output files
npx tsc --noEmit

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ Type checking passed! No type errors found."
  exit 0
else
  echo "❌ Type checking failed! Please fix the type errors above."
  exit 1
fi