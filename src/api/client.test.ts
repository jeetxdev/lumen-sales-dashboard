import { beforeEach, describe, expect, it } from 'vitest';
import * as api from './client';

beforeEach(() => api.resetMockDb({ latencyMs: 0 }));

describe('restock', () => {
  it('moves units out of the source warehouse on a transfer', async () => {
    const before = (await api.getProducts()).find((p) => p.sku === 'LG-1042')!;
    const incoming = await api.createRestock({ sku: 'LG-1042', mode: 'transfer', from: 0, dest: 2, qty: 60 });
    const after = (await api.getProducts()).find((p) => p.sku === 'LG-1042')!;
    expect(after.stock[0]).toBe(before.stock[0] - 60);
    expect(incoming).toMatchObject({ type: 'Transfer', ref: 'TR-0413', warehouse: 'RNO', eta: 'Sep 27' });
  });

  it('numbers purchase orders in sequence and uses the supplier lead time', async () => {
    const incoming = await api.createRestock({ sku: 'LG-1210', mode: 'po', from: 0, dest: 2, qty: 300 });
    expect(incoming).toMatchObject({ ref: 'PO-1190', source: 'Fernhill Textiles', eta: 'Oct 22' });
    expect(await api.getNextPoNumber()).toBe('PO-1191');
  });

  it('rejects a transfer larger than the source stock', async () => {
    await expect(api.createRestock({ sku: 'LG-1210', mode: 'transfer', from: 1, dest: 2, qty: 48 })).rejects.toThrow('Only 24 units at CMH.');
  });

  it('adds received units to the destination warehouse', async () => {
    await api.receiveIncoming('LG-2290');
    const p = (await api.getProducts()).find((x) => x.sku === 'LG-2290')!;
    expect(p.stock[1]).toBe(40);
    expect((await api.getIncoming()).some((i) => i.sku === 'LG-2290')).toBe(false);
  });
});

describe('prices', () => {
  it('records history when a price changes immediately', async () => {
    const p = await api.updateProductPrices({ sku: 'LG-1042', cost: 18, ws: 34, msrp: 64, when: 'Immediately' });
    expect(p.ws).toBe(34);
    expect(p.priceHistory.at(-1)).toMatchObject({ from: 32, to: 34 });
  });

  it('schedules a later change without touching the current price', async () => {
    const p = await api.updateProductPrices({ sku: 'LG-1042', cost: 18, ws: 34, msrp: 64, when: 'Oct 1' });
    expect(p.ws).toBe(32);
    expect(p.scheduled).toMatchObject({ when: 'Oct 1', ws: 34 });
  });

  it('keeps existing order lines at the price they were placed at', async () => {
    await api.updateProductPrices({ sku: 'LG-1042', cost: 18, ws: 50, msrp: 64, when: 'Immediately' });
    const line = (await api.getOrders()).flatMap((o) => o.lines).find((l) => l.sku === 'LG-1042')!;
    expect(line.unitPrice).toBe(32);
  });

  it('refuses a wholesale price at or below cost', async () => {
    await expect(api.updateProductPrices({ sku: 'LG-1042', cost: 18, ws: 18, msrp: 64, when: 'Immediately' })).rejects.toThrow('above cost');
  });
});

describe('promotions', () => {
  it('adds a new promotion at the top of the list', async () => {
    const promo = await api.createPromotion({ name: ' Holiday ', pct: 10, skus: ['LG-1042'], scopeLabel: '1 product', audience: 'All accounts', end: 'No end date', stack: true });
    expect(promo).toMatchObject({ id: 'PR-08', name: 'Holiday', end: null, active: true });
    expect((await api.getPromotions())[0].id).toBe('PR-08');
  });
});

describe('returned data', () => {
  it('is a copy, so callers cannot change the store by accident', async () => {
    const products = await api.getProducts();
    products[0].stock[0] = -1;
    expect((await api.getProducts())[0].stock[0]).not.toBe(-1);
  });
});
