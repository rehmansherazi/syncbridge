function showCopiedBadge() {
  const status = document.getElementById('syncbridge-status');
  if (status) {
    const prev = status.textContent;
    status.textContent = '✓ Auto-copied response';
    setTimeout(() => { status.textContent = prev; }, 2000);
    return;
  }
  const toast = document.createElement('div');
  toast.textContent = '✓ Syncbridge: Auto-copied response';
  toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1D9E75;color:#fff;padding:8px 14px;border-radius:6px;font-size:13px;font-family:sans-serif;z-index:999999;box-shadow:0 2px 8px rgba(0,0,0,0.3)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

const STABLE_THRESHOLD = 3;
const POLL_INTERVAL_MS = 800;
const START_DELAY_MS = 2000;

let _watcherIntervalId = null;
let _lastCopied = null;

function stopWatcher() {
  if (_watcherIntervalId) {
    clearInterval(_watcherIntervalId);
    _watcherIntervalId = null;
  }
}

function startWatcher() {
  stopWatcher();
  let last = null;
  let stableCount = 0;

  function tick() {
    const current = getLastResponse();
    if (!current) {
      stableCount = 0;
      last = null;
      return;
    }
    if (current === _lastCopied) {
      return;
    }
    if (current === last) {
      stableCount++;
      if (stableCount >= STABLE_THRESHOLD) {
        _lastCopied = current;
        stopWatcher();
        try {
          navigator.clipboard.writeText(current).then(() => {
            showCopiedBadge();
          }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = current;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showCopiedBadge();
          });
        } catch (e) {}
      }
    } else {
      stableCount = 0;
      last = current;
    }
  }

  _watcherIntervalId = setInterval(tick, POLL_INTERVAL_MS);
}

function watchForNewMessage() {
  const adapter = getAdapter();
  if (!adapter) return;
  let lastInput = '';
  let lastCopyTime = 0;

  setInterval(() => {
    const el = findElement(adapter.inputSelectors);
    if (!el) return;
    const current = (el.textContent || el.value || '').trim();
    if (current && current !== lastInput) {
      lastInput = current;
    }
    if (!current && lastInput) {
      lastInput = '';
      const now = Date.now();
      if (now - lastCopyTime > 5000) {
        lastCopyTime = now;
        _lastCopied = null;
        setTimeout(startWatcher, START_DELAY_MS);
      }
    }
  }, 1000);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopWatcher();
  } else {
    if (!_watcherIntervalId && !_lastCopied) {
      setTimeout(startWatcher, START_DELAY_MS);
    }
  }
});

setTimeout(() => {
  startWatcher();
  watchForNewMessage();
}, START_DELAY_MS);
