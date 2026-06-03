import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SyncBridgePanel } from './panel';

function isClaudeCliInstalled(): boolean {
  try {
    const result = require('child_process').spawnSync('claude', ['--version'], {
      encoding: 'utf8',
      timeout: 3000,
      shell: true
    });
    return result.status === 0;
  } catch (e) {
    return false;
  }
}

function readClaudeUsage(): { tokens: number; costUsd: number } | null {
  try {
    const os = require('os');
    const projectsDir = path.join(os.homedir(), '.claude', 'projects');
    if (!fs.existsSync(projectsDir)) return null;

    const dirs = fs.readdirSync(projectsDir);
    let totalTokens = 0;
    let totalCost = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const dir of dirs) {
      const dirPath = path.join(projectsDir, dir);
      const stat = fs.statSync(dirPath);
      if (!stat.isDirectory()) continue;

      const files = fs.readdirSync(dirPath).filter((f: string) => f.endsWith('.jsonl'));
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            const ts = entry.timestamp || entry.message?.timestamp;
            const entryDate = ts
              ? new Date(ts).toISOString().slice(0, 10)
              : null;
            if (!entryDate || entryDate !== today) continue;
            const usage = entry.usage || entry.message?.usage;
            if (usage) {
              totalTokens += (usage.input_tokens || 0) + (usage.output_tokens || 0);
            }
            const cost = entry.costUSD || entry.message?.costUSD;
            if (cost) {
              totalCost += cost;
            }
          } catch (e) {}
        }
      }
    }

    if (totalTokens === 0) return null;
    const estimatedCost = totalCost > 0 ? totalCost : (totalTokens * 0.000003);
    return { tokens: totalTokens, costUsd: estimatedCost };
  } catch (e) {
    return null;
  }
}

function formatUsage(usage: { tokens: number; costUsd: number } | null): string {
  if (!usage) return '';
  const k = usage.tokens >= 1000 ? `${(usage.tokens / 1000).toFixed(1)}k` : `${usage.tokens}`;
  const cost = `$${usage.costUsd.toFixed(3)}`;
  return ` · ${k} tok - ${cost} · click for limits`;
}

function getWorkspaceRoot(context: vscode.ExtensionContext): string | null {
    const pinned = context.globalState.get<string>('syncbridge.root');
    if (pinned) return pinned;

    const folders = vscode.workspace.workspaceFolders;
    if (!folders) return null;

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const activeFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
        if (activeFolder) return activeFolder.uri.fsPath;
    }

    return folders[0].uri.fsPath;
}

function initControlFiles(root: string): void {
    const files: Record<string, string> = {
        'claude-ai.md':      '# claude-ai.md\n<!-- AI → CLI: paste instructions here -->\n',
        'claude-state.md':   '# claude-state.md\n<!-- CLI → AI: Claude Code writes status here -->\n',
        'claude-context.md': '# claude-context.md\n<!-- Shared: migration prompt lives here -->\n'
    };

    for (const [filename, content] of Object.entries(files)) {
        const filepath = path.join(root, filename);
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, content, 'utf8');
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('activate() called');

    let root = getWorkspaceRoot(context);

    if (!root) {
        vscode.window.showWarningMessage('Syncbridge: no workspace folder open.');
        return;
    }

    initControlFiles(root);

    const cliAvailable = isClaudeCliInstalled();
    context.globalState.update('syncbridge.cliAvailable', cliAvailable);

    const isFirstRun = !context.globalState.get('syncbridge.welcomed');
    if (isFirstRun) {
        context.globalState.update('syncbridge.welcomed', true);
        vscode.window.showInformationMessage(
            'Welcome to Syncbridge! Bridge your AI chat and Claude Code CLI.',
            'Open Panel',
            'Setup This Project',
            'View Docs'
        ).then(choice => {
            if (choice === 'Open Panel') {
                vscode.commands.executeCommand('syncbridge.openPanel');
            } else if (choice === 'Setup This Project') {
                vscode.commands.executeCommand('syncbridge.setupProject');
            } else if (choice === 'View Docs') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/rehman/syncbridge#readme'));
            }
        });
    }

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = '$(sync) Syncbridge';
    statusBar.tooltip = 'AI ↔ CLI sync bridge is active';
    statusBar.command = 'syncbridge.openUsage';
    statusBar.show();

    const updateStatusBar = () => {
      const usage = readClaudeUsage();
      const usageSuffix = formatUsage(usage);
      const base = statusBar.text.split(' · ')[0];
      statusBar.text = base + usageSuffix;
      if (usage) {
        statusBar.tooltip = `AI ↔ CLI sync bridge active\nToday: ${usage.tokens.toLocaleString()} tokens · $${usage.costUsd.toFixed(4)}`;
      }
    };

    updateStatusBar();
    const usageInterval = setInterval(updateStatusBar, 30000);
    context.subscriptions.push({ dispose: () => clearInterval(usageInterval) });

    let watcher = vscode.workspace.createFileSystemWatcher(
        path.join(root, 'claude-state.md')
    );

    function onStateChange() {
        const stateFile = path.join(root!, 'claude-state.md');
        const content = fs.existsSync(stateFile)
            ? fs.readFileSync(stateFile, 'utf8')
            : '';
        const lines = content.split('\n').filter((l: string) => l.trim() && !l.startsWith('#') && !l.startsWith('<!--'));
        const last = lines[lines.length - 1] ?? 'idle';
        statusBar.text = `$(sync) ${last.slice(0, 40)}`;
        statusBar.tooltip = content;
        updateStatusBar();
        SyncBridgePanel.currentPanel?.refresh();
    }

    function recreateWatcher(newRoot: string) {
        watcher.dispose();
        watcher = vscode.workspace.createFileSystemWatcher(
            path.join(newRoot, 'claude-state.md')
        );
        watcher.onDidChange(onStateChange);
        watcher.onDidCreate(onStateChange);
    }

    watcher.onDidChange(onStateChange);
    watcher.onDidCreate(onStateChange);

    const openPanel = vscode.commands.registerCommand('syncbridge.openPanel', () => {
        const latestRoot = context.globalState.get<string>('syncbridge.root') || root;
        if (!latestRoot) { vscode.window.showWarningMessage('Syncbridge: no active project set.'); return; }
        SyncBridgePanel.createOrShow(latestRoot, cliAvailable);
    });

    const sendToCLI = vscode.commands.registerCommand('syncbridge.sendToCLI', async () => {
        const root = getWorkspaceRoot(context);
        if (!root) {
            vscode.window.showWarningMessage('Syncbridge: no active project set.');
            return;
        }
        const content = await vscode.env.clipboard.readText();
        if (!content.trim()) {
            vscode.window.showWarningMessage('Syncbridge: clipboard is empty.');
            return;
        }
        const filepath = path.join(root, 'claude-ai.md');
        fs.writeFileSync(filepath, content, 'utf8');
        vscode.window.showInformationMessage(`Syncbridge: claude-ai.md updated in ${path.basename(root)}`);
        if (!isClaudeCliInstalled()) {
            vscode.window.showInformationMessage(
                'Claude Code CLI not detected. claude-ai.md written — use it manually or install Claude Code CLI for auto-sync.'
            );
        }
        SyncBridgePanel.currentPanel?.refresh();
    });

    const setRoot = vscode.commands.registerCommand('syncbridge.setRoot', async () => {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            vscode.window.showWarningMessage('Syncbridge: no workspace folders open.');
            return;
        }
        const items = folders.map(f => ({
            label: path.basename(f.uri.fsPath),
            description: f.uri.fsPath,
            folder: f
        }));
        const picked = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select active project for Syncbridge'
        });
        if (!picked) return;
        context.globalState.update('syncbridge.root', picked.folder.uri.fsPath);
        vscode.window.showInformationMessage(`Syncbridge: active project set to ${picked.label}`);
        root = picked.folder.uri.fsPath;
        context.globalState.update('syncbridge.root', root);
        SyncBridgePanel.currentPanel?.updateRoot(root);
        recreateWatcher(root);
    });

    const setupProject = vscode.commands.registerCommand('syncbridge.setupProject', async () => {
        const root = getWorkspaceRoot(context);
        if (!root) {
            vscode.window.showWarningMessage('Syncbridge: no active project set.');
            return;
        }

        if (!isClaudeCliInstalled()) {
            vscode.window.showWarningMessage(
                'Claude Code CLI not found. Setup skipped — install Claude Code CLI to enable full sync.'
            );
            return;
        }

        const claudeDir = path.join(root, '.claude');
        const commandsDir = path.join(claudeDir, 'commands');

        if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });
        if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

        const settingsPath = path.join(claudeDir, 'settings.json');
        if (!fs.existsSync(settingsPath)) {
            const settings = {
                hooks: {
                    PostToolUse: [
                        {
                            matcher: "Write",
                            hooks: [{
                                type: "command",
                                command: "python3 -c \"import sys,json,os,datetime; d=json.load(sys.stdin); ti=d.get('tool_input',{}); fp=ti.get('file_path','unknown'); rel=os.path.relpath(fp,os.getcwd()) if fp!='unknown' else 'unknown'; line='\\u2713 '+datetime.datetime.now().strftime('%H:%M:%S')+' wrote '+rel+'\\n'; open('claude-state.md','a').write(line)\""
                            }]
                        },
                        {
                            matcher: "Bash",
                            hooks: [{
                                type: "command",
                                command: "python3 -c \"import sys,json,os,datetime; d=json.load(sys.stdin); ti=d.get('tool_input',{}); cmd=ti.get('command','unknown')[:50]; line='\\u2713 '+datetime.datetime.now().strftime('%H:%M:%S')+' ran: '+cmd+'\\n'; open('claude-state.md','a').write(line)\""
                            }]
                        }
                    ]
                }
            };
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
        }

        const syncPath = path.join(commandsDir, 'sync.md');
        if (!fs.existsSync(syncPath)) {
            const syncContent = `# Sync\nRead the file claude-ai.md in the project root and execute the instructions inside it. After completing, update claude-state.md with a brief summary of what was done, one line per action, prefixed with ✓.`;
            fs.writeFileSync(syncPath, syncContent, 'utf8');
        }

        vscode.window.showInformationMessage(`Syncbridge: project setup complete in ${path.basename(root)}`);
    });

    context.subscriptions.push(
      vscode.commands.registerCommand('syncbridge.openUsage', () => {
        vscode.env.openExternal(vscode.Uri.parse('https://claude.ai/settings/usage'));
      })
    );

    context.subscriptions.push(statusBar, watcher, openPanel, sendToCLI, setRoot, setupProject);
}

export function deactivate() {}