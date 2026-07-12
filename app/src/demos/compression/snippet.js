async function gzip(text) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).blob();
}

async function gunzip(blob) {
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

const input = document.querySelector('#compression-input');
const runButton = document.querySelector('#compress-button');
const output = document.querySelector('#compression-output');

runButton.addEventListener('click', async () => {
  try {
    const text = input.value;
    const originalBytes = new TextEncoder().encode(text).length;
    const compressedBlob = await gzip(text);
    const roundTripped = await gunzip(compressedBlob);

    output.textContent =
      `Original: ${originalBytes} bytes, compressed: ${compressedBlob.size} bytes, ` +
      `round trip ${roundTripped === text ? 'verified' : 'mismatch'}.`;
  } catch (err) {
    output.textContent = `Compression failed: ${err.message}`;
  }
});
