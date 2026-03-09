#!/bin/bash
# Deploy Firebase Realtime Database rules
#
# This script deploys the database security rules from firebase-rules.json
# to the Firebase project without requiring manual Firebase Console access.
#
# Prerequisites:
# - Firebase CLI installed: npm install -g firebase-tools
# - Authenticated with Firebase: firebase login
#
# Usage:
#   ./deploy-firebase-rules.sh

set -e  # Exit on error

echo "🔥 Deploying Firebase Realtime Database rules..."
echo ""

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI not found. Installing firebase-tools..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed successfully!"
    echo ""
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not authenticated with Firebase."
    echo "Please run: firebase login"
    echo ""
    exit 1
fi

# Display the project we're deploying to
echo "📋 Project: petlog-c4c1e"
echo "📄 Rules file: firebase-rules.json"
echo ""

# Deploy database rules only
echo "🚀 Deploying rules..."
firebase deploy --only database --project petlog-c4c1e

echo ""
echo "✅ Rules deployed successfully!"
echo ""
echo "🔗 Verify at: https://console.firebase.google.com/project/petlog-c4c1e/database/petlog-c4c1e-default-rtdb/rules"
echo "🌐 Test app at: https://pet-app-five-chi.vercel.app/"
