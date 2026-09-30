import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp';

// Long enough that a suspended render would show the page fallback before the range data arrives.
const SLOW_LATENCY_MS = 50;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('overview date range', () => {
  it('keeps the page on screen while a new range loads for the first time', async () => {
    const user = userEvent.setup();
    renderApp('/', { latencyMs: SLOW_LATENCY_MS });
    expect(await screen.findByText('$412.4k')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'QTD' }));

    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    expect(screen.getByText('$412.4k')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'QTD' })).toBeChecked();
    expect(screen.getByText('$412.4k').closest('section')).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(screen.getByText('$1.14M')).toBeInTheDocument());
    expect(screen.getByText('$1.14M').closest('section')).toHaveAttribute('aria-busy', 'false');
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });
});
