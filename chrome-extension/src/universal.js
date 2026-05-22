const Syncbridge = {
  site: window.location.hostname,

  readClipboard: async () => {
    return await navigator.clipboard.readText();
  },

  writeClipboard: async (text) => {
    await navigator.clipboard.writeText(text);
  },

  getAdapter: () => {
    if (window.SyncbridgeAdapter) return window.SyncbridgeAdapter;
    return null;
  },

  injectToInput: async (text) => {
    const adapter = Syncbridge.getAdapter();
    if (!adapter) return false;
    return adapter.injectText(text);
  },

  extractLastResponse: () => {
    const adapter = Syncbridge.getAdapter();
    if (!adapter) return null;
    return adapter.getLastResponse();
  }
};

window.Syncbridge = Syncbridge;

function watchForResponseComplete() {
  const adapter = Syncbridge.getAdapter();
  if (!adapter) return;

  let lastText = '';
  let stableCount = 0;
  const STABLE_THRESHOLD = 3;
  const POLL_INTERVAL = 800;

  const interval = setInterval(async () => {
    const current = Syncbridge.extractLastResponse();
    if (!current || current.length < 20) return;

    if (current === lastText) {
      stableCount++;
      if (stableCount === STABLE_THRESHOLD) {
        await Syncbridge.writeClipboard(current);
        const status = document.getElementById('syncbridge-status');
        if (status) status.textContent = '✓ Auto-copied response';
        setTimeout(() => {
          if (status) status.textContent = 'Ready';
        }, 3000);
      }
    } else {
      lastText = current;
      stableCount = 0;
    }
  }, POLL_INTERVAL);

  window._syncbridgeWatcher = interval;
}

window.addEventListener('load', () => {
  setTimeout(watchForResponseComplete, 2000);
});
