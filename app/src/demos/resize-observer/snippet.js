const box = document.querySelector('#box');

const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`${Math.round(width)} x ${Math.round(height)}`);
  }
});

observer.observe(box);

// Stop watching with: observer.disconnect();
