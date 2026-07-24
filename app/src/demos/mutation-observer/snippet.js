const target = document.querySelector('#target');

const observer = new MutationObserver((records) => {
  for (const record of records) {
    if (record.type === 'childList') {
      console.log(`+${record.addedNodes.length} -${record.removedNodes.length} nodes`);
    } else if (record.type === 'attributes') {
      console.log(`attribute changed: ${record.attributeName}`);
    }
  }
});

observer.observe(target, {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
});

// Stop watching with: observer.disconnect();
