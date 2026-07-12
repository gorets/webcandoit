import { expect, test } from '@playwright/test';

test('home page renders demo cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /vibration/i })).toBeVisible();
});

test('demo route renders without crashing', async ({ page }) => {
  await page.goto('/demo/vibration');
  await expect(page.getByRole('heading', { name: 'Vibration' })).toBeVisible();
});

test('service worker registers and manifest is served', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  const swReady = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(swReady).toBe(true);
});

test('every demo route renders without crashing', async ({ page }) => {
  await page.goto('/');
  // Collect every demo link from the home grid.
  const slugs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="/demo/"]')).map(
      (a) => (a as HTMLAnchorElement).getAttribute('href') ?? '',
    ),
  );
  expect(slugs.length).toBeGreaterThan(50);

  const failures: string[] = [];
  for (const href of slugs) {
    await page.goto(href);
    // A rendered demo page always shows an <h1> title and never the not-found or
    // error-boundary fallbacks. Either the live demo or the UnsupportedPanel counts as rendered.
    const hasHeading = await page.getByRole('heading', { level: 1 }).isVisible();
    const notFound = await page.getByText('Demo not found.').isVisible();
    const crashed = await page.getByText(/This demo crashed:/i).isVisible();
    if (!hasHeading || notFound || crashed) {
      failures.push(`${href} (heading=${hasHeading} notFound=${notFound} crashed=${crashed})`);
    }
  }
  expect(failures, `Routes that failed to render: ${failures.join(', ')}`).toEqual([]);
});

test('app shell works offline after service worker caches it', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // give the SW a beat to finish precaching, then reload once online so all shell assets are cached
  await page.reload();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('link', { name: 'WebCanDoIt', exact: true })).toBeVisible();
  await context.setOffline(false);
});
