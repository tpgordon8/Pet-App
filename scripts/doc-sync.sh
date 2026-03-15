#!/bin/bash
# Documentation Sync Script
# Parses recent undocumented commits and generates documentation updates
# Usage: npm run doc-sync or ./scripts/doc-sync.sh

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
DOC_TRACKER="$REPO_ROOT/.git/undocumented_commits.txt"
PROGRESS_FILE="$REPO_ROOT/PROGRESS.md"
DEVLOG_FILE="$REPO_ROOT/DEVLOG.md"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Documentation Sync Tool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if there are undocumented commits
if [ ! -f "$DOC_TRACKER" ] || [ ! -s "$DOC_TRACKER" ]; then
  echo -e "${GREEN}✓ No undocumented commits found.${NC}"
  echo "  All work is documented!"
  echo ""
  exit 0
fi

# Count and display undocumented commits
COMMIT_COUNT=$(wc -l < "$DOC_TRACKER")
echo -e "${YELLOW}Found $COMMIT_COUNT undocumented commit(s)${NC}"
echo ""

# Display commits
echo "Undocumented commits:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
while IFS=$'\t' read -r hash timestamp message; do
  SHORT_HASH=$(echo "$hash" | cut -c1-7)
  echo -e "${BLUE}$SHORT_HASH${NC} - $message"
  echo "  Date: $timestamp"
done < "$DOC_TRACKER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate documentation suggestions
echo "Suggested documentation updates:"
echo ""
echo "1. Update PROGRESS.md:"
echo "   - Add latest commit summaries to 'Current State Summary'"
echo "   - Update 'Last Updated' timestamp"
echo "   - Mark completed tasks with ✅"
echo ""
echo "2. Update DEVLOG.md:"
echo "   - Add new section for latest work"
echo "   - Document technical implementation details"
echo "   - Note any issues or learnings"
echo ""

# Offer to clear the tracker
read -p "Have you updated the documentation? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm "$DOC_TRACKER"
  echo -e "${GREEN}✓ Documentation tracker cleared!${NC}"
  echo ""
else
  echo -e "${YELLOW}⚠ Tracker kept. Run this script again after updating docs.${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
