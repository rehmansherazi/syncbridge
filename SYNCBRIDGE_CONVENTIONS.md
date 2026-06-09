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

---

## Runtime Testing Policy

Code inspection alone is insufficient. Every Quality Gate must include actual runtime verification.

### Required runtime tests before every commit:
1. Every button in the panel must be physically clicked and verified working
2. Every keyboard shortcut must be tested on the target platform
3. Every command in the Command Palette must be invoked and verified
4. File operations must be verified by checking actual file contents after operation
5. Error paths must be triggered and verified to show correct user-facing messages

### Platforms that must be tested before publishing:
- Linux (Ubuntu) — primary development platform
- Mac — required before any Marketplace publish
- Windows — required before any major version publish

### Minimum test matrix per release:
| Feature | Linux | Mac | Windows |
|---------|-------|-----|---------|
| Extension activates | ✓ | ✓ | ✓ |
| All panel buttons work | ✓ | ✓ | ✓ |
| All keyboard shortcuts work | ✓ | ✓ | ✓ |
| File watcher fires | ✓ | ✓ | skip |
| Hook deploys correctly | ✓ | ✓ | skip |

"Skip" means known limitation documented — not untested.

---

## Webview API Compatibility Policy

VS Code webviews run in sandboxed iframes. Not all browser APIs work.

### Blocked in VS Code webview sandbox — never use:
- confirm() — blocked, sandbox does not set allow-modals
- alert() — blocked, same reason
- prompt() — blocked, same reason
- window.open() — blocked
- localStorage / sessionStorage — blocked
- navigator.clipboard — blocked (use vscode.env.clipboard via postMessage instead)

### Correct pattern for user confirmation in webview:
- Webview sends a request message to extension: vscode.postMessage({ command: 'xyzRequest' })
- Extension handles it with vscode.window.showWarningMessage({ modal: true })
- Extension sends result back to webview if needed via panel.webview.postMessage()

### Before using any browser API in webview HTML:
- Verify it works in sandboxed iframe context
- Check VS Code webview documentation explicitly
- If in doubt — handle it in the extension side, not the webview

---

## Security Change Policy

Any change touching security mechanisms requires the full High-Stakes Decision Policy plus:

1. Research the correct implementation from official documentation first
2. State confidence level + source + key quote before implementing
3. Test the security change actually works — do not assume compile = working
4. Devil's advocate: what could this security change break?
5. Runtime verify security change does not block legitimate functionality

### Triggers for Security Change Policy:
- Content Security Policy (CSP) changes
- Permission changes in manifest files
- Authentication or authorization logic
- Data sanitization or escaping functions
- Clipboard, storage, or file access patterns
- Any change to webview sandbox settings