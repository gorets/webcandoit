const queryButton = document.querySelector('#list-fonts-button');
const statusEl = document.querySelector('#fonts-status');
const listEl = document.querySelector('#fonts-list');

queryButton.addEventListener('click', async () => {
  statusEl.textContent = 'Requesting permission…';
  try {
    const fonts = await window.queryLocalFonts();
    statusEl.textContent = `Found ${fonts.length} font(s).`;
    listEl.innerHTML = '';
    for (const font of fonts.slice(0, 200)) {
      const row = document.createElement('div');
      row.textContent = `${font.family} — ${font.postscriptName}`;
      listEl.append(row);
    }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      statusEl.textContent = 'Permission to access local fonts was denied.';
    } else if (err.name !== 'AbortError') {
      statusEl.textContent = 'Could not read local fonts.';
    }
  }
});
