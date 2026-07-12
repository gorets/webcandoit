import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import webpush from 'web-push';
import { createPushStore, isPushConfigured } from './push.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const appDist = path.resolve(moduleDir, '../../app/dist');
const defaultPushStorePath = path.resolve(moduleDir, '../data/push-subscriptions.json');

const VAPID_SUBJECT = 'https://webcandoit.pp.ua';

export interface CreateAppOptions {
  pushStorePath?: string;
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.use(express.json());

  const pushStorePath = options.pushStorePath ?? defaultPushStorePath;
  const { vapidPublicKey, vapidPrivateKey } = options;
  const pushStore = createPushStore(pushStorePath);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/push/public-key', (_req, res) => {
    if (!isPushConfigured(vapidPublicKey, vapidPrivateKey)) {
      res.status(503).json({ error: 'Push is not configured on this server.' });
      return;
    }
    res.json({ publicKey: vapidPublicKey });
  });

  app.post('/api/push/subscribe', (req, res) => {
    if (!isPushConfigured(vapidPublicKey, vapidPrivateKey)) {
      res.status(503).json({ error: 'Push is not configured on this server.' });
      return;
    }
    const subscription = req.body as webpush.PushSubscription | undefined;
    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      res.status(400).json({ error: 'Invalid subscription.' });
      return;
    }
    try {
      pushStore.save(subscription);
    } catch (err) {
      console.error('Failed to persist push subscription:', err);
      res.status(503).json({ error: 'Could not save subscription.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/push/send', async (req, res) => {
    if (!isPushConfigured(vapidPublicKey, vapidPrivateKey)) {
      res.status(503).json({ error: 'Push is not configured on this server.' });
      return;
    }
    const { subscription, title, body } = req.body as {
      subscription?: webpush.PushSubscription;
      title?: string;
      body?: string;
    };
    if (!subscription?.endpoint || !title || !body) {
      res.status(400).json({ error: 'Invalid request.' });
      return;
    }
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body }), {
        vapidDetails: {
          subject: VAPID_SUBJECT,
          publicKey: vapidPublicKey as string,
          privateKey: vapidPrivateKey as string,
        },
      });
      res.json({ ok: true });
    } catch (err) {
      if (
        err instanceof webpush.WebPushError &&
        (err.statusCode === 404 || err.statusCode === 410)
      ) {
        try {
          pushStore.remove(subscription.endpoint);
        } catch (removeErr) {
          console.error('Failed to remove expired push subscription:', removeErr);
        }
        res.status(410).json({ error: 'Subscription expired — please subscribe again.' });
        return;
      }
      console.error('Failed to send push notification:', err);
      res.status(502).json({ error: 'Failed to send push notification.' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(appDist));
    // SPA fallback: any non-API GET returns index.html
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(appDist, 'index.html'));
    });
  }

  return app;
}
