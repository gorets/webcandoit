const patternInput = document.querySelector('#url-pattern-pattern');
const urlInput = document.querySelector('#url-pattern-url');
const output = document.querySelector('#url-pattern-output');

function run() {
  try {
    const pattern = new URLPattern({ pathname: patternInput.value });
    const result = pattern.exec(urlInput.value, 'https://example.com');
    if (result) {
      output.textContent = JSON.stringify(result.pathname.groups, null, 2);
    } else {
      output.textContent = 'No match';
    }
  } catch (err) {
    output.textContent = `Error: ${err instanceof Error ? err.message : 'Invalid pattern'}`;
  }
}

patternInput.addEventListener('input', run);
urlInput.addEventListener('input', run);
run();
