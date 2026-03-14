#!/bin/bash

# BTS Scholarship Application - Clean Build Reset Script
# This script clears all build artifacts and reinstalls the project from scratch

echo "================================================"
echo "BTS Scholarship - Clean Build Environment Reset"
echo "================================================"
echo ""

echo "Step 1: Removing .next build cache..."
rm -rf .next/
echo "✓ Cleared .next folder"

echo ""
echo "Step 2: Removing node_modules..."
rm -rf node_modules/
echo "✓ Cleared node_modules folder"

echo ""
echo "Step 3: Clearing npm cache..."
npm cache clean --force
echo "✓ Cleared npm cache"

echo ""
echo "Step 4: Removing lock files for fresh install..."
rm -f package-lock.json
echo "✓ Removed package-lock.json"

echo ""
echo "Step 5: Reinstalling dependencies..."
npm install
echo "✓ Dependencies reinstalled"

echo ""
echo "Step 6: Running Next.js build..."
npm run build
echo "✓ Build complete"

echo ""
echo "================================================"
echo "Build environment reset complete!"
echo "================================================"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "To start the production server, run:"
echo "  npm run start"
echo ""
