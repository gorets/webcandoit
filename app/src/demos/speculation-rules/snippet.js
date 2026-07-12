const TARGET_URL = '/demo/vibration';
const rules = { prerender: [{ urls: [TARGET_URL] }] };

const injectButton = document.querySelector('#inject-rules-button');
const removeButton = document.querySelector('#remove-rules-button');
const status = document.querySelector('#rules-status');

let scriptEl = null;

injectButton.addEventListener('click', () => {
  try {
    scriptEl = document.createElement('script');
    scriptEl.type = 'speculationrules';
    scriptEl.textContent = JSON.stringify(rules);
    document.head.appendChild(scriptEl);
    status.textContent = 'The rules script is currently in the document head.';
  } catch (err) {
    status.textContent = `Could not inject speculation rules: ${err.message}`;
  }
});

removeButton.addEventListener('click', () => {
  scriptEl?.remove();
  scriptEl = null;
  status.textContent = 'No speculation rules are currently injected.';
});
