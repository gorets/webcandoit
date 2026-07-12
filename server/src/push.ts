import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { PushSubscription } from 'web-push';

export function isPushConfigured(
  vapidPublicKey: string | undefined,
  vapidPrivateKey: string | undefined,
): boolean {
  return Boolean(vapidPublicKey && vapidPrivateKey);
}

export interface PushStore {
  save(subscription: PushSubscription): void;
  remove(endpoint: string): void;
  all(): PushSubscription[];
}

export function createPushStore(storePath: string): PushStore {
  const subscriptions = new Map<string, PushSubscription>();

  if (existsSync(storePath)) {
    try {
      const raw = readFileSync(storePath, 'utf-8');
      const parsed = JSON.parse(raw) as Record<string, PushSubscription>;
      for (const [endpoint, subscription] of Object.entries(parsed)) {
        subscriptions.set(endpoint, subscription);
      }
    } catch (err) {
      console.error(`Failed to read push subscription store at ${storePath}, starting empty:`, err);
    }
  }

  function persist(): void {
    mkdirSync(path.dirname(storePath), { recursive: true });
    const serialized = Object.fromEntries(subscriptions);
    writeFileSync(storePath, JSON.stringify(serialized, null, 2));
  }

  return {
    save(subscription) {
      subscriptions.set(subscription.endpoint, subscription);
      persist();
    },
    remove(endpoint) {
      subscriptions.delete(endpoint);
      persist();
    },
    all() {
      return Array.from(subscriptions.values());
    },
  };
}
