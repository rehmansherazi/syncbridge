# Syncbridge

AI chat to CLI sync bridge for VS Code.

## What it does
Closes the gap between AI chat (claude.ai, ChatGPT, Gemini, Perplexity) and coding CLI tools (Claude Code, Copilot, Continue) by syncing instructions and state via shared markdown files.

## Architecture
- VS Code extension (this) — sidebar panel, file watcher, clipboard bridge
- Chrome extension (Phase 2) — floating bot UI, site adapters for each AI

## VS Code Extension Commands
- `Syncbridge: Open Panel` — open the sync panel
- `Syncbridge: Send Clipboard to CLI` — write clipboard to claude-ai.md

## Claude Code CLI Commands
- `/sync` — read claude-ai.md and execute instructions, then update claude-state.md

## Control Files
- `claude-ai.md` — AI → CLI: instructions from chat to CLI
- `claude-state.md` — CLI → AI: auto-updated by hook after every file write
- `claude-context.md` — Shared: migration prompt for fresh chat sessions

## Phase 2 (in progress)
Chrome extension with:
- Universal layer: floating bot UI, clipboard bridge, works on any AI site
- Site adapters: per-site input/output selectors for claude.ai, ChatGPT, Gemini, Perplexity

## Chrome Extension
Located in chrome-extension/. Load unpacked from chrome://extensions in developer mode.

Features:
- Slim right-edge floating bot — hover to expand, click tab to pin
- Draggable vertically
- Two-way sync buttons on all supported AI sites

Supported sites:
- claude.ai
- chatgpt.com
- gemini.google.com
- www.perplexity.ai

## Development
Built using VS Code Extension API + Claude Code CLI with deterministic SEP-based workflow.
