import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSettings } from '../api/client';
import { renderApp } from './renderApp';

// Long enough for the test to see the pending state before the mock request resolves.
const SLOW_MS = 50;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const successToasts = () => screen.getByRole('status');
const errorToasts = () => screen.getByRole('alert');

describe('settings save', () => {
  it('keeps Save disabled until something changes', async () => {
    renderApp('/settings');
    expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('previews appearance and stores it only on Save', async () => {
    const user = userEvent.setup();
    renderApp('/settings');
    await user.click(await screen.findByRole('button', { name: 'Coral' }));
    expect(document.documentElement.dataset.accent).toBe('coral');
    expect(localStorage.getItem('lumen.appearance')).not.toContain('coral');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await within(successToasts()).findByText('Settings saved.')).toBeInTheDocument();
    expect(localStorage.getItem('lumen.appearance')).toContain('coral');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('drops an unsaved appearance preview when the user leaves Settings', async () => {
    const user = userEvent.setup();
    renderApp('/settings');
    const before = document.documentElement.dataset.accent;
    await user.click(await screen.findByRole('button', { name: 'Coral' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await user.click(screen.getByRole('link', { name: /Overview/ }));
    await screen.findByRole('heading', { name: /Good morning/ });
    // The preview ends in the Settings page's unmount cleanup, which React runs after the new page paints.
    await waitFor(() => expect(document.documentElement.dataset.accent).toBe(before));
  });

  it('shows progress, then confirms and persists the change', async () => {
    const user = userEvent.setup();
    renderApp('/settings', { latencyMs: SLOW_MS });
    const name = await screen.findByLabelText('Legal name');
    await user.clear(name);
    await user.type(name, 'Lumen Goods Inc.');
    await user.click(screen.getByRole('switch', { name: 'Weekly digest' }));
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    const pending = screen.getByRole('button', { name: 'Saving…' });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute('aria-busy', 'true');

    expect(await within(successToasts()).findByText('Settings saved.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    const saved = await getSettings();
    expect(saved.company.legalName).toBe('Lumen Goods Inc.');
    expect(saved.toggles.digest).toBe(true);
  });

  it('reports a failed save and keeps the edits', async () => {
    const user = userEvent.setup();
    renderApp('/settings');
    const email = await screen.findByLabelText('Billing email');
    await user.clear(email);
    await user.type(email, 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await within(errorToasts()).findByText('Enter a valid billing email.')).toBeInTheDocument();
    expect(screen.getByLabelText('Billing email')).toHaveValue('not-an-email');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect((await getSettings()).company.billingEmail).toBe('ar@lumengoods.co');
  });

  it('dismisses a toast on request', async () => {
    const user = userEvent.setup();
    renderApp('/settings');
    await user.click(await screen.findByRole('switch', { name: 'Weekly digest' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await within(successToasts()).findByText('Settings saved.');
    await user.click(within(successToasts()).getByRole('button', { name: 'Dismiss' }));
    expect(within(successToasts()).queryByText('Settings saved.')).not.toBeInTheDocument();
  });
});

describe('other writes', () => {
  it('locks the order action while it runs and confirms the new status', async () => {
    const user = userEvent.setup();
    renderApp('/orders/20486', { latencyMs: SLOW_MS });
    await user.click(await screen.findByRole('button', { name: 'Start picking' }));
    expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled();
    expect(await within(successToasts()).findByText('Order #20486 is now Picking.')).toBeInTheDocument();
  });

  it('confirms a sent invoice reminder', async () => {
    const user = userEvent.setup();
    renderApp('/invoices');
    const [send] = await screen.findAllByRole('button', { name: 'Send reminder' });
    await user.click(send);
    expect(await within(successToasts()).findByText(/^Reminder sent for /)).toBeInTheDocument();
  });

  it('confirms a restock after the dialog closes', async () => {
    const user = userEvent.setup();
    renderApp('/inventory');
    const row = await screen.findByRole('row', { name: 'Open Cotton Napkins, Set of 4' });
    await user.click(within(row).getByRole('button', { name: 'Restock' }));
    const dialog = await screen.findByRole('dialog', { name: 'Cotton Napkins, Set of 4' });
    await user.click(within(dialog).getByRole('button', { name: 'Create PO-1190' }));
    expect(await within(successToasts()).findByText(/^PO-1190 created\./)).toBeInTheDocument();
  });
});
