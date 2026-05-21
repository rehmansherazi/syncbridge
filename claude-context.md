# claude-context.md

## Project
Syncbridge — VS Code extension + Chrome extension that bridges AI chat and coding CLI.

## VS Code Extension status
Complete. Packaged as syncbridge-0.0.1.vsix. All 9 SEPs done.

## Phase 2 starting
Building Chrome extension with universal layer first, then per-site adapters.
Universal layer: floating bot UI injected into any page, clipboard bridge, WebSocket to VS Code.
Site adapters: one per AI site (claude.ai, ChatGPT, Gemini, Perplexity).

## Chrome extension status
SEP-10 and SEP-11 complete. Floating bot UI working on all four sites.

Verified selectors:
- claude.ai response: div[data-is-streaming="false"], input: div[contenteditable="true"]
- chatgpt.com response: .markdown, input: #prompt-textarea
- gemini.google.com response: .response-content, input: rich-textarea
- www.perplexity.ai response: .prose, input: #ask-input

Both directions working on all sites:
- ↑ Copy AI response → clipboard
- ↓ Inject clipboard → input

## Resume prompt
We are building syncbridge. VS Code extension is complete. Now starting Phase 2: Chrome extension.
Read above sections and continue from where we left off.
