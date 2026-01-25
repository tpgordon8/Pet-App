#!/bin/bash

# PetLog Setup and Run Script
# This pulls latest code, installs dependencies, and starts the app

echo "🔄 Pulling latest code from GitHub..."
git pull

echo "📦 Installing dependencies..."
npm install

echo "🚀 Starting PetLog app..."
echo "Scan the QR code that appears with Expo Go on your iPhone!"
npm start
