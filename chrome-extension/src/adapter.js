// Site adapters for Syncbridge Chrome extension.
// Note: claude.ai response selector is div[data-is-streaming="false"], NOT .prose.

const adapters = {
  'claude.ai': {
    inputSelector: 'div[contenteditable="true"]',
    responseSelector: 'div[data-is-streaming="false"]',
    injectText: (text) => {
      const el = document.querySelector('div[contenteditable="true"]');
      if (!el) return false;
      el.focus();
      document.execCommand('insertText', false, text);
      return true;
    },
    getLastResponse: () => {
      const els = document.querySelectorAll('div[data-is-streaming="false"]');
      if (!els.length) return null;
      const last = els[els.length - 1];
      return last.innerText;
    }
  },
  'chatgpt.com': {
    inputSelector: '#prompt-textarea',
    responseSelector: '.markdown',
    injectText: (text) => {
      const el = document.querySelector('#prompt-textarea');
      if (!el) return false;
      el.focus();
      document.execCommand('insertText', false, text);
      return true;
    },
    getLastResponse: () => {
      const els = document.querySelectorAll('.markdown');
      if (!els.length) return null;
      return els[els.length - 1].innerText;
    }
  },
  'gemini.google.com': {
    inputSelector: 'rich-textarea',
    responseSelector: '.response-content',
    injectText: (text) => {
      const el = document.querySelector('rich-textarea');
      if (!el) return false;
      el.focus();
      document.execCommand('insertText', false, text);
      return true;
    },
    getLastResponse: () => {
      const els = document.querySelectorAll('.response-content');
      return els.length ? els[els.length - 1].innerText : null;
    }
  },
  'www.perplexity.ai': {
    inputSelector: '#ask-input',
    responseSelector: '.prose',
    injectText: (text) => {
      const el = document.querySelector('#ask-input');
      if (!el) return false;
      el.focus();
      document.execCommand('insertText', false, text);
      return true;
    },
    getLastResponse: () => {
      const els = document.querySelectorAll('.prose');
      return els.length ? els[els.length - 1].innerText : null;
    }
  }
};

const hostname = window.location.hostname;
if (adapters[hostname]) {
  window.SyncbridgeAdapter = adapters[hostname];
  console.log(`Syncbridge: adapter loaded for ${hostname}`);
}
