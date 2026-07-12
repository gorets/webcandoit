import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import vibrationMeta from '../demos/vibration/meta';
import { DemoPage } from './DemoPage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/demo/:slug" element={<DemoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DemoPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the unsupported panel when isSupported is false (jsdom has no navigator.vibrate)', async () => {
    renderAt('/demo/vibration');
    expect(await screen.findByRole('heading', { name: 'Vibration' })).toBeDefined();
    expect(screen.getByText(/not supported in this browser/i)).toBeDefined();
  });

  it('renders the lazily-loaded demo component when isSupported is true', async () => {
    vi.spyOn(vibrationMeta, 'isSupported').mockReturnValue(true);
    renderAt('/demo/vibration');
    expect(await screen.findByRole('button', { name: /vibrate 200ms/i })).toBeDefined();
  });

  it('shows not-found for an unknown slug', () => {
    renderAt('/demo/nope');
    expect(screen.getByText(/demo not found/i)).toBeDefined();
  });
});
