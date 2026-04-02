---
name: verify
version: 1.0.0
description: |
  Run quality gates (lint + test + build) before committing.
  Use when you want to verify code changes pass all checks.
allowed-tools:
  - Bash
  - Read
user-invocable: true
---

# Verify - Quality Gates for Pet-App

Run comprehensive quality checks (ESLint, unit tests, production build) in a single command to ensure code quality before committing.

## When to Use

Use `/verify` when:
- **Before committing** - Ensure changes pass all quality gates
- **After making changes** - Validate that modifications don't break anything
- **Before creating a PR** - Confirm code is ready for review
- **Debugging CI/CD failures** - Reproduce the same checks locally

**DO NOT use when:**
- You just want to run one specific check (use `npm run lint`, `npm run test:unit`, or `npm run build` directly)
- You're in the middle of debugging and code isn't ready yet

## What It Checks

This skill runs three quality gates in sequence:

1. **ESLint** - Code linting for Vue 3, JavaScript, and style issues
2. **Unit Tests** - Vitest test suite (all tests must pass)
3. **Production Build** - Vite build verification (ensures no build errors)

**Exit Strategy:** Stops on first failure for fast feedback.

## How It Works

### Step 1: Run ESLint

```bash
npm run lint
```

**What it checks:**
- Vue 3 component syntax
- JavaScript ES6+ patterns
- Code style consistency
- Potential bugs (unused vars, missing imports, etc.)

**Pass criteria:** Zero errors (warnings are okay)

### Step 2: Run Unit Tests

```bash
npm run test:unit:run
```

**What it checks:**
- Component logic correctness
- Store (Pinia) state management
- Utility function behavior
- Edge cases and error handling

**Pass criteria:** All tests pass, zero failures

### Step 3: Run Production Build

```bash
npm run build
```

**What it checks:**
- Vite production build succeeds
- No TypeScript errors (if applicable)
- No missing imports or broken references
- Bundle size optimization works

**Pass criteria:** Build completes successfully

## Usage

**As a skill (recommended):**
```
/verify
```

**Manual execution (if skill not available):**
```bash
npm run lint && npm run test:unit:run && npm run build
```

## Output Format

The skill provides clear, color-coded output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 RUNNING QUALITY GATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/3] Running ESLint...
✅ ESLint passed

[2/3] Running unit tests...
✅ All tests passed (42 tests)

[3/3] Running production build...
✅ Build completed successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ALL QUALITY GATES PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your code is ready to commit!
```

**On failure:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 RUNNING QUALITY GATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/3] Running ESLint...
❌ ESLint failed

/home/user/Pet-App/src/components/ActivityButton.vue
  45:7  error  'unusedVar' is assigned a value but never used  no-unused-vars

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ QUALITY GATES FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fix the errors above before committing.
```

## Implementation

```bash
#!/bin/bash
set -euo pipefail

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 RUNNING QUALITY GATES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Gate 1: ESLint
echo "[1/3] Running ESLint..."
if npm run lint > /dev/null 2>&1; then
  echo "✅ ESLint passed"
else
  echo "❌ ESLint failed"
  echo ""
  npm run lint
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ QUALITY GATES FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Fix the ESLint errors above before committing."
  echo ""
  exit 1
fi

echo ""

# Gate 2: Unit Tests
echo "[2/3] Running unit tests..."
if npm run test:unit:run > /dev/null 2>&1; then
  TEST_OUTPUT=$(npm run test:unit:run 2>&1)
  TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passed)' || echo "unknown")
  echo "✅ All tests passed ($TEST_COUNT tests)"
else
  echo "❌ Unit tests failed"
  echo ""
  npm run test:unit:run
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ QUALITY GATES FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Fix the failing tests above before committing."
  echo ""
  exit 1
fi

echo ""

# Gate 3: Production Build
echo "[3/3] Running production build..."
if npm run build > /dev/null 2>&1; then
  echo "✅ Build completed successfully"
else
  echo "❌ Build failed"
  echo ""
  npm run build
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ QUALITY GATES FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Fix the build errors above before committing."
  echo ""
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ ALL QUALITY GATES PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Your code is ready to commit!"
echo ""
```

## Skill Execution (for Claude)

When the user invokes `/verify`, you should:

1. **Run the quality gates:**
   ```bash
   npm run lint && npm run test:unit:run && npm run build
   ```

2. **Report results clearly:**
   - If all pass: "✅ All quality gates passed! Your code is ready to commit."
   - If any fail: Show which step failed and the error output

3. **Provide actionable feedback:**
   - For lint errors: Show file paths and line numbers
   - For test failures: Show which tests failed and why
   - For build errors: Show compilation errors

4. **Exit early on failure:**
   - Don't continue to next step if current step fails
   - This gives faster feedback to the developer

## Integration with Git Workflow

**Recommended usage:**
1. Make code changes
2. Run `/verify` to check quality
3. Fix any issues
4. Run `/verify` again to confirm
5. Commit with `/commit-session` (Phase 4 skill)
6. Push with `/push-retry` (Phase 3 skill)

**Note:** The GitHub Actions CI/CD pipeline runs the same checks on push, but running `/verify` locally catches issues earlier and faster.

## Troubleshooting

**"ESLint not found":**
- Run `npm install` to install dependencies
- Check that `package.json` has eslint configured

**"Tests timing out":**
- Unit tests should complete in <30 seconds
- If hanging, check for infinite loops or missing mocks

**"Build fails in CI but passes locally":**
- Check that all environment variables are set in GitHub Secrets
- Verify Firebase config is correct in `.env`

**"Skill not found":**
- Ensure skill is symlinked: `ls -la .claude/skills/verify`
- Check `.claude/skills-custom/verify/SKILL.md` exists

## Performance

**Typical execution times:**
- ESLint: 2-5 seconds
- Unit tests: 5-15 seconds
- Production build: 10-20 seconds
- **Total: ~20-40 seconds**

Running all three sequentially is faster than debugging CI/CD failures (which take 2-3 minutes to discover).

## Related Skills

- `/commit-session` (Phase 4) - Commit with formatted message
- `/push-retry` (Phase 3) - Push with network retry logic
- `/test-checklist` (Phase 5) - Interactive testing guide

## Version History

- **1.0.0** (2026-04-02) - Initial implementation for Token Optimization Phase 2
