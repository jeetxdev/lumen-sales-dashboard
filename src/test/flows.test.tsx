import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('inventory restock', () => {
  it('creates a purchase order and lists it as inbound', async () => {
    const user = userEvent.setup();
    renderApp('/inventory');
    const row = await screen.findByRole('row', { name: 'Open Cotton Napkins, Set of 4' });
    await user.click(within(row).getByRole('button', { name: 'Restock' }));

    const dialog = await screen.findByRole('dialog', { name: 'Cotton Napkins, Set of 4' });
    await user.click(within(dialog).getByRole('button', { name: 'Create PO-1190' }));

    expect(await screen.findByText(/PO-1190 · Fernhill Textiles/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(screen.getByRole('row', { name: 'Open Cotton Napkins, Set of 4' })).getByText('On order')).toBeInTheDocument();
  });
});

describe('navigation', () => {
  it('opens a product from Inventory with a back button to Inventory', async () => {
    const user = userEvent.setup();
    renderApp('/inventory');
    await user.click(await screen.findByRole('row', { name: 'Open Jute Doormat' }));
    expect(await screen.findByRole('heading', { name: 'Jute Doormat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inventory/ })).toHaveAttribute('aria-current', 'page');
  });

  it('advances an order to its next status', async () => {
    const user = userEvent.setup();
    renderApp('/orders/20486');
    await user.click(await screen.findByRole('button', { name: 'Start picking' }));
    expect(await screen.findByRole('button', { name: 'Mark shipped' })).toBeInTheDocument();
  });
});

describe('appearance', () => {
  it('switches to dark mode from the header', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(await screen.findByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('applies a preset accent from Settings', async () => {
    const user = userEvent.setup();
    renderApp('/settings');
    await user.click(await screen.findByRole('button', { name: 'Coral' }));
    expect(document.documentElement.dataset.accent).toBe('coral');
  });
});
