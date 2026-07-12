const list = document.querySelector('#launched-files');

if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files || launchParams.files.length === 0) return;

    for (const handle of launchParams.files) {
      try {
        const file = await handle.getFile();
        const text = await file.text();
        const item = document.createElement('li');
        item.textContent = `${handle.name} (${file.size} bytes): ${text.slice(0, 300)}`;
        list.append(item);
      } catch (err) {
        console.error('Could not read launch file', err);
      }
    }
  });
}
