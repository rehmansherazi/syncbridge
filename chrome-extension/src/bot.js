function initBot() {
  if (document.getElementById('syncbridge-bot')) return;

  const bot = document.createElement('div');
  bot.id = 'syncbridge-bot';

  bot.innerHTML = `
    <div id="syncbridge-panel">
      <div id="syncbridge-panel-inner">
        <button id="sb-copy-response">↑ Copy AI response</button>
        <button id="sb-inject-clipboard">↓ Inject clipboard to input</button>
        <div id="syncbridge-status">Ready</div>
      </div>
    </div>
    <div id="syncbridge-tab"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>
    <button id="sb-remove-btn" style="display:none;position:absolute;top:-8px;right:-8px;width:18px;height:18px;background:#e24b4a;border:2px solid #fff;border-radius:50%;color:#fff;font-size:10px;line-height:1;cursor:pointer;z-index:10000;padding:0;text-align:center;" title="Hide floating icon">✕</button>
  `;

  document.body.appendChild(bot);

  const status = document.getElementById('syncbridge-status');
  const panel = document.getElementById('syncbridge-panel');
  const removeBtn = document.getElementById('sb-remove-btn');

  document.getElementById('syncbridge-tab').addEventListener('click', () => {
    panel.classList.toggle('pinned');
  });

  let dragging = false;
  let startY = 0;
  let startTop = 0;

  bot.addEventListener('mousedown', (e) => {
    dragging = true;
    startY = e.clientY;
    startTop = bot.getBoundingClientRect().top;
    bot.style.cursor = 'grabbing';
    bot.style.transform = 'none';
    bot.style.top = startTop + 'px';
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dy = e.clientY - startY;
    const newTop = Math.max(0, Math.min(window.innerHeight - 80, startTop + dy));
    bot.style.top = newTop + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    bot.style.cursor = 'grab';
  });

  document.getElementById('sb-copy-response').addEventListener('click', async () => {
    const text = Syncbridge.extractLastResponse();
    if (!text) {
      status.textContent = '✗ No response found';
      return;
    }
    await Syncbridge.writeClipboard(text);
    status.textContent = '✓ Copied to clipboard';
  });

  document.getElementById('sb-inject-clipboard').addEventListener('click', async () => {
    const text = await Syncbridge.readClipboard();
    if (!text) {
      status.textContent = '✗ Clipboard empty';
      return;
    }
    const ok = await Syncbridge.injectToInput(text);
    status.textContent = ok ? '✓ Injected to input' : '✗ Input not found';
  });

  bot.addEventListener('mouseenter', () => {
    removeBtn.style.display = 'block';
  });
  bot.addEventListener('mouseleave', () => {
    removeBtn.style.display = 'none';
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.storage.local.set({ widgetVisible: false });
    bot.style.transition = 'opacity 0.3s';
    bot.style.opacity = '0';
    setTimeout(() => bot.remove(), 300);
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'c') {
      document.getElementById('sb-copy-response').click();
    }
    if (e.altKey && e.key === 'v') {
      document.getElementById('sb-inject-clipboard').click();
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'syncbridge-toggle-widget') {
    if (msg.visible) {
      if (!document.getElementById('syncbridge-bot')) {
        initBot();
      }
    } else {
      const b = document.getElementById('syncbridge-bot');
      if (b) {
        b.style.transition = 'opacity 0.3s';
        b.style.opacity = '0';
        setTimeout(() => b.remove(), 300);
      }
    }
  }
});

chrome.storage.local.get('widgetVisible', (data) => {
  if (data.widgetVisible !== false) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBot);
    } else {
      initBot();
    }
  }
});
