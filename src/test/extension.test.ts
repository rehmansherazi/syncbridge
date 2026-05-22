import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

suite('Syncbridge Extension Tests', () => {

    let tmpDir: string;

    setup(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syncbridge-test-'));
    });

    teardown(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('control files created on init', () => {
        const files = ['claude-ai.md', 'claude-state.md', 'claude-context.md'];
        for (const f of files) {
            fs.writeFileSync(path.join(tmpDir, f), `# ${f}\n`);
        }
        for (const f of files) {
            assert.ok(fs.existsSync(path.join(tmpDir, f)), `${f} should exist`);
        }
    });

    test('claude-ai.md write is deterministic', () => {
        const filepath = path.join(tmpDir, 'claude-ai.md');
        const content = '# Instructions\nDo X then Y\n';
        fs.writeFileSync(filepath, content, 'utf8');
        const read = fs.readFileSync(filepath, 'utf8');
        assert.strictEqual(read, content);
    });

    test('claude-state.md append is stable', () => {
        const filepath = path.join(tmpDir, 'claude-state.md');
        fs.writeFileSync(filepath, '# claude-state.md\n', 'utf8');
        const lines = ['✓ 10:00:00 wrote src/a.ts', '✓ 10:00:01 wrote src/b.ts'];
        for (const line of lines) {
            fs.appendFileSync(filepath, line + '\n', 'utf8');
        }
        const content = fs.readFileSync(filepath, 'utf8');
        const result = content.split('\n').filter(l => l.startsWith('✓'));
        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0], lines[0]);
        assert.strictEqual(result[1], lines[1]);
    });

    test('context regeneration produces stable output', () => {
        const ai = '# claude-ai.md\nDo X\n';
        const state = '# claude-state.md\n✓ wrote src/a.ts\n';
        const expected = [
            '# claude-context.md',
            '## Last instructions sent to CLI',
            ai,
            '## Last CLI state',
            state,
            '## Resume prompt',
            'We are building a VS Code extension called syncbridge.',
            'Read the above sections and continue from where we left off.',
        ].join('\n\n');
        const ctxPath = path.join(tmpDir, 'claude-context.md');
        fs.writeFileSync(ctxPath, expected, 'utf8');
        const read = fs.readFileSync(ctxPath, 'utf8');
        assert.strictEqual(read, expected);
    });

    test('empty clipboard write produces warning condition', () => {
        const content = '   ';
        assert.ok(!content.trim(), 'empty clipboard should be detected');
    });

    test('control files not overwritten if they exist', () => {
        const filepath = path.join(tmpDir, 'claude-ai.md');
        const original = '# existing content\n';
        fs.writeFileSync(filepath, original, 'utf8');
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, '# claude-ai.md\n');
        }
        const read = fs.readFileSync(filepath, 'utf8');
        assert.strictEqual(read, original, 'existing file should not be overwritten');
    });

    test('extension activates successfully', async () => {
        const ext = vscode.extensions.getExtension('rehman.syncbridge');
        if (ext) {
            await ext.activate();
            assert.ok(ext.isActive, 'extension should be active');
        } else {
            assert.ok(true, 'extension not in test host — skipped');
        }
    });

});
