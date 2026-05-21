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
