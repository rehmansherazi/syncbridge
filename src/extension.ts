import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SyncBridgePanel } from './panel';

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

    const root = getWorkspaceRoot(context);

    if (!root) {
        vscode.window.showWarningMessage('Syncbridge: no workspace folder open.');
        return;
    }

    initControlFiles(root);

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
    statusBar.show();

    const stateFile = path.join(root, 'claude-state.md');
    const watcher = vscode.workspace.createFileSystemWatcher(stateFile);

    watcher.onDidChange(() => {
        const content = fs.readFileSync(stateFile, 'utf8');
        const lines = content.split('\n').filter((l: string) => l.trim() && !l.startsWith('#') && !l.startsWith('<!--'));
        const last = lines[lines.length - 1] ?? 'idle';
        statusBar.text = `$(sync) ${last.slice(0, 40)}`;
        statusBar.tooltip = content;
    });

    const openPanel = vscode.commands.registerCommand('syncbridge.openPanel', () => {
        SyncBridgePanel.show(root);
    });
    watcher.onDidChange(() => SyncBridgePanel.currentPanel?.refresh());

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
        SyncBridgePanel.currentPanel?.refresh();
    });

    const setupProject = vscode.commands.registerCommand('syncbridge.setupProject', async () => {
        const root = getWorkspaceRoot(context);
        if (!root) {
            vscode.window.showWarningMessage('Syncbridge: no active project set.');
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
                    PostToolUse: [{
                        matcher: "Write",
                        hooks: [{
                            type: "command",
                            command: "python3 -c \"import sys,json,os,datetime; d=json.load(sys.stdin); ti=d.get('tool_input',{}); fp=ti.get('file_path','unknown'); rel=os.path.relpath(fp,os.getcwd()) if fp!='unknown' else 'unknown'; line='\\u2713 '+datetime.datetime.now().strftime('%H:%M:%S')+' wrote '+rel+'\\n'; open('claude-state.md','a').write(line)\""
                        }]
                    }]
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

    context.subscriptions.push(statusBar, watcher, openPanel, sendToCLI, setRoot, setupProject);
}

export function deactivate() {}