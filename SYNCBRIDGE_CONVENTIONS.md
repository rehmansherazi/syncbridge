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