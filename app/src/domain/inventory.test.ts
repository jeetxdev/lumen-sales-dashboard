import { describe, expect, it } from 'vitest';
import { defaultRestockWarehouses, etaLabel, stockStatus, suggestPurchase, suggestTransfer } from './inventory';

const product = { stock: [80, 24, 0], reorderPoint: 200, moq: 12, casePack: 12 };

describe('stockStatus', () => {
  it('is Low under half the reorder point', () => {
    expect(stockStatus({ stock: [40, 30, 20], reorderPoint: 200 })).toBe('Low');
  });

  it('is Reorder between half and the full reorder point', () => {
    expect(stockStatus({ stock: [100, 50, 0], reorderPoint: 200 })).toBe('Reorder');
  });

  it('is Healthy at or above the reorder point', () => {
    expect(stockStatus({ stock: [100, 100, 0], reorderPoint: 200 })).toBe('Healthy');
  });
});

describe('suggestPurchase', () => {
  it('tops stock up to twice the reorder point in whole cases', () => {
    // 400 − 104 = 296, rounded up to 25 cases of 12.
    expect(suggestPurchase(product)).toBe(300);
  });

  it('never suggests less than the supplier minimum', () => {
    expect(suggestPurchase({ stock: [390, 0, 0], reorderPoint: 200, moq: 24, casePack: 12 })).toBe(24);
  });
});

describe('suggestTransfer', () => {
  it('takes at most half the source stock, in whole cases', () => {
    expect(suggestTransfer(product, 0)).toBe(36);
  });

  it('suggests nothing from an empty warehouse', () => {
    expect(suggestTransfer(product, 2)).toBe(0);
  });
});

describe('defaultRestockWarehouses', () => {
  it('delivers to the emptiest warehouse and takes from the fullest other one', () => {
    expect(defaultRestockWarehouses([150, 0, 60])).toEqual({ dest: 1, from: 0 });
  });
});

describe('etaLabel', () => {
  it('adds days across a month boundary', () => {
    expect(etaLabel(new Date(2026, 8, 24), 12)).toBe('Oct 6');
  });
});
