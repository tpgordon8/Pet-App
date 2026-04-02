#!/bin/bash
set -euo pipefail

# Git Push with Exponential Backoff Retry Logic
# For Pet-App (Tailr) - Token Optimization Phase 3
#
# Implements retry logic for git push operations with exponential backoff:
# - Retry attempts: 4 times
# - Delays: 2s, 4s, 8s, 16s (exponential backoff)
# - Only retries on network failures (not authorization errors)
#
# Usage:
#   ./scripts/git-push-with-retry.sh <branch-name>
#   ./scripts/git-push-with-retry.sh claude/pet-activity-logger-Etaqb

# Configuration
EXPECTED_BRANCH_PREFIX="claude/"
EXPECTED_BRANCH_SUFFIX="-Etaqb"
MAX_RETRIES=4
DELAYS=(2 4 8 16)  # Exponential backoff delays in seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get branch name from argument or detect current branch
if [ $# -eq 0 ]; then
  BRANCH=$(git branch --show-current 2>/dev/null)
  if [ -z "$BRANCH" ]; then
    echo -e "${RED}❌ Error: Not on a git branch (detached HEAD?)${NC}"
    echo "Please specify branch name: $0 <branch-name>"
    exit 1
  fi
  echo -e "${BLUE}📍 Detected current branch: $BRANCH${NC}"
else
  BRANCH="$1"
fi

# Validate branch naming convention
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔀 BRANCH VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ ! "$BRANCH" =~ ^${EXPECTED_BRANCH_PREFIX} ]]; then
  echo -e "${RED}❌ Branch name must start with '${EXPECTED_BRANCH_PREFIX}'${NC}"
  echo "   Current branch: $BRANCH"
  echo "   Expected format: ${EXPECTED_BRANCH_PREFIX}*${EXPECTED_BRANCH_SUFFIX}"
  exit 1
fi

if [[ ! "$BRANCH" =~ ${EXPECTED_BRANCH_SUFFIX}$ ]]; then
  echo -e "${YELLOW}⚠️  Warning: Branch name should end with '${EXPECTED_BRANCH_SUFFIX}'${NC}"
  echo "   Current branch: $BRANCH"
  echo "   Expected format: ${EXPECTED_BRANCH_PREFIX}*${EXPECTED_BRANCH_SUFFIX}"
  echo ""
  read -p "Continue anyway? (y/n): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Push cancelled."
    exit 1
  fi
fi

echo -e "${GREEN}✅ Branch name validation passed${NC}"
echo "   Branch: $BRANCH"

# Check for uncommitted changes
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! git diff-index --quiet HEAD --; then
  echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
  git status --short
  echo ""
  read -p "Continue pushing anyway? (y/n): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Push cancelled. Commit your changes first."
    exit 1
  fi
fi

# Show what will be pushed
CURRENT_COMMIT=$(git rev-parse HEAD)
SHORT_COMMIT=$(git rev-parse --short HEAD)
COMMITS_AHEAD=$(git rev-list --count origin/"$BRANCH".."$BRANCH" 2>/dev/null || echo "unknown")

echo -e "${BLUE}📤 Preparing to push:${NC}"
echo "   Branch: $BRANCH"
echo "   Commit: $SHORT_COMMIT"
if [ "$COMMITS_AHEAD" != "unknown" ]; then
  echo "   Commits ahead of remote: $COMMITS_AHEAD"
fi
echo ""

# Push function with retry logic
push_with_retry() {
  local attempt=1

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚀 PUSHING TO REMOTE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  while [ $attempt -le $MAX_RETRIES ]; do
    echo -e "${BLUE}[Attempt $attempt/$MAX_RETRIES]${NC} git push -u origin $BRANCH"
    echo ""

    # Attempt the push
    if git push -u origin "$BRANCH" 2>&1; then
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo -e "${GREEN}✅ PUSH SUCCESSFUL${NC}"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "Branch '$BRANCH' pushed to origin successfully!"
      echo "Commit: $SHORT_COMMIT"
      echo ""
      return 0
    fi

    # Capture the exit code
    EXIT_CODE=$?

    # Check if this was an authorization error (403, permission denied)
    if git push -u origin "$BRANCH" 2>&1 | grep -q -E "(403|Permission denied|authentication failed|fatal: Authentication failed)"; then
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo -e "${RED}❌ AUTHORIZATION ERROR${NC}"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "Push failed due to authorization/permission error."
      echo "This is NOT a network issue - retrying won't help."
      echo ""
      echo "Possible causes:"
      echo "  1. Branch name doesn't match session ID (must end with '${EXPECTED_BRANCH_SUFFIX}')"
      echo "  2. Missing or invalid authentication credentials"
      echo "  3. Insufficient repository permissions"
      echo ""
      echo "Please check your branch name and credentials."
      echo ""
      return 1
    fi

    # If we've exhausted retries, fail
    if [ $attempt -eq $MAX_RETRIES ]; then
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo -e "${RED}❌ PUSH FAILED AFTER $MAX_RETRIES ATTEMPTS${NC}"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "All retry attempts exhausted."
      echo "This may indicate a persistent network issue or remote repository problem."
      echo ""
      echo "Suggestions:"
      echo "  1. Check your network connection"
      echo "  2. Verify the remote repository is accessible"
      echo "  3. Try again later or contact repository administrator"
      echo ""
      return 1
    fi

    # Network error - retry with exponential backoff
    DELAY=${DELAYS[$((attempt-1))]}
    echo ""
    echo -e "${YELLOW}⚠️  Push failed (network error)${NC}"
    echo -e "${YELLOW}⏱️  Retrying in ${DELAY}s... (attempt $((attempt+1))/$MAX_RETRIES)${NC}"
    echo ""
    sleep "$DELAY"

    attempt=$((attempt + 1))
  done
}

# Execute push with retry logic
push_with_retry
EXIT_CODE=$?

# Exit with the same code as the push operation
exit $EXIT_CODE
