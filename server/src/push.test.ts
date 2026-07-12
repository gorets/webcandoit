import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPushStore, isPushConfigured } from './push.js';

describe('isPushConfigured', () => {
  it('is false when either key is missing', () => {
    expect(isPushConfigured(undefined, undefined)).toBe(false);
    expect(isPushConfigured('pub', undefined)).toBe(false);
    expect(isPushConfigured(undefined, 'priv')).toBe(false);
  });

  it('is true when both keys are set', () => {
    expect(isPushConfigured('pub', 'priv')).toBe(true);
  });
});

describe('createPushStore', () => {
  let dir: string;
  let storePath: string;

  const sampleSubscription = {
    endpoint: 'https://push.example.com/abc',
    keys: { p256dh: 'p256dh-value', auth: 'auth-value' },
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'push-store-test-'));
    storePath = path.join(dir, 'subscriptions.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('starts empty when no file exists yet', () => {
    const store = createPushStore(storePath);
    expect(store.all()).toEqual([]);
  });

  it('persists a saved subscription to disk', () => {
    const store = createPushStore(storePath);
    store.save(sampleSubscription);
    expect(store.all()).toEqual([sampleSubscription]);
    const onDisk = JSON.parse(readFileSync(storePath, 'utf-8'));
    expect(onDisk[sampleSubscription.endpoint]).toEqual(sampleSubscription);
  });

  it('survives a fresh instance reading the same path (simulated restart)', () => {
    createPushStore(storePath).save(sampleSubscription);
    const restarted = createPushStore(storePath);
    expect(restarted.all()).toEqual([sampleSubscription]);
  });

  it('removes a subscription and persists the removal', () => {
    const store = createPushStore(storePath);
    store.save(sampleSubscription);
    store.remove(sampleSubscription.endpoint);
    expect(store.all()).toEqual([]);
    const restarted = createPushStore(storePath);
    expect(restarted.all()).toEqual([]);
  });

  it('starts empty (without throwing) when the store file contains invalid JSON', () => {
    writeFileSync(storePath, '{ not valid json');
    const store = createPushStore(storePath);
    expect(store.all()).toEqual([]);
  });
});
