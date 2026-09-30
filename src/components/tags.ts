import type { OrderStatus, Tier } from '../api/types';
import type { CustomerStatus, InvoiceStatus } from '../domain/finance';
import type { StockStatus } from '../domain/inventory';

export const ORDER_TAG: Record<OrderStatus, string> = {
  Placed: 'tag-outline',
  Picking: 'tag-accent',
  Shipped: 'tag-accent',
  Delivered: 'tag-neutral',
  'On hold': 'tag-outline',
};

export const INVOICE_TAG: Record<InvoiceStatus, string> = { Open: 'tag-accent', Overdue: 'tag-outline', Paid: 'tag-neutral' };

export const CUSTOMER_TAG: Record<CustomerStatus, string> = { 'Good standing': 'tag-neutral', Overdue: 'tag-outline', 'On hold': 'tag-outline' };

export const TIER_TAG: Record<Tier, string> = { Standard: 'tag-neutral', Silver: 'tag-neutral', Gold: 'tag-accent' };

export function stockTag(status: StockStatus | 'On order'): string {
  if (status === 'On order') return 'tag-accent';
  return status === 'Low' ? 'tag-outline' : 'tag-neutral';
}

/** Placeholder for header buttons whose flows the design has not specified yet. */
export const NOT_BUILT = () => {};
