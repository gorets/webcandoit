const samplePayload = {
  web_push: 8030,
  notification: {
    title: 'Example Notification',
    body: 'This is an example notification body.',
    icon: 'icon.png',
    navigate: 'https://example.com',
  },
};

export default function DeclarativeWebPushDemo() {
  const pushSupported = typeof window !== 'undefined' && 'PushManager' in window;

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        Regular web push wakes up a service worker with an encrypted binary message, and your own
        JavaScript decides how to turn it into a notification via{' '}
        <code>registration.showNotification(...)</code>. <strong>Declarative web push</strong>{' '}
        (supported by Safari 18.4+) instead lets the push payload itself be a plain JSON object with
        a top-level <code>web_push</code> version field and a <code>notification</code> description.
        The browser reads that JSON and displays the notification directly —{' '}
        <em>no service worker JavaScript runs at all</em>, which is more battery-efficient and works
        even if the app's service worker code has a bug.
      </p>
      <p role="status" style={{ color: 'var(--text-dim)' }}>
        Push API present in this browser: {pushSupported ? 'yes' : 'no'}. There is no separate
        feature flag for declarative payload support specifically, so this only checks for general
        Push API support as a baseline — actual declarative delivery is currently Safari-only.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>Sample declarative push payload:</p>
      <pre
        style={{
          background: 'var(--surface-2)',
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          overflowX: 'auto',
        }}
      >
        {JSON.stringify(samplePayload, null, 2)}
      </pre>
      <p style={{ color: 'var(--text-dim)' }}>
        Actually receiving one of these requires a push server that can send this exact payload
        shape to a subscribed endpoint — that server piece isn't built yet (coming in a later
        phase). See the "Push Notifications" demo for subscribing to regular, imperative push.
      </p>
    </div>
  );
}
