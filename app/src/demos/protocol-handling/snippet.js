const registerButton = document.querySelector('#register-protocol-button');
const output = document.querySelector('#protocol-output');

const SCHEME = 'web+webcandoit';

registerButton.addEventListener('click', () => {
  try {
    const handlerUrl = `${window.location.origin}/demo/protocol-handling?url=%s`;
    navigator.registerProtocolHandler(SCHEME, handlerUrl);
    output.textContent = `Registered as a handler for "${SCHEME}:" links.`;
  } catch (err) {
    output.textContent = `Could not register the protocol handler: ${err.message}`;
  }
});
