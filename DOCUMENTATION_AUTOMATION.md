# Documentation Automation System

**Last Updated:** 2026-03-15
**Status:** ✅ Active
**Automation Level:** Semi-Automatic with Smart Reminders

---

## Overview

This project uses an automated git hook system to ensure documentation stays synchronized with code changes. The system tracks commits, provides timely reminders, and prevents outdated documentation from being pushed.

**Key Benefits:**
- ✅ Never forget to update documentation
- ✅ Automatic tracking of undocumented work
- ✅ Pre-push validation prevents outdated docs
- ✅ Simple one-command sync tool

---

## How It Works

### 1. Post-Commit Hook (Automatic Tracking)

**File:** `.git/hooks/post-commit`

**What it does:**
- Runs automatically after every `git commit`
- Tracks non-documentation commits in `.git/undocumented_commits.txt`
- Alerts you after every 3 undocumented commits
- Skips commits that start with "Docs:" or update documentation files

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DOCUMENTATION REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have 3 undocumented commits.

Consider updating:
  • PROGRESS.md - Current status and features
  • DEVLOG.md - Technical implementation details

Run: npm run doc-sync (auto-generate updates)
Or ask Claude to update documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Pre-Push Hook (Validation)

**File:** `.git/hooks/pre-push`

**What it does:**
- Runs automatically before `git push`
- Checks for undocumented commits
- Prompts for confirmation if documentation is out of date
- Allows you to proceed or cancel the push

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  WARNING: Undocumented Commits Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have 3 undocumented commit(s).

Undocumented commits:
  • a6154bf - Feature: Add pet selector
  • 67043c0 - Fix: Update Firebase rules
  • 1ffd023 - Feature: Add emoji picker

Recommended actions:
  1. Update PROGRESS.md with latest status
  2. Update DEVLOG.md with technical details
  3. Run: npm run doc-sync
  4. Or ask Claude to update documentation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Continue pushing anyway? (y/n):
```

### 3. Documentation Sync Tool

**File:** `scripts/doc-sync.sh`
**Command:** `npm run doc-sync`

**What it does:**
- Lists all undocumented commits
- Shows timestamps and commit messages
- Provides documentation update suggestions
- Clears the tracker once you confirm updates are done

**Usage:**
```bash
npm run doc-sync
```

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Documentation Sync Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found 3 undocumented commit(s)

Undocumented commits:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
a6154bf - Feature: Add pet selector
  Date: 2026-03-15T03:30:00Z
67043c0 - Fix: Update Firebase rules
  Date: 2026-03-15T02:13:06Z
1ffd023 - Feature: Add emoji picker
  Date: 2026-03-15T01:32:11Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Suggested documentation updates:

1. Update PROGRESS.md:
   - Add latest commit summaries to 'Current State Summary'
   - Update 'Last Updated' timestamp
   - Mark completed tasks with ✅

2. Update DEVLOG.md:
   - Add new section for latest work
   - Document technical implementation details
   - Note any issues or learnings

Have you updated the documentation? (y/n):
```

---

## Documentation Files

### PROGRESS.md
**Purpose:** High-level project status and quick reference
**Update Frequency:** After every feature/fix (every 1-3 commits)
**What to include:**
- Current status summary
- Completed features with ✅
- Known issues/limitations
- Next steps
- Last updated timestamp

### DEVLOG.md
**Purpose:** Detailed technical development log
**Update Frequency:** After completing each phase/week
**What to include:**
- Implementation details
- Technical decisions and rationale
- Code patterns used
- Database schema changes
- Build verification results
- Known limitations with technical context

### CLAUDE.md
**Purpose:** AI assistant context and project overview
**Update Frequency:** When major architecture changes or new patterns emerge
**What to include:**
- Project structure changes
- New conventions or patterns
- Updated workflows
- Important notes for future sessions

---

## Workflow

### Typical Development Session

1. **Make code changes** and commit
   ```bash
   git add .
   git commit -m "Feature: Add new component"
   # Post-commit hook tracks this automatically
   ```

2. **After 3 commits**, you'll see a reminder
   ```
   📝 DOCUMENTATION REMINDER
   You have 3 undocumented commits.
   ```

3. **Update documentation** (do this yourself or ask Claude)
   - Update PROGRESS.md with high-level changes
   - Update DEVLOG.md with technical details
   - Run `npm run doc-sync` to review and clear tracker

4. **Commit documentation updates**
   ```bash
   git add PROGRESS.md DEVLOG.md
   git commit -m "Docs: Update progress with latest features"
   # This commit is automatically skipped by the tracker
   ```

5. **Push to remote**
   ```bash
   git push -u origin claude/pet-activity-logger-Etaqb
   # Pre-push hook validates documentation is current
   ```

### Working with Claude

**Option 1: Regular Check-ins**
Every few commits, simply say:
```
"Save progress"
```
Claude will automatically:
- Check git status
- Review recent commits
- Update PROGRESS.md and DEVLOG.md
- Commit and push changes

**Option 2: Manual Sync**
Run the sync tool and update docs yourself:
```bash
npm run doc-sync
# Review undocumented commits
# Update PROGRESS.md and DEVLOG.md manually
# Confirm updates to clear tracker
```

**Option 3: Automated Reminders**
Just code normally - the hooks will remind you when to update docs!

---

## Advanced Configuration

### Adjusting Reminder Frequency

Edit `.git/hooks/post-commit` line 18:
```bash
# Alert after every 3 non-documentation commits
if [ "$COMMIT_COUNT" -ge 3 ]; then
  # Change 3 to your preferred number (e.g., 5, 10)
```

### Disabling Validation (Not Recommended)

To disable pre-push validation:
```bash
rm .git/hooks/pre-push
```

To temporarily bypass:
```bash
git push --no-verify
```

### Skipping Documentation for Small Commits

Start your commit message with "Docs:" or "chore:" to skip tracking:
```bash
git commit -m "chore: Fix typo in README"
git commit -m "Docs: Update PROGRESS.md"
```

---

## Troubleshooting

### "Permission denied" when running hooks

Hooks need execute permissions:
```bash
chmod +x .git/hooks/post-commit
chmod +x .git/hooks/pre-push
chmod +x scripts/doc-sync.sh
```

### Hooks not running

Git hooks are local and not tracked in the repository. If you clone fresh:
```bash
# Hooks are already in .git/hooks/ but may need permissions
chmod +x .git/hooks/*
```

### Want to reset the tracker

```bash
rm .git/undocumented_commits.txt
```

### See what's tracked

```bash
cat .git/undocumented_commits.txt
```

---

## Best Practices

### ✅ DO:
- Update documentation after completing a feature
- Use "Docs:" prefix for documentation-only commits
- Run `npm run doc-sync` regularly to review undocumented work
- Ask Claude to "save progress" every 3-5 commits
- Keep PROGRESS.md concise (status-focused)
- Keep DEVLOG.md detailed (implementation-focused)

### ❌ DON'T:
- Push without updating documentation (pre-push will warn you)
- Let undocumented commits pile up (>5 commits)
- Update docs without clearing the tracker (run `npm run doc-sync`)
- Disable hooks permanently (temporary bypass with `--no-verify` is okay)

---

## Files Reference

| File | Purpose | Editable |
|------|---------|----------|
| `.git/hooks/post-commit` | Track commits automatically | ✅ Yes (adjust frequency) |
| `.git/hooks/pre-push` | Validate before push | ✅ Yes (adjust strictness) |
| `scripts/doc-sync.sh` | Review and clear tracker | ✅ Yes (customize output) |
| `.git/undocumented_commits.txt` | Tracker database | 🔒 Auto-managed |
| `package.json` | npm scripts | ✅ Yes (add aliases) |

---

## Research Sources

This automation system was built based on industry best practices:

- [Git Hooks Complete Guide - DataCamp](https://www.datacamp.com/tutorial/git-hooks-complete-guide)
- [Git Hooks Tutorial - xCloud Host](https://xcloud.host/top-advanced-git-hooks-best-practices/)
- [Conventional Changelog - GitHub](https://github.com/conventional-changelog/conventional-changelog)
- [Auto-Changelog npm package](https://www.npmjs.com/package/auto-changelog)
- [Git Hooks Automation Guide - OneUptime](https://oneuptime.com/blog/post/2026-01-24-git-hooks-automation/view)
- [Git Hooks for Code Quality - DEV Community](https://dev.to/arasosman/git-hooks-for-automated-code-quality-checks-guide-2025-372f)

---

## Future Enhancements (Optional)

### Phase 2: AI-Powered Auto-Documentation
- Use Claude API to auto-generate DEVLOG entries from commits
- Automatically update PROGRESS.md with feature summaries
- Parse conventional commits for structured updates

### Phase 3: GitHub Actions Integration
- Auto-deploy documentation to GitHub Pages
- Generate changelogs on release
- Validate documentation in CI/CD pipeline

### Phase 4: Slack/Discord Notifications
- Send reminders to team channels
- Post documentation updates
- Alert on undocumented pushes

---

## Summary

✅ **Post-Commit Hook** - Tracks every commit automatically
✅ **Pre-Push Hook** - Validates documentation before push
✅ **Doc Sync Tool** - Review and manage undocumented work
✅ **Smart Reminders** - Alerts after 3 commits
✅ **Zero Configuration** - Works out of the box

**The system ensures documentation never falls behind without being intrusive!**

---

**Questions?** Ask Claude in your session or read the [Git Hooks Documentation](https://git-scm.com/docs/githooks).
