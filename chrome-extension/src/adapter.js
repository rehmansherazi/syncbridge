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
  }
};

function getAdapter() {
  const host = location.hostname.replace('www.', '');
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
