const ADAPTERS = {
  'claude.ai': {
    inputSelectors: [
      'div[contenteditable="true"]',
      'div[contenteditable="true"][data-placeholder]',
      '.ProseMirror'
    ],
    responseSelectors: [
      'div[data-is-streaming="false"]',
      '.prose',
      '[class*="message"]:last-child'
    ]
  },
  'chatgpt.com': {
    inputSelectors: [
      '#prompt-textarea',
      'div[contenteditable="true"]',
      'textarea[placeholder]'
    ],
    responseSelectors: [
      '.markdown',
      '[class*="prose"]',
      '[data-message-author-role="assistant"]:last-child'
    ]
  },
  'gemini.google.com': {
    inputSelectors: [
      'rich-textarea',
      'div[contenteditable="true"]',
      'textarea'
    ],
    responseSelectors: [
      '.response-content',
      'model-response',
      '[class*="response"]:last-child'
    ]
  },
  'perplexity.ai': {
    inputSelectors: [
      '#ask-input',
      'textarea[placeholder]',
      'div[contenteditable="true"]'
    ],
    responseSelectors: [
      '.prose',
      '[class*="answer"]',
      '[class*="response"]:last-child'
    ]
  },
  'mistral.ai': {
    inputSelectors: [
      'div.ProseMirror[data-placeholder="Ask anything"]',
      'div.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"]'
    ],
    responseSelectors: [
      'div[data-message-part-type="answer"]',
      '.markdown-container-style',
      '[data-message-author-role="assistant"]:last-child'
    ]
  },
  'x.ai': {
    inputSelectors: [
      'div[data-testid="chat-input"] div[contenteditable="true"]',
      'div.tiptap.ProseMirror',
      'div[contenteditable="true"][aria-label="Ask Grok anything"]',
      'div[contenteditable="true"]'
    ],
    responseSelectors: [
      'div[data-testid="assistant-message"] .response-content-markdown',
      '.response-content-markdown',
      'div[data-testid="assistant-message"]',
      '[class*="message"]:last-child'
    ]
  },
  'copilot.microsoft.com': {
    inputSelectors: [
      'textarea#userInput',
      'textarea[data-testid="composer-input"]',
      'textarea[placeholder="Message Copilot"]',
      'textarea'
    ],
    responseSelectors: [
      'div[data-testid="ai-message"] .font-ligatures-none',
      'div[data-content="ai-message"]',
      'div[data-testid="ai-message"]',
      '[class*="message"]:last-child'
    ]
  }
};

function getAdapter() {
  const host = location.hostname.replace('www.', '');
  if (host === 'grok.com') return ADAPTERS['x.ai'];
  if (host === 'chat.mistral.ai') return ADAPTERS['mistral.ai'];
  return ADAPTERS[host] || null;
}

function findElement(selectors) {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (e) {}
  }
  return null;
}

function findElements(selectors) {
  for (const sel of selectors) {
    try {
      const els = document.querySelectorAll(sel);
      if (els.length) return els;
    } catch (e) {}
  }
  return null;
}

function injectText(text) {
  const adapter = getAdapter();
  if (!adapter) return false;
  const el = findElement(adapter.inputSelectors);
  if (!el) return false;
  el.focus();

  try {
    const inserted = document.execCommand('insertText', false, text);
    if (inserted) return true;
  } catch (e) {}

  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);
    el.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer
    }));
    return true;
  } catch (e) {}

  try {
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: text,
      inputType: 'insertText'
    }));
    el.textContent = text;
    return true;
  } catch (e) {}

  return false;
}

function getLastResponse() {
  const adapter = getAdapter();
  if (!adapter) return null;
  const els = findElements(adapter.responseSelectors);
  if (!els || !els.length) return null;
  const text = els[els.length - 1].innerText;
  return text && text.trim().length > 0 ? text.trim() : null;
}
