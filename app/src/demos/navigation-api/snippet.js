// A single event fires for every navigation — links, forms, back/forward.
navigation.addEventListener('navigate', (event) => {
  console.log('navigating to', event.destination.url);
});

// The full list of session-history entries is enumerable.
console.log('entries:', navigation.entries().length);
console.log('current index:', navigation.currentEntry.index);

// Programmatic navigation returns a promise that resolves when it commits.
document.querySelector('#go').addEventListener('click', async () => {
  await navigation.navigate('/next-page').finished;
  console.log('arrived');
});
