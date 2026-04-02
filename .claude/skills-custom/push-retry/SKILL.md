---
name: push-retry
version: 1.0.0
description: |
  Git push with exponential backoff retry logic for network failures.
  Use when pushing code to handle transient network issues automatically.
allowed-tools:
  - Bash
  - Read
user-invocable: true
argument-hint: "[branch-name]"
---

# Push-Retry - Git Push with Network Retry Logic

Push code to remote repository with automatic retry logic for network failures using exponential backoff (2s, 4s, 8s, 16s delays).

## When to Use

Use `/push-retry` when:
- **Pushing code to remote** - Standard push operation with built-in resilience
- **Unreliable network** - Environments with intermittent connectivity
- **After committing changes** - As part of normal git workflow
- **CI/CD environments** - Where network stability isn't guaranteed

**DO NOT use when:**
- You haven't committed your changes yet (commit first)
- You want to force push (this skill doesn't support --force)
- You're pushing to a different branch than current (specify branch name)

## What It Does

This skill wraps `git push` with intelligent retry logic:

1. **Validates branch naming** - Ensures branch follows project conventions
2. **Checks for uncommitted changes** - Warns if working tree is dirty
3. **Attempts push** - Tries `git push -u origin <branch>`
4. **Retries on network failures** - Up to 4 attempts with exponential backoff
5. **Fails fast on auth errors** - Doesn't retry if it's a permission issue

## Retry Strategy

**Exponential Backoff:**
- Attempt 1: Immediate
- Attempt 2: Wait 2 seconds
- Attempt 3: Wait 4 seconds
- Attempt 4: Wait 8 seconds
- Attempt 5: Wait 16 seconds (final attempt)

**Total possible wait time:** 30 seconds (2+4+8+16)

**Network vs Authorization Errors:**
- **Network errors** → Retry with backoff
- **Authorization errors (403)** → Fail immediately (no retry)

## Branch Naming Validation

**Pet-App Convention:**
- Must start with: `claude/`
- Must end with: `-Etaqb` (session ID)
- Example: `claude/pet-activity-logger-Etaqb`

**Why validation matters:**
- Push will fail with 403 if branch name doesn't match session ID
- Better to catch this early with clear error message
- Prevents wasted retry attempts on authorization failures

## Usage

**As a skill (recommended):**
```
/push-retry
```

**With specific branch:**
```
/push-retry claude/pet-activity-logger-Etaqb
```

**Manual execution:**
```bash
./scripts/git-push-with-retry.sh
./scripts/git-push-with-retry.sh claude/pet-activity-logger-Etaqb
```

**Standard git command (no retry):**
```bash
git push -u origin claude/pet-activity-logger-Etaqb
```

## Output Format

**Successful push:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔀 BRANCH VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Branch name validation passed
   Branch: claude/pet-activity-logger-Etaqb

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 STATUS CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Preparing to push:
   Branch: claude/pet-activity-logger-Etaqb
   Commit: a1b2c3d
   Commits ahead of remote: 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 PUSHING TO REMOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Attempt 1/4] git push -u origin claude/pet-activity-logger-Etaqb

To http://127.0.0.1:63833/git/tpgordon8/Pet-App
   b2b427e..6654b91  claude/pet-activity-logger-Etaqb -> claude/pet-activity-logger-Etaqb

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PUSH SUCCESSFUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch 'claude/pet-activity-logger-Etaqb' pushed to origin successfully!
Commit: a1b2c3d
```

**Network failure with retry:**
```
[Attempt 1/4] git push -u origin claude/pet-activity-logger-Etaqb

⚠️  Push failed (network error)
⏱️  Retrying in 2s... (attempt 2/4)

[Attempt 2/4] git push -u origin claude/pet-activity-logger-Etaqb

To http://127.0.0.1:63833/git/tpgordon8/Pet-App
   b2b427e..6654b91  claude/pet-activity-logger-Etaqb -> claude/pet-activity-logger-Etaqb

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PUSH SUCCESSFUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Authorization error (no retry):**
```
[Attempt 1/4] git push -u origin claude/wrong-branch-name

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ AUTHORIZATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Push failed due to authorization/permission error.
This is NOT a network issue - retrying won't help.

Possible causes:
  1. Branch name doesn't match session ID (must end with '-Etaqb')
  2. Missing or invalid authentication credentials
  3. Insufficient repository permissions

Please check your branch name and credentials.
```

## Skill Execution (for Claude)

When the user invokes `/push-retry` or `/push-retry <branch>`, you should:

1. **Determine branch name:**
   - If argument provided: Use that branch
   - If no argument: Use current branch (`git branch --show-current`)

2. **Run the retry script:**
   ```bash
   ./scripts/git-push-with-retry.sh [branch-name]
   ```

3. **Report results:**
   - **Success:** "✅ Push successful! Branch 'X' pushed to origin."
   - **Network failure after retries:** "❌ Push failed after 4 attempts. Check network connection."
   - **Authorization error:** "❌ Push failed due to authorization. Check branch name matches session ID."

4. **Provide context:**
   - Show which commit was pushed (short hash)
   - Show how many commits were pushed
   - If retries occurred, mention how many attempts it took

## Integration with Git Workflow

**Recommended workflow:**
1. Make code changes
2. Run `/verify` to check quality gates
3. Commit with `/commit-session` (Phase 4 skill)
4. Push with `/push-retry` (this skill)

**GitHub Actions CI/CD:**
- After successful push, GitHub Actions will run automatically
- Quality gates (lint + test + build) run again in CI/CD
- Deployment to Vercel happens if all checks pass

## Implementation Details

**Script location:** `scripts/git-push-with-retry.sh`

**Key features:**
- Branch name validation (prefix: `claude/`, suffix: `-Etaqb`)
- Uncommitted changes detection
- Network vs authorization error detection
- Colored output for readability
- Progress indicators during retries
- Informative error messages

**Exit codes:**
- `0` - Push successful
- `1` - Push failed (authorization or exhausted retries)

## Troubleshooting

**"Branch name must start with 'claude/'":**
- You're on the wrong branch
- Switch to correct branch: `git checkout claude/pet-activity-logger-Etaqb`
- Or create it: `git checkout -b claude/pet-activity-logger-Etaqb`

**"Branch name should end with '-Etaqb'":**
- Branch doesn't match session ID
- This will cause 403 authorization error on push
- Create correct branch or update session ID in script

**"Push failed after 4 attempts":**
- Network connectivity issue
- Check internet connection
- Verify remote repository URL: `git remote -v`
- Try again later

**"Authorization error":**
- Branch name doesn't match session ID
- Missing git credentials
- Insufficient repository permissions
- Contact repository administrator

**"You have uncommitted changes":**
- Working tree is dirty
- Commit your changes first: `git add . && git commit`
- Or stash them: `git stash`
- Or continue pushing anyway (if changes are in progress)

## Performance

**Best case (no failures):**
- Same as normal `git push`
- Typically 1-5 seconds depending on repository size

**With 1 retry (network blip):**
- First attempt: ~1-3s
- Wait: 2s
- Second attempt: ~1-3s
- **Total: ~5-8s**

**Worst case (4 retries):**
- 5 attempts × ~2s each = 10s
- Waits: 2+4+8+16 = 30s
- **Total: ~40s**

Still faster than diagnosing and manually retrying network issues.

## Related Skills

- `/verify` (Phase 2) - Run quality gates before committing
- `/commit-session` (Phase 4) - Commit with formatted message
- `/test-checklist` (Phase 5) - Interactive testing guide

## Version History

- **1.0.0** (2026-04-02) - Initial implementation for Token Optimization Phase 3
  - Exponential backoff retry logic (2s, 4s, 8s, 16s)
  - Branch name validation
  - Network vs authorization error detection
  - Colored, informative output
