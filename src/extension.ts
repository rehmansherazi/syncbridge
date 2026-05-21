import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SyncBridgePanel } from './panel';

function getWorkspaceRoot(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) return null;

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const activeFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
        if (activeFolder) return activeFolder.uri.fsPath;
    }

    const activeTerminal = vscode.window.activeTerminal;
    if (activeTerminal) {
        for (const folder of folders) {
            if (activeTerminal.name.toLowerCase().includes(
                path.basename(folder.uri.fsPath).toLowerCase()
            )) {
                return folder.uri.fsPath;
            }
        }
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

    const root = getWorkspaceRoot();

    if (!root) {
        vscode.window.showWarningMessage('Syncbridge: no workspace folder open.');
        return;
    }

    initControlFiles(root);

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
        const content = await vscode.env.clipboard.readText();
        if (!content.trim()) {
            vscode.window.showWarningMessage('Syncbridge: clipboard is empty.');
            return;
        }
        const filepath = path.join(root, 'claude-ai.md');
        fs.writeFileSync(filepath, content, 'utf8');
        vscode.window.showInformationMessage('Syncbridge: claude-ai.md updated from clipboard.');
        SyncBridgePanel.currentPanel?.refresh();
    });

    context.subscriptions.push(statusBar, watcher, openPanel, sendToCLI);
}

export function deactivate() {}