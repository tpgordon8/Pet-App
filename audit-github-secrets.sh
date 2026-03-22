#!/bin/bash

# GitHub Secrets Audit Script
# Checks which secrets are configured and which are missing

REPO="tpgordon8/Pet-App"

echo "🔍 GitHub Secrets Audit for Pet-App"
echo "===================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Install it or check manually at:"
    echo "https://github.com/$REPO/settings/secrets/actions"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    echo "Run: gh auth login"
    exit 1
fi

echo "Fetching secrets from GitHub..."
echo ""

# Get list of secret names (values are never exposed)
SECRETS=$(gh secret list --repo "$REPO" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch secrets. Error:"
    echo "$SECRETS"
    echo ""
    echo "Check manually at:"
    echo "https://github.com/$REPO/settings/secrets/actions"
    exit 1
fi

echo "✅ Successfully fetched secret list"
echo ""
echo "════════════════════════════════════════"
echo "CURRENT SECRETS IN GITHUB:"
echo "════════════════════════════════════════"
echo "$SECRETS"
echo ""

# Define required secrets
REQUIRED_SECRETS=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_DATABASE_URL"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
    "VITE_APP_NAME"
    "VITE_APP_VERSION"
    "VERCEL_ORG_ID"
    "VERCEL_PROJECT_ID"
    "VERCEL_TOKEN"
)

echo "════════════════════════════════════════"
echo "AUDIT RESULTS:"
echo "════════════════════════════════════════"
echo ""

MISSING=()
FOUND=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    if echo "$SECRETS" | grep -q "^$secret"; then
        echo "✅ $secret"
        FOUND+=("$secret")
    else
        echo "❌ $secret - MISSING"
        MISSING+=("$secret")
    fi
done

echo ""
echo "════════════════════════════════════════"
echo "SUMMARY:"
echo "════════════════════════════════════════"
echo "Total required: ${#REQUIRED_SECRETS[@]}"
echo "Found: ${#FOUND[@]}"
echo "Missing: ${#MISSING[@]}"
echo ""

if [ ${#MISSING[@]} -eq 0 ]; then
    echo "🎉 All secrets are configured!"
    echo ""
    echo "Your CI/CD pipeline is ready to deploy."
    echo "Push a commit to trigger: git push"
else
    echo "⚠️  Missing ${#MISSING[@]} secret(s):"
    for secret in "${MISSING[@]}"; do
        echo "   - $secret"
    done
    echo ""
    echo "Add missing secrets using:"
    echo "  ./setup-github-secrets.sh"
    echo ""
    echo "Or manually at:"
    echo "  https://github.com/$REPO/settings/secrets/actions"
fi

echo ""
echo "════════════════════════════════════════"
echo "EXTRA SECRETS (not in required list):"
echo "════════════════════════════════════════"

# Find secrets that exist but aren't in our required list
while IFS= read -r line; do
    SECRET_NAME=$(echo "$line" | awk '{print $1}')
    if [ ! -z "$SECRET_NAME" ] && [ "$SECRET_NAME" != "NAME" ]; then
        IS_REQUIRED=false
        for req in "${REQUIRED_SECRETS[@]}"; do
            if [ "$SECRET_NAME" = "$req" ]; then
                IS_REQUIRED=true
                break
            fi
        done
        if [ "$IS_REQUIRED" = false ]; then
            echo "ℹ️  $SECRET_NAME (not required for current CI/CD)"
        fi
    fi
done <<< "$SECRETS"

echo ""
echo "Audit complete!"
