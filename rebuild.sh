#!/bin/bash
# This script performs a complete clean rebuild of the BTS Scholarship application
# It clears Next.js build cache and node_modules to ensure a fresh start

echo "Cleaning Next.js build artifacts..."
rm -rf .next
rm -rf node_modules
rm -rf dist
rm -rf build

echo "Clearing npm cache..."
npm cache clean --force

echo "Reinstalling dependencies..."
npm install

echo "Running build..."
npm run build

echo "Build complete! Starting development server..."
npm run dev
