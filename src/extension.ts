import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SyncBridgePanel, CliConfig } from './panel';

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
            const entryDate = ts ? new Date(ts).toISOString().slice(0, 10) : null;
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

// FIX 5: returns undefined safely, no context dependency
function getWorkspaceRoot(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return undefined;
  }
  return folders[0].uri.fsPath;
}

// FIX 15: accepts cliConfig, uses config file names
function initControlFiles(root: string, config: CliConfig): void {
  const files = [
    { name: config.instructionsFile, content: `# ${config.instructionsFile}\n<!-- AI → CLI: paste instructions here -->\n` },
    { name: config.stateFile,        content: `# ${config.stateFile}\n<!-- CLI → AI: Claude Code writes status here -->\n` },
    { name: config.contextFile,      content: `# ${config.contextFile}\n<!-- Shared: migration prompt lives here -->\n` }
  ];
  for (const f of files) {
    const fp = path.join(root, f.name);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, f.content, 'utf8');
    }
  }
}

// FIX 8: trim + fallback defaults for custom file names
function getCliConfig(): CliConfig {
  const config = vscode.workspace.getConfiguration('syncbridge');
  const cli = config.get<string>('activeCli', 'claudecode');

  const configs: Record<string, CliConfig> = {
    claudecode: {
      instructionsFile: 'claude-ai.md',
      stateFile: 'claude-state.md',
      contextFile: 'claude-context.md',
      displayName: 'Claude Code',
      hasAutoSync: true
    },
    cursor: {
      instructionsFile: 'cursor-ai.md',
      stateFile: 'cursor-state.md',
      contextFile: 'cursor-context.md',
      displayName: 'Cursor',
      hasAutoSync: false
    },
    copilot: {
      instructionsFile: 'copilot-ai.md',
      stateFile: 'copilot-state.md',
      contextFile: 'copilot-context.md',
      displayName: 'Copilot',
      hasAutoSync: false
    },
    windsurf: {
      instructionsFile: 'windsurf-ai.md',
      stateFile: 'windsurf-state.md',
      contextFile: 'windsurf-context.md',
      displayName: 'Windsurf',
      hasAutoSync: false
    },
    aider: {
      instructionsFile: 'aider-ai.md',
      stateFile: 'aider-state.md',
      contextFile: 'aider-context.md',
      displayName: 'Aider',
      hasAutoSync: false
    },
    custom: {
      instructionsFile: config.get<string>('customInstructionsFile', 'ai-instructions.md').trim() || 'ai-instructions.md',
      stateFile:        config.get<string>('customStateFile', 'ai-state.md').trim() || 'ai-state.md',
      contextFile:      config.get<string>('customContextFile', 'ai-context.md').trim() || 'ai-context.md',
      displayName: 'Custom',
      hasAutoSync: false
    }
  };

  return configs[cli] || configs['claudecode'];
}

export function activate(context: vscode.ExtensionContext) {
  console.log('activate() called');

  let cliConfig = getCliConfig();
  let root: string | undefined = context.globalState.get<string>('syncbridge.root') || getWorkspaceRoot();

  const cliAvailable = isClaudeCliInstalled();
  context.globalState.update('syncbridge.cliAvailable', cliAvailable);

  // Declared early so onStateChange and recreateWatcher can reference them
  let watcher: vscode.FileSystemWatcher | undefined;
  let statusBar: vscode.StatusBarItem | undefined;
  let updateStatusBar: () => void = () => {};

  // FIX 13: debounced state change handler
  let _debounceTimer: NodeJS.Timeout | undefined;
  function onStateChange() {
    if (_debounceTimer) clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      if (!root) return; // FIX 6
      const stateFile = path.join(root, cliConfig.stateFile);
      const content = fs.existsSync(stateFile)
        ? fs.readFileSync(stateFile, 'utf8')
        : '';
      const lines = content.split('\n').filter((l: string) => l.trim() && !l.startsWith('#') && !l.startsWith('<!--'));
      const last = lines[lines.length - 1] ?? 'idle';
      if (statusBar) {
        statusBar.text = `$(sync) ${last.slice(0, 40)}`;
        // FIX 14: truncate tooltip to last 10 lines
        const tooltipLines = content.split('\n').filter(l => l.trim());
        statusBar.tooltip = tooltipLines.slice(-10).join('\n');
        updateStatusBar();
      }
      SyncBridgePanel.currentPanel?.refresh();
    }, 100);
  }

  // FIX 7: push new watcher to subscriptions to prevent memory leak
  function recreateWatcher(newRoot: string, config: CliConfig) {
    if (watcher) watcher.dispose();
    watcher = vscode.workspace.createFileSystemWatcher(
      path.join(newRoot, config.stateFile)
    );
    watcher.onDidChange(onStateChange);
    watcher.onDidCreate(onStateChange);
    context.subscriptions.push(watcher);
  }

  // FIX 4: Register ALL commands BEFORE root check
  const openPanel = vscode.commands.registerCommand('syncbridge.openPanel', () => {
    const currentRoot = context.globalState.get<string>('syncbridge.root') || getWorkspaceRoot();
    if (!currentRoot) {
      vscode.window.showWarningMessage('Syncbridge: Please open a folder first (Ctrl+Shift+A)');
      return;
    }
    SyncBridgePanel.createOrShow(currentRoot, cliAvailable, cliConfig);
  });

  const sendToCLI = vscode.commands.registerCommand('syncbridge.sendToCLI', async () => {
    const currentRoot = context.globalState.get<string>('syncbridge.root') || getWorkspaceRoot();
    if (!currentRoot) {
      vscode.window.showWarningMessage('Syncbridge: Please open a folder first (Ctrl+Shift+A)');
      return;
    }
    // FIX 9: try/catch clipboard read
    try {
      const text = await vscode.env.clipboard.readText();
      if (!text || !text.trim()) {
        vscode.window.showWarningMessage('Syncbridge: Clipboard is empty.');
        return;
      }
      const filepath = path.join(currentRoot, cliConfig.instructionsFile);
      fs.writeFileSync(filepath, text, 'utf8');
      vscode.window.showInformationMessage(`Syncbridge: ${cliConfig.instructionsFile} updated in ${path.basename(currentRoot)}`);
      if (!isClaudeCliInstalled()) {
        vscode.window.showInformationMessage(
          `Claude Code CLI not detected. ${cliConfig.instructionsFile} written — use it manually or install Claude Code CLI for auto-sync.`
        );
      }
      SyncBridgePanel.currentPanel?.refresh();
    } catch (e) {
      vscode.window.showErrorMessage('Syncbridge: Could not read clipboard. Check OS permissions.');
    }
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
    root = picked.folder.uri.fsPath;
    context.globalState.update('syncbridge.root', root);
    vscode.window.showInformationMessage(`Syncbridge: active project set to ${picked.label}`);
    SyncBridgePanel.currentPanel?.updateRoot(root);
    recreateWatcher(root, cliConfig);
  });

  const setupProject = vscode.commands.registerCommand('syncbridge.setupProject', async () => {
    const currentRoot = context.globalState.get<string>('syncbridge.root') || getWorkspaceRoot();
    if (!currentRoot) {
      vscode.window.showWarningMessage('Syncbridge: Please open a folder first (Ctrl+Shift+A)');
      return;
    }

    if (!isClaudeCliInstalled()) {
      vscode.window.showWarningMessage(
        'Claude Code CLI not found. Setup skipped — install Claude Code CLI to enable full sync.'
      );
      return;
    }

    const claudeDir = path.join(currentRoot, '.claude');
    const commandsDir = path.join(claudeDir, 'commands');

    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });
    if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

    const settingsPath = path.join(claudeDir, 'settings.json');
    if (!fs.existsSync(settingsPath)) {
      // FIX 11: python3 || python fallback for Windows
      const pyWrite = `python3 -c "import sys,json,os,datetime; d=json.load(sys.stdin); ti=d.get('tool_input',{}); fp=ti.get('file_path','unknown'); rel=os.path.relpath(fp,os.getcwd()) if fp!='unknown' else 'unknown'; line='\\u2713 '+datetime.datetime.now().strftime('%H:%M:%S')+' wrote '+rel+'\\n'; open('claude-state.md','a').write(line)" 2>/dev/null || python -c "import sys,json,os,datetime; d=json.load(sys.stdin); ti=d.get('tool_input',{}); fp=ti.get('file_path','unknown'); rel=os.path.relpath(fp,os.getcwd()) if fp!='unknown' else 'unknown'; line='\\u2713 '+datetime.datetime.now().strftime('%H:%M:%S')+' wrote '+rel+'\\n'; open('claude-state.md','a').write(line)"`;
      const pyBash = `python3 -c "import sys,json,os,datetime; d=json.load(sys.stdin); ti=d.get('tool_input',{}); cmd=ti.get('command','unknown')[:120]; line='\\u2713 '+datetime.datetime.now().strftime('%H:%M:%S')+' ran: '+cmd+'\\n'; open('claude-state.md','a').write(line)" 2>/dev/null || python -c "import sys,json,os,datetime; d=json.load(sys.stdin); ti=d.get('tool_input',{}); cmd=ti.get('command','unknown')[:120]; line='\\u2713 '+datetime.datetime.now().strftime('%H:%M:%S')+' ran: '+cmd+'\\n'; open('claude-state.md','a').write(line)"`;

      const settings = {
        hooks: {
          PostToolUse: [
            {
              matcher: "Write",
              hooks: [{ type: "command", command: pyWrite }]
            },
            {
              matcher: "Bash",
              hooks: [{ type: "command", command: pyBash }]
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

    vscode.window.showInformationMessage(`Syncbridge: project setup complete in ${path.basename(currentRoot)}`);
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('syncbridge.openUsage', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://claude.ai/settings/usage'));
    })
  );

  context.subscriptions.push(openPanel, sendToCLI, setRoot, setupProject);

  // Guard: root-dependent initialization below
  if (!root) {
    vscode.window.showWarningMessage('Syncbridge: no workspace folder open.');
    return;
  }

  initControlFiles(root, cliConfig); // FIX 15

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
        // FIX 12: correct GitHub URL
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/rehmansherazi/syncbridge#readme'));
      }
    });
  }

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = '$(sync) Syncbridge';
  statusBar.tooltip = 'AI ↔ CLI sync bridge is active';
  statusBar.command = 'syncbridge.openUsage';
  statusBar.show();

  // Assign real updateStatusBar now that statusBar exists
  const _statusBar = statusBar;
  updateStatusBar = () => {
    const usage = readClaudeUsage();
    const usageSuffix = formatUsage(usage);
    const base = _statusBar.text.split(' · ')[0];
    _statusBar.text = base + usageSuffix;
    if (usage) {
      _statusBar.tooltip = `AI ↔ CLI sync bridge active\nToday: ${usage.tokens.toLocaleString()} tokens · $${usage.costUsd.toFixed(4)}`;
    }
  };

  updateStatusBar();
  const usageInterval = setInterval(updateStatusBar, 30000);
  context.subscriptions.push({ dispose: () => clearInterval(usageInterval) });

  watcher = vscode.workspace.createFileSystemWatcher(
    path.join(root, cliConfig.stateFile)
  );
  watcher.onDidChange(onStateChange);
  watcher.onDidCreate(onStateChange);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('syncbridge.activeCli') ||
          e.affectsConfiguration('syncbridge.customInstructionsFile') ||
          e.affectsConfiguration('syncbridge.customStateFile') ||
          e.affectsConfiguration('syncbridge.customContextFile')) {
        cliConfig = getCliConfig();
        if (!root) return; // FIX 6
        recreateWatcher(root, cliConfig);
        SyncBridgePanel.currentPanel?.updateCliConfig(cliConfig);
      }
    })
  );

  context.subscriptions.push(statusBar, watcher);
}

export function deactivate() {}
