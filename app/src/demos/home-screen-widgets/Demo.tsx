const MANIFEST_SNIPPET = `{
  "widgets": [
    {
      "name": "Latest headlines",
      "description": "Shows the latest three headlines.",
      "tag": "headlines",
      "template": "headlines-template",
      "ms_ac_template": "widget/headlines.json",
      "data": "widget/headlines-data.json",
      "type": "application/json",
      "screenshots": [
        {
          "src": "widget/screenshot.png",
          "sizes": "256x256",
          "label": "Headlines widget preview"
        }
      ],
      "icons": [{ "src": "/icons/icon-192.png", "sizes": "192x192" }],
      "update": 3600
    }
  ]
}`;

export default function HomeScreenWidgetsDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Home screen widgets let an installed PWA place a small, glanceable surface (built from an
        Adaptive Card template) on the Windows desktop or Start menu, independent of the app window.
        Support today is limited to Windows/Edge — there is no live API to call from a normal page,
        so this demo is explanatory only.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>
        Widgets are declared with a <code>widgets</code> member in the web app manifest. Each entry
        names a template, points to a JSON data source, and can declare an update interval
        (seconds):
      </p>
      <pre
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          overflowX: 'auto',
          fontSize: '0.85rem',
        }}
      >
        {MANIFEST_SNIPPET}
      </pre>
      <p style={{ color: 'var(--text-dim)' }}>
        The <code>template</code> refers to an Adaptive Card JSON template shipped with the app that
        defines the widget's layout; <code>data</code> supplies the values that fill it in. Once a
        user adds the widget from the OS widget board, the app's service worker receives lifecycle
        events to manage it:
      </p>
      <ul style={{ color: 'var(--text-dim)', paddingLeft: '1.25rem', margin: 0 }}>
        <li>
          <code>widgetinstall</code> — fired when the widget is added; the service worker should
          fetch the initial data and render the template.
        </li>
        <li>
          <code>widgetclick</code> — fired when the user interacts with an actionable element inside
          the widget.
        </li>
        <li>
          <code>widgetresume</code> / <code>widgetuninstall</code> — fired when the widget board is
          reopened, or when the widget is removed, respectively.
        </li>
      </ul>
      <p style={{ color: 'var(--text-dim)' }}>
        Because this relies on the OS widget board and Windows-specific tooling, it cannot be
        exercised live from this page — see the linked spec for a full walkthrough with real
        template files.
      </p>
    </div>
  );
}
