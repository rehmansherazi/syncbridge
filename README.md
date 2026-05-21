# Syncbridge

AI chat to CLI sync bridge for VS Code.

## What it does
Closes the gap between AI chat (claude.ai, ChatGPT, Gemini, Perplexity) and coding CLI tools (Claude Code, Copilot, Continue) by syncing instructions and state via shared markdown files.

## Architecture
- VS Code extension (this) — sidebar panel, file watcher, status bar, clipboard bridge
- Chrome extension — floating bot UI, site adapters for each AI

## VS Code Extension Commands
- `Syncbridge: Open Panel` — open the sync panel in column two
- `Syncbridge: Send Clipboard to CLI` — overwrite `claude-ai.md` with current clipboard content

## Panel UI
Opens in VS Code's second column. Displays the live contents of all three control files with:
- **Copy button** per file — copies that file's content to clipboard
- **⟳ Regenerate context.md** button — rebuilds `claude-context.md` from the current contents of `claude-ai.md` and `claude-state.md`, including a resume prompt

The panel auto-refreshes whenever `claude-state.md` changes on disk.

## Status Bar
A persistent `$(sync) Syncbridge` item appears in the left status bar when the extension activates. When `claude-state.md` changes, the status bar updates to show the last non-blank line of the file (truncated to 40 chars). Hovering shows the full file content as a tooltip.

## File Watcher
The extension watches `claude-state.md` in the active workspace root. Any write to that file simultaneously updates the status bar and refreshes the panel — no manual reload needed.

## Claude Code CLI Commands
- `/sync` — read `claude-ai.md` and execute the instructions inside it, then update `claude-state.md` with a `✓`-prefixed summary of every action taken

## Claude Code Hook
A `PostToolUse` hook fires after every `Write` tool call in Claude Code. It appends a timestamped line to `claude-state.md`:

```
✓ HH:MM:SS wrote <file_path>
```

Hook lives in `.claude/settings.json` at the project root. It runs automatically — no manual setup needed beyond opening the project in Claude Code.

## Control Files
All three files are created automatically in the workspace root on first activation if they don't exist.

| File | Direction | Purpose |
|---|---|---|
| `claude-ai.md` | AI → CLI | Paste instructions from chat here; `/sync` reads and executes them |
| `claude-state.md` | CLI → AI | Auto-updated by the hook after every file write; copy into chat to resume |
| `claude-context.md` | Shared | Migration prompt for fresh chat sessions; use "Regenerate" button to rebuild |

## Multi-Folder Workspace Behavior
When the workspace has multiple root folders, the extension resolves the active root in priority order:
1. The folder containing the **currently open file** in the editor
2. The folder whose name appears in the **active terminal's** title
3. **First folder** in the workspace list as a fallback

All control files are read from and written to that resolved root. Switching active editor or terminal automatically shifts the target folder on next command invocation.

## Phase 2 (in progress)
Chrome extension with:
- Universal layer: floating bot UI, clipboard bridge, works on any AI site
- Site adapters: per-site input/output selectors for claude.ai, ChatGPT, Gemini, Perplexity

## Chrome Extension
Located in `chrome-extension/`. Load unpacked from `chrome://extensions` in developer mode.

Features:
- Slim right-edge floating bot — hover to expand, click tab to pin open
- Draggable vertically along the right edge
- Two-way sync buttons on all supported AI sites
- Site adapters with per-site CSS selectors for reading output and injecting input

Supported sites:
- claude.ai
- chatgpt.com
- gemini.google.com
- www.perplexity.ai

## Keyboard Shortcuts
No default keybindings are registered. Commands can be bound manually via **Preferences → Keyboard Shortcuts** (`syncbridge.openPanel`, `syncbridge.sendToCLI`).

## Development
Built using VS Code Extension API + Claude Code CLI with deterministic SEP-based workflow.
