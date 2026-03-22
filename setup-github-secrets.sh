#!/bin/bash

# GitHub Secrets Setup Script for Pet-App
# This script automatically adds all 12 required secrets to your GitHub repository

set -e  # Exit on error

REPO="tpgordon8/Pet-App"

echo "🔐 GitHub Secrets Setup for Pet-App"
echo "===================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Install it with:"
    echo "  macOS: brew install gh"
    echo "  Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: winget install --id GitHub.cli"
    echo ""
    exit 1
fi

# Check authentication
echo "Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    echo ""
    echo "Run: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI is authenticated"
echo ""

# Firebase secrets (from .env.local or hardcoded from GITHUB_SECRETS_SETUP.md)
echo "📋 Adding Firebase secrets..."

gh secret set VITE_FIREBASE_API_KEY \
    --repo "$REPO" \
    --body "AIzaSyBZeE0mf4ptN0wunDbEFbgMZ29nfWIA4NQ"

gh secret set VITE_FIREBASE_AUTH_DOMAIN \
    --repo "$REPO" \
    --body "petlog-c4c1e.firebaseapp.com"

gh secret set VITE_FIREBASE_DATABASE_URL \
    --repo "$REPO" \
    --body "https://petlog-c4c1e-default-rtdb.firebaseio.com"

gh secret set VITE_FIREBASE_PROJECT_ID \
    --repo "$REPO" \
    --body "petlog-c4c1e"

gh secret set VITE_FIREBASE_STORAGE_BUCKET \
    --repo "$REPO" \
    --body "petlog-c4c1e.firebasestorage.app"

gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID \
    --repo "$REPO" \
    --body "417384966953"

gh secret set VITE_FIREBASE_APP_ID \
    --repo "$REPO" \
    --body "1:417384966953:web:8b00d0cac96e2b7ec2a538"

gh secret set VITE_APP_NAME \
    --repo "$REPO" \
    --body "Tailr"

gh secret set VITE_APP_VERSION \
    --repo "$REPO" \
    --body "2.0.0"

echo "✅ Added 9 Firebase secrets"
echo ""

# Vercel secrets (from .vercel/project.json and user input)
echo "📋 Adding Vercel secrets..."
echo ""

# Read from .vercel/project.json
VERCEL_ORG_ID=$(cat .vercel/project.json | grep orgId | cut -d'"' -f4)
VERCEL_PROJECT_ID=$(cat .vercel/project.json | grep projectId | cut -d'"' -f4)

gh secret set VERCEL_ORG_ID \
    --repo "$REPO" \
    --body "$VERCEL_ORG_ID"

gh secret set VERCEL_PROJECT_ID \
    --repo "$REPO" \
    --body "$VERCEL_PROJECT_ID"

echo "✅ Added VERCEL_ORG_ID: $VERCEL_ORG_ID"
echo "✅ Added VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
echo ""

# Vercel token needs to be provided by user
echo "🔑 Setting up VERCEL_TOKEN..."
echo ""
echo "You need to get your Vercel token from:"
echo "  https://vercel.com/account/tokens"
echo ""
echo "Steps:"
echo "  1. Click 'Create Token'"
echo "  2. Name: 'GitHub Actions CI/CD'"
echo "  3. Scope: 'Full Account'"
echo "  4. Click 'Create' and copy the token"
echo ""
read -sp "Paste your Vercel token here: " VERCEL_TOKEN
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ No token provided. Skipping VERCEL_TOKEN."
    echo ""
    echo "⚠️  WARNING: CI/CD will not work without VERCEL_TOKEN"
    echo "You can add it manually later with:"
    echo "  gh secret set VERCEL_TOKEN --repo $REPO --body 'YOUR_TOKEN'"
    echo ""
else
    gh secret set VERCEL_TOKEN \
        --repo "$REPO" \
        --body "$VERCEL_TOKEN"
    echo "✅ Added VERCEL_TOKEN"
    echo ""
fi

# Summary
echo "================================"
echo "🎉 GitHub Secrets Setup Complete!"
echo "================================"
echo ""
echo "Secrets added to: $REPO"
echo ""
echo "Next steps:"
echo "  1. Push a commit to trigger GitHub Actions"
echo "  2. Check workflow: https://github.com/$REPO/actions"
echo "  3. View secrets: https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "The enhanced CI/CD workflow will:"
echo "  ✅ Run ESLint for code quality"
echo "  ✅ Run unit tests"
echo "  ✅ Build the application"
echo "  ✅ Deploy to Vercel (only if all checks pass)"
echo ""
