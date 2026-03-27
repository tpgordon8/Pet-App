#!/bin/bash

##
# Visual Testing Helper Script for Tailr
#
# This script helps coordinate /browse and Playwright testing
#
# Usage:
#   ./scripts/visual-test.sh [command]
#
# Commands:
#   start       - Start dev server for visual testing
#   browse      - Instructions for using /browse
#   test        - Run Playwright tests
#   report      - Open test report
#   full        - Complete workflow (start + test + report)
#   clean       - Clean test results
##

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Commands
CMD="${1:-help}"

print_header() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

check_dev_server() {
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

start_server() {
  print_header "Starting Development Server"

  if check_dev_server; then
    print_success "Dev server already running at http://localhost:5173"
  else
    print_info "Starting Vite dev server..."
    npm run dev &
    DEV_PID=$!

    # Wait for server to be ready
    echo -n "Waiting for server"
    for i in {1..30}; do
      if check_dev_server; then
        echo ""
        print_success "Server ready at http://localhost:5173"
        return 0
      fi
      echo -n "."
      sleep 1
    done

    echo ""
    print_error "Server failed to start within 30 seconds"
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi
}

show_browse_instructions() {
  print_header "/browse Skill Instructions"
  echo ""
  echo "Use the /browse skill to visually inspect your app:"
  echo ""
  echo -e "${GREEN}Basic Usage:${NC}"
  echo "  /browse http://localhost:5173"
  echo ""
  echo -e "${GREEN}Examples:${NC}"
  echo "  /browse http://localhost:5173/dashboard"
  echo "  /browse http://localhost:5173 and click the Poop button"
  echo "  /browse http://localhost:5173 with mobile viewport"
  echo ""
  echo -e "${GREEN}What to Check:${NC}"
  echo "  ✓ Layout looks clean and organized"
  echo "  ✓ Colors match design system (sage green)"
  echo "  ✓ All buttons are visible and clickable"
  echo "  ✓ Activity feed displays correctly"
  echo "  ✓ Pet selector works"
  echo "  ✓ Responsive design on mobile"
  echo "  ✓ No console errors"
  echo ""
  echo -e "${YELLOW}Tip:${NC} Ask Claude to take screenshots for comparison"
  echo ""
}

run_playwright_tests() {
  print_header "Running Playwright Tests"

  if ! check_dev_server; then
    print_error "Dev server not running. Starting it now..."
    start_server
  fi

  print_info "Running e2e tests..."
  npm run test:e2e

  print_success "Tests complete!"
  echo ""
  print_info "View report: npm run test:report"
}

open_report() {
  print_header "Opening Test Report"

  if [ -f "playwright-report/index.html" ]; then
    print_info "Opening report in browser..."
    npx playwright show-report
  else
    print_error "No report found. Run tests first: npm run test:e2e"
    exit 1
  fi
}

run_full_workflow() {
  print_header "Running Full Visual Testing Workflow"
  echo ""

  # Step 1: Start server
  start_server
  echo ""

  # Step 2: Show browse instructions
  show_browse_instructions
  echo ""

  read -p "Press Enter after you've completed visual inspection with /browse..."
  echo ""

  # Step 3: Run Playwright tests
  run_playwright_tests
  echo ""

  # Step 4: Show report
  print_info "Opening test report..."
  sleep 2
  open_report
}

clean_results() {
  print_header "Cleaning Test Results"

  rm -rf test-results/
  rm -rf playwright-report/
  rm -rf test-results/screenshots/
  rm -rf test-results/visual-baselines/

  print_success "Test results cleaned"
}

show_help() {
  print_header "Visual Testing Helper"
  echo ""
  echo "Usage: ./scripts/visual-test.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start       Start dev server for visual testing"
  echo "  browse      Show /browse skill instructions"
  echo "  test        Run Playwright tests"
  echo "  report      Open test report"
  echo "  full        Complete workflow (start + browse + test + report)"
  echo "  clean       Clean test results"
  echo "  help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./scripts/visual-test.sh start"
  echo "  ./scripts/visual-test.sh test"
  echo "  ./scripts/visual-test.sh full"
  echo ""
  echo "Documentation:"
  echo "  See VISUAL_TESTING_WORKFLOW.md for complete guide"
  echo ""
}

# Main command router
case "$CMD" in
  start)
    start_server
    ;;
  browse)
    show_browse_instructions
    ;;
  test)
    run_playwright_tests
    ;;
  report)
    open_report
    ;;
  full)
    run_full_workflow
    ;;
  clean)
    clean_results
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    print_error "Unknown command: $CMD"
    echo ""
    show_help
    exit 1
    ;;
esac
