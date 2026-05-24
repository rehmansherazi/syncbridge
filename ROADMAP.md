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

## Phase 3 — Publication
- Publish VS Code extension to Marketplace
- Package and publish Chrome extension to Chrome Web Store
- Site adapter auto-update mechanism (when AI sites change DOM)
- Support additional AI sites (Mistral, Grok, Copilot)

## Phase 4 — MCP Server (Open Source)
Convert syncbridge into a first-class Claude Code MCP integration.

- Expose MCP tools: update_state, read_instructions, get_context, clear_state
- Claude Code connects via: claude mcp add syncbridge
- Eliminates file polling — pure event-driven tool calls
- List in Anthropic community MCP registry
- Positions project as a native Claude ecosystem tool

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
