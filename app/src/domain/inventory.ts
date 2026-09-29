import type { Product } from '../api/types';

export type StockStatus = 'Low' | 'Reorder' | 'Healthy';

const LOW_RATIO = 0.5;
// Suggested orders top stock up to twice the reorder point.
const TARGET_MULTIPLE = 2;
// A transfer never takes more than half of the source warehouse's units.
const TRANSFER_SHARE = 2;
const WAREHOUSE_SHARE = 3;
const TRANSFER_TRANSIT_DAYS = 3;

export function totalStock(p: Pick<Product, 'stock'>): number {
  return p.stock.reduce((a, b) => a + b, 0);
}

export function stockStatus(p: Pick<Product, 'stock' | 'reorderPoint'>): StockStatus {
  const ratio = totalStock(p) / p.reorderPoint;
  if (ratio < LOW_RATIO) return 'Low';
  if (ratio < 1) return 'Reorder';
  return 'Healthy';
}

export function roundUpToCases(units: number, casePack: number): number {
  return Math.ceil(units / casePack) * casePack;
}

export function suggestPurchase(p: Pick<Product, 'stock' | 'reorderPoint' | 'moq' | 'casePack'>): number {
  const need = Math.max(p.reorderPoint * TARGET_MULTIPLE - totalStock(p), p.moq);
  return roundUpToCases(need, p.casePack);
}

export function suggestTransfer(p: Pick<Product, 'stock' | 'reorderPoint' | 'moq' | 'casePack'>, from: number): number {
  const half = Math.floor(p.stock[from] / TRANSFER_SHARE / p.casePack) * p.casePack;
  return Math.max(0, Math.min(half, suggestPurchase(p)));
}

/** Reorder point for a single warehouse, assuming stock is spread evenly. */
export function warehouseReorderPoint(p: Pick<Product, 'reorderPoint'>): number {
  return Math.round(p.reorderPoint / WAREHOUSE_SHARE);
}

/** Default restock plan: deliver to the emptiest warehouse, and take transfers from the fullest other one. */
export function defaultRestockWarehouses(stock: number[]): { dest: number; from: number } {
  const idx = stock.map((_, i) => i);
  const dest = idx.reduce((a, b) => (stock[b] < stock[a] ? b : a), 0);
  const from = idx.filter((i) => i !== dest).reduce((a, b) => (stock[b] > stock[a] ? b : a));
  return { dest, from };
}

export function etaLabel(today: Date, days: number): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function restockTransitDays(mode: 'po' | 'transfer', leadDays: number): number {
  return mode === 'po' ? leadDays : TRANSFER_TRANSIT_DAYS;
}
