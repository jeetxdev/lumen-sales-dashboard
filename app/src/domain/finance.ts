import type { Customer, Invoice, Product, Promotion, Settings, Tier } from '../api/types';

export type InvoiceStatus = 'Open' | 'Overdue' | 'Paid';
export type CustomerStatus = 'Good standing' | 'Overdue' | 'On hold';

const NEAR_LIMIT_RATIO = 0.85;

export function invoiceStatus(i: Pick<Invoice, 'paid' | 'daysLate'>): InvoiceStatus {
  if (i.paid) return 'Paid';
  return i.daysLate > 0 ? 'Overdue' : 'Open';
}

export function customerStatus(c: Customer, invoices: Invoice[]): CustomerStatus {
  if (c.balance > c.creditLimit) return 'On hold';
  if (invoices.some((i) => i.customerId === c.id && invoiceStatus(i) === 'Overdue')) return 'Overdue';
  return 'Good standing';
}

export type CreditLevel = 'over' | 'near' | 'ok';

export function creditLevel(c: Pick<Customer, 'balance' | 'creditLimit'>): CreditLevel {
  const r = c.balance / c.creditLimit;
  if (r > 1) return 'over';
  if (r > NEAR_LIMIT_RATIO) return 'near';
  return 'ok';
}

export interface AgingBucket {
  label: string;
  count: number;
  amount: number;
}

const AGING_BUCKETS: [string, (daysLate: number) => boolean][] = [
  ['Current', (d) => d === 0],
  ['1–30 days', (d) => d > 0 && d <= 30],
  ['31–60 days', (d) => d > 30 && d <= 60],
  ['61–90 days', (d) => d > 60 && d <= 90],
  ['90+ days', (d) => d > 90],
];

export function agingBuckets(invoices: Invoice[]): AgingBucket[] {
  const unpaid = invoices.filter((i) => !i.paid);
  return AGING_BUCKETS.map(([label, test]) => {
    const list = unpaid.filter((i) => test(i.daysLate));
    return { label, count: list.length, amount: list.reduce((a, i) => a + i.amount, 0) };
  });
}

export function tierDiscountPct(tier: Tier, settings: Settings): number {
  return tier === 'Standard' ? 0 : settings.tierDiscounts[tier];
}

export function marginPct(cost: number, price: number): number {
  return Math.round((1 - cost / price) * 100);
}

export function activePromotionFor(p: Pick<Product, 'sku'>, promotions: Promotion[]): Promotion | undefined {
  return promotions.find((pr) => pr.active && pr.skus.includes(p.sku));
}
