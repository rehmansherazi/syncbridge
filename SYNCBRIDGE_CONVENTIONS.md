# Syncbridge Project Conventions

## Coding agent
Claude Code CLI is our coding agent.
Start: claude (in ~/repos/syncbridge terminal)
Clear between SEPs: /clear
Execute instructions: /sync

## SEP workflow
- One SEP at a time
- All file edits via Claude Code CLI — not manual
- Every SEP ends with: npm run compile → vsce package → git commit
- Ask before making assumptions

## Stack
- VS Code Extension: TypeScript, src/extension.ts, src/panel.ts
- Chrome Extension: vanilla JS, chrome-extension/src/
- Build: npm run compile
- Package: vsce package
- Install: code --install-extension syncbridge-0.0.1.vsix
- Reload: Developer: Reload Window

## Key shortcuts
- Ctrl+Shift+S: open panel
- Ctrl+Shift+X: send clipboard to CLI
- Ctrl+Shift+A: set active project
- Ctrl+Shift+E: setup project
- Alt+C: copy AI response (Chrome)
- Alt+V: inject to input (Chrome)

## Environment
- OS: Ubuntu 24 (T14)
- Node: v22.22.1
- npm: 9.2.0
- VS Code: 1.118.1
- Repo: ~/repos/syncbridge
- Branch: master
- Extension ID: rehman.syncbridge

## Project operating principles
- One SEP at a time — scoped, tested, committed
- Deterministic logic only — no randomness, no implicit timestamps
- Immutable transformations — no hidden side effects
- Stable ordering — lexical, sorted, consistent
- Test-first validation — all SEPs include deterministic tests
- Additive evolution — extend, never rewrite completed work
- Replay-safe execution — same input always produces same output
- Minimal complexity — simple composable primitives over abstraction
- README updated with every commit

## What already exists on disk (project-specific — update per project)
Check before assuming anything needs to be created:
- git status — is there a local repo?
- git remote -v — is there a remote already?
- ls .claude/ — is the hook already deployed?
- gh repo view — does a GitHub remote exist?

## What goes where
- Claude Code CLI: file edits, code changes, compile, package, git add, git commit
- Bash terminal: gh commands, git push, git pull, npm install -g, system operations, vsce package, code --install-extension
- VS Code window: F5 debug, Ctrl+Shift+P commands, extension install, panel UI
- Chrome browser: extension reload, Alt+C, Alt+V shortcuts

Claude Code CLI is a coding agent — not a shell runner.
Never ask it to create GitHub repos, push to remotes, or run system-level commands.
Always verify what already exists before instructing creation of anything.

## Model strategy
Default: Sonnet. Use /model opusplan only for complex 
architecture decisions or large cross-cutting refactors.

## SEP Quality Gate Policy

Every SEP implementation must include verification before committing.
Claude Code CLI must run all checks and report results before git commit.

### Required checks for every SEP:

1. Compile — npm run compile must produce zero errors and zero warnings
2. Smoke tests — verify the new feature works end-to-end
3. Regression tests — verify existing features still work
4. Edge cases — handle empty/missing/invalid states gracefully
5. Self-review — read implemented code and flag anything suspicious

### Commit only when:
- All compile checks pass
- All smoke tests pass
- All regression tests pass
- Edge cases handled
- No TODOs or placeholders left in code

### Report format before every commit:
| Check | Result | Notes |
|-------|--------|-------|
| Compile | ✓/✗ | |
| Smoke tests | ✓/✗ | |
| Regression | ✓/✗ | |
| Edge cases | ✓/✗ | |
| Self-review | ✓/✗ | |

If any check fails — fix first, then rerun all checks before committing.

## Doc Update Principle

Every SEP completion must include before final commit:
- README.md updated with new features or changes
- CHANGELOG.md entry added
- ROADMAP.md status updated to reflect completion
- Inline code comments added or updated for all changed functions

No SEP is complete until all four doc files are updated.
This is part of the SEP Quality Gate — same weight as compile and smoke tests.

## High-Stakes Decision Policy

Any action affecting published extensions, developer accounts, platform submissions,
permissions, manifests, or any deletion/removal is considered high-stakes.

### Rules for high-stakes decisions:

1. Research first — no implementation prompt until fully verified
2. Claude must provide before any recommendation:
   - Confidence level: High / Medium / Low
   - Source: exact URL or official documentation link
   - Key quote: exact text that confirms the recommendation
3. Two-stage approach — always separate:
   - Stage 1: Research only — findings reported, no action suggested
   - Stage 2: Recommendation — only after Stage 1 reviewed and approved
   - Stage 3: Implementation — only after Stage 2 explicitly approved
4. "Stop. Verify first." — if Rahman says this, Claude stops immediately,
   completes full verification, and states confidence before proceeding
5. Devil's advocate check — before any removal or deletion, Claude must state
   the strongest argument AGAINST the recommendation
6. Never research AND implement in the same prompt for high-stakes decisions
7. If contradicting evidence is found during research, stop and report it
   before suggesting any action — do not proceed past the contradiction

### Trigger phrases that activate this policy:
- "Stop. Verify first."
- "This affects my [account/listing/package]"
- "High stakes"
- "Are you sure?"
- "Review Chrome/npm/Marketplace policies first"

### What this policy protects:
- Chrome Web Store developer account
- VS Code Marketplace publisher account
- npm published packages
- GitHub repository integrity
- MCP registry submissions
- Any manifest.json or permissions changes