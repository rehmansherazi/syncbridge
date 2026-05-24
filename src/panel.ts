import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class SyncBridgePanel {
    public static currentPanel: SyncBridgePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _root: string;

    private constructor(panel: vscode.WebviewPanel, root: string) {
        this._panel = panel;
        this._root = root;
        this._update();

        this._panel.webview.onDidReceiveMessage((msg) => {
            if (msg.command === 'regen') {
                const ai    = this._read('claude-ai.md');
                const state = this._read('claude-state.md');

                const stateLines = state
                    .split('\n')
                    .filter(l => l.startsWith('✓'))
                    .slice(-10)
                    .join('\n');

                const context = [
                    '# claude-context.md',
                    '## Last instructions sent to CLI',
                    ai.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('<!--')).join('\n').trim() || '(none)',
                    '## Last 10 CLI actions',
                    stateLines || '(none)',
                    '## Resume prompt',
                    'Read the above sections. Continue from where we left off.',
                    'Do not re-do completed work. Ask for next task if unclear.',
                ].join('\n\n');

                const fp = path.join(this._root, 'claude-context.md');
                fs.writeFileSync(fp, context, 'utf8');
                vscode.window.showInformationMessage('Syncbridge: claude-context.md regenerated.');
                this._update();
            }
            if (msg.command === 'clear') {
                const files = ['claude-ai.md', 'claude-state.md'];
                for (const f of files) {
                    const fp = path.join(this._root, f);
                    fs.writeFileSync(fp, `# ${f}\n<!-- reset -->\n`, 'utf8');
                }
                vscode.window.showInformationMessage('Syncbridge: control files cleared.');
                this._update();
            }
            if (msg.command === 'copy') {
                const fileMap: Record<string, string> = {
                    'ai':    'claude-ai.md',
                    'state': 'claude-state.md',
                    'ctx':   'claude-context.md'
                };
                const filename = fileMap[msg.file];
                if (filename) {
                    const content = this._read(filename);
                    vscode.env.clipboard.writeText(content).then(() => {
                        vscode.window.showInformationMessage(`Copied ${filename} to clipboard.`);
                    });
                }
            }
        });

        this._panel.onDidDispose(() => {
            SyncBridgePanel.currentPanel = undefined;
        });
    }

    public static show(root: string): void {
        if (SyncBridgePanel.currentPanel) {
            SyncBridgePanel.currentPanel._panel.reveal();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'syncbridge',
            'Syncbridge',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        SyncBridgePanel.currentPanel = new SyncBridgePanel(panel, root);
    }

    public refresh(): void {
        this._update();
    }

    private _read(filename: string): string {
        const fp = path.join(this._root, filename);
        return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : '(empty)';
    }

    private _update(): void {
        const ai    = this._read('claude-ai.md');
        const state = this._read('claude-state.md');
        const ctx   = this._read('claude-context.md');

        this._panel.webview.html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: var(--vscode-font-family); font-size: 13px; padding: 12px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
  h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--vscode-descriptionForeground); margin: 16px 0 4px; }
  pre { background: var(--vscode-textBlockQuote-background); padding: 8px; border-radius: 4px; white-space: pre-wrap; word-break: break-word; font-size: 12px; }
  button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 4px 4px 0 0; font-size: 12px; }
  button:hover { background: var(--vscode-button-hoverBackground); }
  #sb-project {
    font-size: 12px;
    font-weight: 500;
    color: var(--vscode-foreground);
    background: var(--vscode-textBlockQuote-background);
    padding: 6px 10px;
    border-radius: 4px;
    margin-bottom: 12px;
  }
</style>
</head>
<body>
  <div id="sb-project">
    <span>📁 ${path.basename(this._root)}</span>
  </div>
  <h3>claude-ai.md → CLI</h3>
  <pre>${ai}</pre>
  <button onclick="copy('ai')">Copy</button>

  <h3>claude-state.md ← CLI</h3>
  <pre>${state}</pre>
  <button onclick="copy('state')">Copy</button>

  <h3>claude-context.md shared</h3>
  <pre>${ctx}</pre>
  <button onclick="copy('ctx')">Copy</button>

  <h3>Actions</h3>
  <button onclick="regen()">⟳ Regenerate context.md</button>

  <h3>Danger Zone</h3>
  <button onclick="clearFiles()" id="sb-clear" style="background: var(--vscode-inputValidation-errorBackground); border-color: var(--vscode-inputValidation-errorBorder);">⚠ Clear all control files</button>

  <script>
    const vscode = acquireVsCodeApi();
    function copy(file) {
      vscode.postMessage({ command: 'copy', file });
    }
    function regen() {
      vscode.postMessage({ command: 'regen' });
    }
    function clearFiles() {
      if (confirm('Reset claude-ai.md and claude-state.md to empty? This cannot be undone.')) {
        vscode.postMessage({ command: 'clear' });
      }
    }
  </script>
</body>
</html>`;
    }
}
