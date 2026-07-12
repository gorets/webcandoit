import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as webpush from 'web-push';
import { createApp } from './app.js';
import { createPushStore } from './push.js';

vi.mock('web-push', () => {
  class WebPushError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  return {
    sendNotification: vi.fn(),
    WebPushError,
  };
});

describe('api', () => {
  it('responds to health check', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('push routes', () => {
  let dir: string;
  let pushStorePath: string;

  const sampleSubscription = {
    endpoint: 'https://push.example.com/abc',
    keys: { p256dh: 'p256dh-value', auth: 'auth-value' },
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'push-routes-test-'));
    pushStorePath = path.join(dir, 'subscriptions.json');
    vi.mocked(webpush.sendNotification).mockReset();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe('when push is not configured', () => {
    const app = () => createApp({ pushStorePath });

    it('GET /api/push/public-key returns 503', async () => {
      const res = await request(app()).get('/api/push/public-key');
      expect(res.status).toBe(503);
      expect(res.body).toEqual({ error: 'Push is not configured on this server.' });
    });

    it('POST /api/push/subscribe returns 503', async () => {
      const res = await request(app()).post('/api/push/subscribe').send(sampleSubscription);
      expect(res.status).toBe(503);
    });

    it('POST /api/push/send returns 503', async () => {
      const res = await request(app())
        .post('/api/push/send')
        .send({ subscription: sampleSubscription, title: 'Hi', body: 'There' });
      expect(res.status).toBe(503);
    });
  });

  describe('when push is configured', () => {
    const createConfiguredApp = () =>
      createApp({ pushStorePath, vapidPublicKey: 'pub-key', vapidPrivateKey: 'priv-key' });

    it('GET /api/push/public-key returns the public key', async () => {
      const res = await request(createConfiguredApp()).get('/api/push/public-key');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ publicKey: 'pub-key' });
    });

    it('POST /api/push/subscribe rejects an invalid subscription', async () => {
      const res = await request(createConfiguredApp())
        .post('/api/push/subscribe')
        .send({ endpoint: 'https://push.example.com/abc' });
      expect(res.status).toBe(400);
    });

    it('POST /api/push/subscribe stores a valid subscription, surviving a fresh app instance', async () => {
      const res = await request(createConfiguredApp())
        .post('/api/push/subscribe')
        .send(sampleSubscription);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });

      const restarted = createPushStore(pushStorePath);
      expect(restarted.all()).toEqual([sampleSubscription]);
    });

    it('POST /api/push/send calls web-push with the right arguments', async () => {
      vi.mocked(webpush.sendNotification).mockResolvedValueOnce({
        statusCode: 201,
        body: '',
        headers: {},
      });

      const res = await request(createConfiguredApp())
        .post('/api/push/send')
        .send({ subscription: sampleSubscription, title: 'Hello', body: 'World' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        sampleSubscription,
        JSON.stringify({ title: 'Hello', body: 'World' }),
        {
          vapidDetails: {
            subject: 'https://webcandoit.pp.ua',
            publicKey: 'pub-key',
            privateKey: 'priv-key',
          },
        },
      );
    });

    it('POST /api/push/send removes the subscription and returns 410 when it is gone', async () => {
      createPushStore(pushStorePath).save(sampleSubscription);
      vi.mocked(webpush.sendNotification).mockRejectedValueOnce(
        new webpush.WebPushError('Gone', 410, {}, '', sampleSubscription.endpoint),
      );

      const res = await request(createConfiguredApp())
        .post('/api/push/send')
        .send({ subscription: sampleSubscription, title: 'Hello', body: 'World' });

      expect(res.status).toBe(410);
      expect(createPushStore(pushStorePath).all()).toEqual([]);
    });

    it('POST /api/push/subscribe returns 503 if the store cannot be written', async () => {
      const blockerFile = path.join(dir, 'blocker');
      writeFileSync(blockerFile, 'not a directory');
      const brokenStorePath = path.join(blockerFile, 'subscriptions.json');
      const app = createApp({
        pushStorePath: brokenStorePath,
        vapidPublicKey: 'pub-key',
        vapidPrivateKey: 'priv-key',
      });

      const res = await request(app).post('/api/push/subscribe').send(sampleSubscription);

      expect(res.status).toBe(503);
    });
  });
});
