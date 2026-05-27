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

✓ Read claude-ai.md — contains workflow explanation (no actionable instructions to execute)
✓ No code changes made — file describes SyncBridge usage pattern, not a task
✓ 18:22:21 wrote unknown
✓ 18:43:25 wrote unknown
✓ 20:46:26 wrote unknown
✓ 21:36:19 wrote /home/rehman/repos/syncbridge/hook-path-test.txt
✓ 21:38:20 wrote hook-path-test2.txt
✓ 18:57:01 wrote claude-context.md
✓ 19:22:04 wrote SYNCBRIDGE_CONVENTIONS.md
✓ 09:37:44 wrote claude-ai.md

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