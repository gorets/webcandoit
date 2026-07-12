self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(
    fetch('widget/headlines-data.json')
      .then((response) => response.json())
      .then((data) => self.widgets.updateByTag(event.widget.definition.tag, { template: data })),
  );
});

self.addEventListener('widgetclick', (event) => {
  if (event.action === 'open-headline') {
    clients.openWindow(event.widget.data?.url ?? '/');
  }
});

self.addEventListener('widgetresume', (event) => {
  event.waitUntil(self.widgets.updateByTag(event.widget.definition.tag));
});

self.addEventListener('widgetuninstall', (event) => {
  console.log('Widget removed:', event.widget.definition.tag);
});
