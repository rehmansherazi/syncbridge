# Syncbridge Roadmap

## Phase 1 — Complete ✓
Core sync bridge between AI chat and Claude Code CLI.

- VS Code extension with sidebar panel
- Chrome extension for claude.ai, ChatGPT, Gemini, Perplexity
- Three control files: claude-ai.md, claude-state.md, claude-context.md
- Auto-copy on AI response complete
- Keyboard shortcuts both sides
- Set active project command
- Claude Code hook (PostToolUse auto-updates state)
- /sync slash command
- Context migration (Regenerate context.md)
- 7 deterministic tests passing
- Full documentation + flow diagram

## Phase 2 — Complete ✓ (Polish + Open Source)
- ✓ Fix hook path variable (now shows relative filename)
- ✓ Show active project name in panel header
- ✓ Add clear/reset button for control files in panel
- ✓ Auto-deploy hook to new projects via Ctrl+Shift+E (Syncbridge: Setup Project)
- ✓ First-run onboarding message with action buttons
- ✗ Public GitHub repo — next
- ✗ Launch post on dev.to / Reddit r/ClaudeAI — next

## Phase 3 — Complete ✓ (Publication)
- ✓ SEP-12: Public GitHub repo — description, topics, clean history review
- ✓ SEP-13: Publish VS Code extension to Marketplace (vsce publish)
- ✓ SEP-14: Package and submit Chrome extension to Chrome Web Store
- ✓ SEP-15: Site adapter resilience — fallback selectors when AI sites change DOM
- ✓ SEP-16: Additional AI sites — Mistral, Grok, Microsoft Copilot
- ✓ SEP-19: Standalone mode — extension works without active workspace
- ✓ SEP-21: Toolbar popup + removable widget — pin/unpin bot UI, toolbar action
- ✓ SEP-22: Debug cleanup, VS Code v0.0.9 published to Marketplace
- ✓ SEP-23: CLI-agnostic activeCli setting — adapts control files per active CLI

## Phase 4 — MCP Server (Open Source)
Convert syncbridge into a first-class Claude Code MCP integration.

- ✓ SEP-17: MCP server — exposes update_state, read_instructions, get_context, clear_state as MCP tools
- ✓ SEP-18: MCP registry — syncbridge-mcp published to npm + server.json submitted to official MCP registry
- ✓ SEP-20: Claude Code usage display in Syncbridge status bar — reads ~/.claude/projects/ JSONL, shows today's tokens and cost
  - Display live in Syncbridge status bar item alongside sync indicator
  - Auto-refresh every 30 seconds
  - No external tools or separate extensions required
  - Clicking the status bar item opens a usage summary in the panel
- Claude Code connects via: claude mcp add syncbridge npx syncbridge-mcp
- Eliminates file polling — pure event-driven tool calls

## Completed SEPs
| SEP | Phase | What was built |
|---|---|---|
| SEP-00 | 1 | Environment setup |
| SEP-01 | 1 | Control files + status bar |
| SEP-02 | 1 | File watcher → status bar updates |
| SEP-03 | 1 | Sidebar panel UI |
| SEP-04 | 1 | Copy buttons → clipboard |
| SEP-05 | 1 | Clipboard → claude-ai.md |
| SEP-06 | 1 | /sync slash command |
| SEP-07 | 1 | Regenerate context.md button |
| SEP-08 | 1 | Claude Code PostToolUse hook |
| SEP-09 | 1 | Package as .vsix |
| SEP-10 | 1 | Chrome extension — universal layer + 4 site adapters |
| SEP-11 | 1 | Chrome ext UX — draggable, hover panel, sync icon, auto-copy |
| Phase 2 fixes | 2 | Hook relative path, panel header, clear button, setup command, onboarding |
| SEP-12–16 | 3 | Public repo, Marketplace publish, Chrome Store, adapter resilience, new AI sites |
| SEP-17 | 4 | MCP server — update_state, read_instructions, get_context, clear_state |
| SEP-18 | 4 | MCP registry — npm publish + official registry server.json |
| SEP-19 | 3 | Standalone mode |
| SEP-20 | 4 | Claude Code usage display in status bar |
| SEP-21 | 3 | Toolbar popup + removable widget |
| SEP-22 | 3 | Debug cleanup, VS Code v0.0.9 |
| SEP-23 | 3 | CLI-agnostic activeCli setting |

## Phase 5 — Pro Tier (If Traction)
Team collaboration features — only if community adoption justifies it.

- Team sync: shared claude-state.md across multiple developers
- History and replay: full audit trail of AI→CLI interactions
- Multi-project dashboard
- Project-aware context.md (reads project name from package.json / pyproject.toml)
- Pricing page + Stripe integration

## Commercial Strategy
Open source throughout all phases.
MCP server strengthens showcase value without requiring commercialization.
Pro tier only if organic traction justifies infrastructure investment.
Anthropic hackathon: submit as side entry if timing aligns — work is already done.

## Positioning
- Personal: saves hours of copy-paste switching daily
- Portfolio: VS Code + Chrome + CLI multi-surface architecture
- Community: first open source bridge between AI chat and coding CLI
- Ecosystem: Phase 4 MCP positions as native Claude Code integration
