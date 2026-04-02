#!/bin/bash
set -euo pipefail

# Session-Start Hook for Pet-App (Tailr)
# Automates session initialization to reduce token usage

# Enable async mode with 5-minute timeout (only for remote sessions)
if [ "${CLAUDE_CODE_REMOTE:-false}" = "true" ]; then
  echo '{"async": true, "asyncTimeout": 300000}'
fi

echo "🐾 Initializing Tailr Pet-App session..."

# Check Node.js and npm versions
echo "📦 Environment check:"
node --version
npm --version

# Install dependencies if node_modules is missing or package.json changed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies (first run)..."
  npm install
  echo "✅ Dependencies installed successfully!"
elif [ "package.json" -nt "node_modules" ]; then
  echo "📥 package.json updated, reinstalling dependencies..."
  npm install
  echo "✅ Dependencies updated successfully!"
else
  echo "✅ Dependencies already installed"
fi

# Validate current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
EXPECTED_BRANCH="claude/pet-activity-logger-Etaqb"

echo ""
echo "🔀 Branch validation:"
if [ "$CURRENT_BRANCH" = "$EXPECTED_BRANCH" ]; then
  echo "✅ On correct branch: $CURRENT_BRANCH"
else
  echo "⚠️  Current branch: $CURRENT_BRANCH"
  echo "   Expected branch: $EXPECTED_BRANCH"
  if [ "$CURRENT_BRANCH" = "unknown" ]; then
    echo "   (Not a git repository or detached HEAD)"
  fi
fi

# Display session context
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 SESSION CONTEXT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Project: Tailr - Pet Activity Logger"
echo "  Branch: $CURRENT_BRANCH"
echo "  Session ID: Etaqb"
echo ""
echo "📚 Quick Reference:"
echo "  • Run dev server: npm run dev"
echo "  • Run tests: npm run test:unit"
echo "  • Run linter: npm run lint"
echo "  • Build: npm run build"
echo ""
echo "🔧 Custom Skills Available:"
echo "  • /push-retry - Git push with network retry logic"
echo "  • /verify - Run lint + test + build quality gates"
echo "  • /commit-session - Commit with formatted session URL"
echo "  • /test-checklist - Interactive testing guide"
echo ""
echo "📖 Documentation:"
echo "  • CLAUDE.md - Full project context"
echo "  • ROADMAP.md - Feature roadmap"
echo "  • DEVLOG.md - Development history"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Session ready! Token-optimized workflow active."
echo ""
