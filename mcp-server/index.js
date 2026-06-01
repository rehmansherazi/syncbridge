#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const TOOLS = [
  {
    name: 'update_state',
    description: 'Push current Claude Code CLI state to Syncbridge',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Active project name' },
        state: { type: 'string', description: 'Current CLI state content' }
      },
      required: ['project', 'state']
    }
  },
  {
    name: 'read_instructions',
    description: 'Pull latest AI instructions from Syncbridge',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Active project name' }
      },
      required: ['project']
    }
  },
  {
    name: 'get_context',
    description: 'Get full merged context for active project',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Active project name' }
      },
      required: ['project']
    }
  },
  {
    name: 'clear_state',
    description: 'Reset Syncbridge state for a new session',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Active project name' }
      },
      required: ['project']
    }
  }
];

function projectDir(project) {
  return path.join(process.env.HOME, 'repos', project);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (e) {
    return null;
  }
}

function writeFile(filePath, content) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

function handleTool(name, args) {
  const dir = projectDir(args.project);

  if (name === 'update_state') {
    const statePath = path.join(dir, 'claude-state.md');
    const ok = writeFile(statePath, args.state);
    return ok
      ? { content: [{ type: 'text', text: `State updated for ${args.project}` }] }
      : { content: [{ type: 'text', text: `Error: could not write state for ${args.project}` }], isError: true };
  }

  if (name === 'read_instructions') {
    const aiPath = path.join(dir, 'claude-ai.md');
    const content = readFile(aiPath);
    return content
      ? { content: [{ type: 'text', text: content }] }
      : { content: [{ type: 'text', text: `No instructions found for ${args.project}` }], isError: true };
  }

  if (name === 'get_context') {
    const contextPath = path.join(dir, 'claude-context.md');
    const content = readFile(contextPath);
    return content
      ? { content: [{ type: 'text', text: content }] }
      : { content: [{ type: 'text', text: `No context found for ${args.project}` }], isError: true };
  }

  if (name === 'clear_state') {
    const statePath = path.join(dir, 'claude-state.md');
    const ok = writeFile(statePath, '');
    return ok
      ? { content: [{ type: 'text', text: `State cleared for ${args.project}` }] }
      : { content: [{ type: 'text', text: `Error: could not clear state for ${args.project}` }], isError: true };
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
}

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch (e) {
    return;
  }

  if (msg.method === 'initialize') {
    send({
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'syncbridge', version: '0.1.0' }
      }
    });
    return;
  }

  if (msg.method === 'tools/list') {
    send({
      jsonrpc: '2.0',
      id: msg.id,
      result: { tools: TOOLS }
    });
    return;
  }

  if (msg.method === 'tools/call') {
    const result = handleTool(msg.params.name, msg.params.arguments);
    send({ jsonrpc: '2.0', id: msg.id, result });
    return;
  }

  if (msg.method === 'notifications/initialized') {
    return;
  }

  send({
    jsonrpc: '2.0',
    id: msg.id,
    error: { code: -32601, message: 'Method not found' }
  });
});
