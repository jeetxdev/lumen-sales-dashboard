import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToastStore, TOAST_DURATION_MS } from './toastStore';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('toast store', () => {
  it('removes a toast after its duration', () => {
    const store = createToastStore();
    store.push('success', 'Saved.');
    expect(store.getSnapshot()).toHaveLength(1);
    vi.advanceTimersByTime(TOAST_DURATION_MS.success);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('keeps errors on screen longer than confirmations', () => {
    const store = createToastStore();
    store.push('error', 'Failed.');
    vi.advanceTimersByTime(TOAST_DURATION_MS.success);
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('shows only the newest three', () => {
    const store = createToastStore();
    ['a', 'b', 'c', 'd'].forEach((m) => store.push('success', m));
    expect(store.getSnapshot().map((t) => t.message)).toEqual(['b', 'c', 'd']);
  });

  it('notifies subscribers until they unsubscribe', () => {
    const store = createToastStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.push('success', 'one');
    unsubscribe();
    store.push('success', 'two');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
