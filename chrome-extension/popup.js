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
        });
      }
    });
  });
});
