const STABLE_THRESHOLD = 3;
const POLL_INTERVAL_MS = 800;
const START_DELAY_MS = 2000;
const MAX_NULL_STREAK = 30;

function watchForResponseComplete() {
  let last = null;
  let stableCount = 0;
  let nullStreak = 0;
  let intervalId = null;

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      window._syncbridgeWatcher = null;
    }
  }

  function tick() {
    const current = getLastResponse();

    if (!current) {
      nullStreak++;
      if (nullStreak >= MAX_NULL_STREAK) stop();
      stableCount = 0;
      last = null;
      return;
    }

    nullStreak = 0;

    if (current === last) {
      stableCount++;
      if (stableCount >= STABLE_THRESHOLD) {
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
        stableCount = 0;
        last = null;
      }
    } else {
      stableCount = 0;
      last = current;
    }
  }

  stop();
  intervalId = setInterval(tick, POLL_INTERVAL_MS);
  window._syncbridgeWatcher = intervalId;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else {
      setTimeout(() => {
        if (!window._syncbridgeWatcher) watchForResponseComplete();
      }, START_DELAY_MS);
    }
  });
}

setTimeout(watchForResponseComplete, START_DELAY_MS);
