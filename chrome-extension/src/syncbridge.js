const Syncbridge = {
  async readClipboard() {
    try {
      return await navigator.clipboard.readText();
    } catch (e) {
      return null;
    }
  },

  async writeClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        return false;
      }
    }
  },

  async injectToInput(text) {
    return injectText(text);
  },

  extractLastResponse() {
    return getLastResponse();
  }
};
