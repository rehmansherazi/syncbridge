import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface CliConfig {
  instructionsFile: string;
  stateFile: string;
  contextFile: string;
  displayName: string;
  hasAutoSync: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class SyncBridgePanel {
    public static currentPanel: SyncBridgePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _root: string;
    private _cliAvailable: boolean;
    private _cliConfig: CliConfig;

    private constructor(panel: vscode.WebviewPanel, root: string, cliAvailable: boolean, cliConfig: CliConfig) {
        this._panel = panel;
        this._root = root;
        this._cliAvailable = cliAvailable;
        this._cliConfig = cliConfig;
        this._update();

        this._panel.webview.onDidReceiveMessage((msg) => {
            if (msg.command === 'regen') {
                const ai    = this._read(this._cliConfig.instructionsFile);
                const state = this._read(this._cliConfig.stateFile);

                const stateLines = state
                    .split('\n')
                    .filter(l => l.startsWith('✓'))
                    .slice(-10)
                    .join('\n');

                const conventions = this._read('SYNCBRIDGE_CONVENTIONS.md');
                const context = [
                    `# ${this._cliConfig.contextFile}`,
                    '## Last instructions sent to CLI',
                    ai.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('<!--')).join('\n').trim() || '(none)',
                    '## Last 10 CLI actions',
                    stateLines || '(none)',
                    '## Resume prompt',
                    'Read the above sections. Continue from where we left off.',
                    'Do not re-do completed work. Ask for next task if unclear.',
                    '## Project conventions',
                    conventions.trim() || '(none)',
                ].join('\n\n');

                const fp = path.join(this._root, this._cliConfig.contextFile);
                try {
                    fs.writeFileSync(fp, context, 'utf8');
                    vscode.window.showInformationMessage(`Syncbridge: ${this._cliConfig.contextFile} regenerated.`);
                } catch (e) {
                    vscode.window.showErrorMessage('Syncbridge: Could not write context file. Check folder permissions.');
                }
                this._update();
            }
            if (msg.command === 'clear') {
                const files = [this._cliConfig.instructionsFile, this._cliConfig.stateFile];
                for (const f of files) {
                    const fp = path.join(this._root, f);
                    fs.writeFileSync(fp, `# ${f}\n<!-- reset -->\n`, 'utf8');
                }
                vscode.window.showInformationMessage('Syncbridge: control files cleared.');
                this._update();
            }
            if (msg.command === 'copy') {
                const fileMap: Record<string, string> = {
                    'ai':    this._cliConfig.instructionsFile,
                    'state': this._cliConfig.stateFile,
                    'ctx':   this._cliConfig.contextFile
                };
                const filename = fileMap[msg.file];
                if (filename) {
                    const content = this._read(filename);
                    Promise.resolve(vscode.env.clipboard.writeText(content))
                        .then(() => {
                            vscode.window.showInformationMessage(`Copied ${filename} to clipboard.`);
                        })
                        .catch(() => vscode.window.showErrorMessage('Syncbridge: Could not copy to clipboard.'));
                }
            }
        });

        this._panel.onDidDispose(() => {
            SyncBridgePanel.currentPanel = undefined;
        });
    }

    public static createOrShow(root: string, cliAvailable: boolean, cliConfig: CliConfig): void {
        if (SyncBridgePanel.currentPanel) {
            SyncBridgePanel.currentPanel._panel.reveal();
            SyncBridgePanel.currentPanel.updateRoot(root);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'syncbridge',
            'Syncbridge',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        SyncBridgePanel.currentPanel = new SyncBridgePanel(panel, root, cliAvailable, cliConfig);
    }

    public refresh(): void {
        this._update();
    }

    public updateRoot(newRoot: string): void {
        this._root = newRoot;
        this._update();
    }

    public updateCliConfig(config: CliConfig): void {
        this._cliConfig = config;
        this._update();
    }

    private _read(filename: string): string {
        const fp = path.join(this._root, filename);
        return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : '(empty)';
    }

    private _update(): void {
        this._panel.webview.html = this.getWebviewContent(this._panel.webview);
    }

    private getWebviewContent(webview: vscode.Webview): string {
        const ai    = this._read(this._cliConfig.instructionsFile);
        const state = this._read(this._cliConfig.stateFile);
        const ctx   = this._read(this._cliConfig.contextFile);
        const cliBanner = this._cliAvailable
            ? `<div class="banner banner-ok">● Claude Code CLI connected — full sync active</div>`
            : `<div class="banner banner-warn">⚠ Claude Code CLI not detected — clipboard bridge active, auto-sync disabled</div>`;
        const syncBanner = this._cliConfig.hasAutoSync
            ? ''
            : `<div class="banner banner-warn">⚠ ${escapeHtml(this._cliConfig.displayName)} — auto-sync not available. Edit state file manually.</div>`;

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline';">
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
  .banner { padding: 6px 12px; border-radius: 4px; font-size: 12px; margin-bottom: 12px; }
  .banner-ok { background: #1a3a1a; color: #4ec94e; border: 1px solid #2d5a2d; }
  .banner-warn { background: #3a2a1a; color: #d4a017; border: 1px solid #5a3d1a; }
</style>
</head>
<body>
  <div id="sb-project">
    <span>📁 ${escapeHtml(path.basename(this._root))}</span>
  </div>
  ${cliBanner}
  ${syncBanner}
  <h3>AI Instructions (${escapeHtml(this._cliConfig.instructionsFile.toUpperCase())})</h3>
  <pre>${escapeHtml(ai)}</pre>
  <button onclick="copy('ai')">Copy</button>

  <h3>CLI State (${escapeHtml(this._cliConfig.stateFile.toUpperCase())})</h3>
  <pre>${escapeHtml(state)}</pre>
  <button onclick="copy('state')">Copy</button>

  <h3>Context (${escapeHtml(this._cliConfig.contextFile.toUpperCase())})</h3>
  <pre>${escapeHtml(ctx)}</pre>
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
      if (confirm('Reset ${this._cliConfig.instructionsFile.replace(/'/g, "\\'")} and ${this._cliConfig.stateFile.replace(/'/g, "\\'")} to empty? This cannot be undone.')) {
        vscode.postMessage({ command: 'clear' });
      }
    }
  </script>
</body>
</html>`;
    }
}
