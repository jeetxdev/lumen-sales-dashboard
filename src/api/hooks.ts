import { useDeferredValue } from 'react';
import { QueryClient, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useFeedbackMutation } from '../feedback/useFeedbackMutation';
import * as api from './client';
import type { OrderStatus, PriceUpdateInput, PromotionInput, Range, RestockInput, Settings, Tier } from './types';

export const keys = {
  warehouses: ['warehouses'],
  categories: ['categories'],
  products: ['products'],
  customers: ['customers'],
  invoices: ['invoices'],
  orders: ['orders'],
  promotions: ['promotions'],
  incoming: ['incoming'],
  settings: ['settings'],
  team: ['team'],
  sales: ['sales'],
  kpiTrends: ['kpi-trends'],
  nextPo: ['next-po'],
  range: (r: Range) => ['range', r],
} as const;

export function createQueryClient() {
  // Data only changes through this app's own mutations, which invalidate what they touch.
  return new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
}

const listQueries: { queryKey: readonly string[]; queryFn: () => Promise<unknown> }[] = [
  { queryKey: keys.warehouses, queryFn: api.getWarehouses },
  { queryKey: keys.categories, queryFn: api.getCategories },
  { queryKey: keys.products, queryFn: api.getProducts },
  { queryKey: keys.customers, queryFn: api.getCustomers },
  { queryKey: keys.invoices, queryFn: api.getInvoices },
  { queryKey: keys.orders, queryFn: api.getOrders },
  { queryKey: keys.promotions, queryFn: api.getPromotions },
  { queryKey: keys.incoming, queryFn: api.getIncoming },
  { queryKey: keys.settings, queryFn: api.getSettings },
  { queryKey: keys.team, queryFn: api.getTeam },
  { queryKey: keys.sales, queryFn: api.getSalesSeries },
  { queryKey: keys.kpiTrends, queryFn: api.getKpiTrends },
  { queryKey: keys.nextPo, queryFn: api.getNextPoNumber },
];

/** Starts every list request at once, so screens that read several lists do not load them one after another. */
export function prefetchAll(client: QueryClient) {
  for (const q of listQueries) void client.prefetchQuery(q);
}

export const useWarehouses = () => useSuspenseQuery({ queryKey: keys.warehouses, queryFn: api.getWarehouses }).data;
export const useCategories = () => useSuspenseQuery({ queryKey: keys.categories, queryFn: api.getCategories }).data;
export const useProducts = () => useSuspenseQuery({ queryKey: keys.products, queryFn: api.getProducts }).data;
export const useCustomers = () => useSuspenseQuery({ queryKey: keys.customers, queryFn: api.getCustomers }).data;
export const useInvoices = () => useSuspenseQuery({ queryKey: keys.invoices, queryFn: api.getInvoices }).data;
export const useOrders = () => useSuspenseQuery({ queryKey: keys.orders, queryFn: api.getOrders }).data;
export const usePromotions = () => useSuspenseQuery({ queryKey: keys.promotions, queryFn: api.getPromotions }).data;
export const useIncoming = () => useSuspenseQuery({ queryKey: keys.incoming, queryFn: api.getIncoming }).data;
export const useSettings = () => useSuspenseQuery({ queryKey: keys.settings, queryFn: api.getSettings }).data;
export const useTeam = () => useSuspenseQuery({ queryKey: keys.team, queryFn: api.getTeam }).data;
export const useSalesSeries = () => useSuspenseQuery({ queryKey: keys.sales, queryFn: api.getSalesSeries }).data;
export const useKpiTrends = () => useSuspenseQuery({ queryKey: keys.kpiTrends, queryFn: api.getKpiTrends }).data;
export const useNextPoNumber = () => useSuspenseQuery({ queryKey: keys.nextPo, queryFn: api.getNextPoNumber }).data;

/**
 * A range the cache has not seen yet would suspend and swap the whole page for the loading fallback.
 * Deferring the range lets React keep the previous summary on screen until the new one arrives.
 */
export function useRangeSummary(range: Range) {
  const shownRange = useDeferredValue(range);
  const summary = useSuspenseQuery({ queryKey: keys.range(shownRange), queryFn: () => api.getRangeSummary(shownRange) }).data;
  return { summary, pending: shownRange !== range };
}

function useInvalidate() {
  const client = useQueryClient();
  return (...queryKeys: readonly (readonly string[])[]) => Promise.all(queryKeys.map((queryKey) => client.invalidateQueries({ queryKey })));
}

export function useSetOrderStatus() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => api.setOrderStatus(id, status),
    onSuccess: () => invalidate(keys.orders),
    success: (o) => `Order #${o.id} is now ${o.status}.`,
  });
}

export function useSendReminder() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: (id: string) => api.sendInvoiceReminder(id),
    onSuccess: () => invalidate(keys.invoices),
    success: (i) => `Reminder sent for ${i.id}.`,
  });
}

export function useSetCustomerTier() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: ({ id, tier }: { id: number; tier: Tier }) => api.setCustomerTier(id, tier),
    onSuccess: () => invalidate(keys.customers),
    success: (c) => `${c.name} moved to ${c.tier}.`,
  });
}

export function useUpdatePrices() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: (input: PriceUpdateInput) => api.updateProductPrices(input),
    onSuccess: () => invalidate(keys.products),
    success: (p) => (p.scheduled ? `New prices for ${p.name} scheduled for ${p.scheduled.when}.` : `Prices for ${p.name} saved.`),
    inlineError: true,
  });
}

export function useCreateRestock() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: (input: RestockInput) => api.createRestock(input),
    onSuccess: () => invalidate(keys.incoming, keys.products, keys.nextPo),
    success: (i) => `${i.ref} created. Expected ${i.eta}.`,
    inlineError: true,
  });
}

export function useReceiveIncoming() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: (sku: string) => api.receiveIncoming(sku),
    onSuccess: () => invalidate(keys.incoming, keys.products),
    success: (p) => `Received stock for ${p.name}.`,
  });
}

export function useCreatePromotion() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: (input: PromotionInput) => api.createPromotion(input),
    onSuccess: () => invalidate(keys.promotions),
    success: (p) => `Promotion "${p.name}" created.`,
    inlineError: true,
  });
}

export function useSetPromotionActive() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.setPromotionActive(id, active),
    onSuccess: () => invalidate(keys.promotions),
    success: (p) => (p.active ? `"${p.name}" is active again.` : `"${p.name}" ended.`),
  });
}

export function useUpdateSettings() {
  const invalidate = useInvalidate();
  return useFeedbackMutation({
    mutationFn: (settings: Settings) => api.updateSettings(settings),
    onSuccess: () => invalidate(keys.settings),
    success: () => 'Settings saved.',
  });
}
