function createBot() {
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
  `;

  document.body.appendChild(bot);

  const status = document.getElementById('syncbridge-status');
  const panel = document.getElementById('syncbridge-panel');
  const tab = document.getElementById('syncbridge-tab');

  tab.addEventListener('click', () => {
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

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'c') {
      document.getElementById('sb-copy-response').click();
    }
    if (e.altKey && e.key === 'v') {
      document.getElementById('sb-inject-clipboard').click();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createBot);
} else {
  createBot();
}
