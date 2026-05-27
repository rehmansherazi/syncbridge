# claude-context.md

## Last instructions sent to CLI

SEP-00 through SEP-11 complete. Phase 2 fixes complete.
Full details in ROADMAP.md.
- SEP-12: Public GitHub repo
- SEP-13: VS Code Marketplace publish  
- SEP-14: Chrome Web Store submission
- SEP-15: Site adapter resilience
- SEP-16: Additional AI sites (Mistral, Grok, Copilot)
- SEP-17: MCP server
- SEP-18: MCP registry
SEP-12: Create public GitHub repo with description, topics, and verify clean commit history.
Claude Code CLI. Start: claude. Clear between SEPs: /clear

## Last 10 CLI actions

✓ Phase 1 complete — SEP-00 through SEP-11
✓ Phase 2 complete — all polish fixes
✓ SYNCBRIDGE_CONVENTIONS.md created
✓ Context migration includes conventions
✓ ROADMAP.md updated with full SEP index
✓ 13:58:23 wrote claude-state.md

## Resume prompt

Read the above sections. Continue from where we left off.

Do not re-do completed work. Ask for next task if unclear.

## Project conventions

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