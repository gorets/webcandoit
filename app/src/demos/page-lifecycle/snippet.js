const output = document.querySelector('#lifecycle-log');

function log(type) {
  const entry = document.createElement('li');
  entry.textContent = `${type} — ${new Date().toLocaleTimeString()}`;
  output.prepend(entry);
}

document.addEventListener('freeze', () => log('freeze'));
document.addEventListener('resume', () => log('resume'));
window.addEventListener('pagehide', (event) => {
  log(event.persisted ? 'pagehide (persisted)' : 'pagehide');
});
window.addEventListener('pageshow', (event) => {
  log(event.persisted ? 'pageshow (persisted)' : 'pageshow');
});

console.log('document.wasDiscarded:', document.wasDiscarded === true);
