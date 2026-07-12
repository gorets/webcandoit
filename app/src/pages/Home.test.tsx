import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../categories';
import { Layout } from '../components/Layout';
import { Home } from './Home';

function renderHome() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Home', () => {
  it('renders the vibration demo card', () => {
    renderHome();
    expect(screen.getByText('Vibration')).toBeDefined();
  });

  it('filters demos by search text', () => {
    renderHome();
    fireEvent.change(screen.getByPlaceholderText('Search demos'), {
      target: { value: 'zzz-no-match' },
    });
    expect(screen.queryByText('Vibration')).toBeNull();
  });

  it('has a supported-only filter checkbox', () => {
    renderHome();
    expect(screen.getByLabelText('Supported in my browser')).toBeDefined();
  });

  it('renders category sections following the canonical CATEGORY_LABELS order', () => {
    renderHome();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const expectedOrder = CATEGORY_ORDER.map((c) => CATEGORY_LABELS[c]).filter((label) =>
      headings.includes(label),
    );
    expect(headings).toEqual(expectedOrder);
  });
});
