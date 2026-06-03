# Changelog

## [0.0.6] - 2026-06-03
### Fixed
- Panel now reads correct active project on open after Ctrl+Shift+A when panel was closed
- Panel root syncs immediately when reopening an already-open panel after project switch

## [0.0.5] - 2026-06-03
### Fixed
- Panel now updates immediately when active project changed via Ctrl+Shift+A (no reload needed)
- setupProject hook now also captures Bash commands in claude-state.md (not just file writes)

## [0.0.4] - 2026-06-03
### Improved
- Panel file labels renamed to be more descriptive
  (AI Instructions, CLI State, Context instead of cryptic arrows)

## [0.0.3] - 2026-06-02
### Fixed
- Removed noise files from vsix package (chrome extension zip, mcp-server, .github workflows)
- Package size reduced from 37 KB to 21 KB

## [0.0.2] - 2026-06-02
### Added
- Claude Code usage display in status bar — shows today's token count and estimated cost
- Standalone mode — detects Claude Code CLI presence, shows connection status banner in panel
- Click status bar to open claude.ai usage page

### Fixed
- Publisher ID corrected to rehmansherazi
- Repository URL updated

## [0.0.1] - 2026-05-28
### Added
- VS Code panel with project context, AI response display, and control buttons
- Send clipboard contents to Claude Code CLI via keyboard shortcut
- File watcher hook for automatic context sync on save
- First-run onboarding message with action buttons
- Chrome extension with site adapters for Claude.ai, ChatGPT, Gemini
- Alt+C to copy AI response, Alt+V to inject context into chat input
- Keyboard shortcuts: Ctrl+Shift+S, Ctrl+Shift+X, Ctrl+Shift+A, Ctrl+Shift+E
- Status bar integration with active project display
