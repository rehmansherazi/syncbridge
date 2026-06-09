const dot = document.getElementById('status-dot');
const label = document.getElementById('toggle-label');

chrome.storage.local.get('widgetVisible', (data) => {
  const visible = data.widgetVisible !== false;
  updateUI(visible);
});

function updateUI(visible) {
  dot.className = 'dot' + (visible ? '' : ' hidden');
  label.textContent = visible ? 'Hide floating icon' : 'Show floating icon';
}

function showStatus(msg, type) {
  const el = document.getElementById('sb-status');
  if (!el) return;
  el.style.display = 'block';
  el.style.color = type === 'error' ? '#ff6b6b' : type === 'warn' ? '#ffa94d' : '#69db7c';
  el.textContent = msg;
}

const SUPPORTED_SITES = [
  'claude.ai',
  'chatgpt.com',
  'gemini.google.com',
  'perplexity.ai',
  'mistral.ai',
  'chat.mistral.ai',
  'x.ai',
  'grok.com',
  'copilot.microsoft.com'
];

function isSupportedSite(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return SUPPORTED_SITES.some(site => hostname === site || hostname.endsWith('.' + site));
  } catch (e) {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) {
      showStatus('⚠ Navigate to a supported AI site to use Syncbridge', 'warn');
      return;
    }
    if (!isSupportedSite(tab.url)) {
      showStatus('⚠ Open Claude.ai, ChatGPT, Gemini, Grok, Mistral, Perplexity or Copilot', 'warn');
      return;
    }
    showStatus('✓ Syncbridge active on this tab', 'ok');
  });
});

document.getElementById('toggle-widget').addEventListener('click', () => {
  chrome.storage.local.get('widgetVisible', (data) => {
    const current = data.widgetVisible !== false;
    const next = !current;
    chrome.storage.local.set({ widgetVisible: next });
    updateUI(next);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'syncbridge-toggle-widget',
          visible: next
        }, (response) => {
          if (chrome.runtime.lastError) {
            if (!isSupportedSite(tabs[0].url)) {
              showStatus('⚠ Open a supported AI site first', 'warn');
            } else {
              showStatus('↻ Refresh the page to activate Syncbridge', 'warn');
            }
          }
        });
      }
    });
  });
});
