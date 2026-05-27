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
c5fabfc fix: add env and principles to conventions, clean state file
3db8b83 fix: include project conventions in context migration
7516522 docs: add SEP index to ROADMAP with completed and remaining SEPs
1fc1c91 docs: mark Phase 2 complete, update shortcuts reference
8bd61d2 feat: first-run onboarding message with action buttons
0fc28d6 fix: setup project command auto-deploys hook and sync command
35720af fix: add clear/reset button for control files in panel
ed50661 fix: project name in panel header, SVG converted to PNG for marketplace
4407d01 fix: hook now shows relative file path instead of unknown
9212e65 docs: add ROADMAP.md with phases 1-5 and commercialization strategy
84942a9 docs: add 13-step flow diagram to README
054770c fix: strip comments from claude-ai.md in context regeneration
089c76f fix: smarter context regeneration, clean control files, complete README
971bcab fix: dynamic root on sendToCLI, remove aggressive auto-inject
b4d3639 fix: publisher name, LICENSE, repository field, set active project command
a47304a docs: keyboard shortcuts reference with change instructions
b0e985d feat: keyboard shortcuts and auto-inject state to AI chat
129cc78 feat: auto-copy AI response on stream complete
4a3df3f docs: complete README with all features and behaviors
c7b33cc SEP-10/11: Chrome extension with universal layer and site adapters
(none — no remote origin configured yet)
* master
c5fabfc fix: add env and principles to conventions, clean state file
3db8b83 fix: include project conventions in context migration
7516522 docs: add SEP index to ROADMAP with completed and remaining SEPs
1fc1c91 docs: mark Phase 2 complete, update shortcuts reference
8bd61d2 feat: first-run onboarding message with action buttons
On branch master — all commits are local, no remote to push to yet

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

## What already exists on disk
- Local git repo: ~/repos/syncbridge — initialized, 20+ commits, master branch
- No remote origin yet — SEP-12 will add GitHub remote and push
- VS Code extension: compiled, packaged as syncbridge-0.0.1.vsix, installed
- Chrome extension: loaded unpacked in Chrome from chrome-extension/
- Three control files: claude-ai.md, claude-state.md, claude-context.md
- Claude Code hook: .claude/settings.json — PostToolUse fires on every Write
- /sync command: .claude/commands/sync.md