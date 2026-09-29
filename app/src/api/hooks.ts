import { QueryClient, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
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
export const useRangeSummary = (range: Range) => useSuspenseQuery({ queryKey: keys.range(range), queryFn: () => api.getRangeSummary(range) }).data;

function useInvalidate() {
  const client = useQueryClient();
  return (...queryKeys: readonly (readonly string[])[]) => Promise.all(queryKeys.map((queryKey) => client.invalidateQueries({ queryKey })));
}

export function useSetOrderStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => api.setOrderStatus(id, status),
    onSuccess: () => invalidate(keys.orders),
  });
}

export function useSendReminder() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: api.sendInvoiceReminder, onSuccess: () => invalidate(keys.invoices) });
}

export function useSetCustomerTier() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, tier }: { id: number; tier: Tier }) => api.setCustomerTier(id, tier),
    onSuccess: () => invalidate(keys.customers),
  });
}

export function useUpdatePrices() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: PriceUpdateInput) => api.updateProductPrices(input), onSuccess: () => invalidate(keys.products) });
}

export function useCreateRestock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: RestockInput) => api.createRestock(input),
    onSuccess: () => invalidate(keys.incoming, keys.products, keys.nextPo),
  });
}

export function useReceiveIncoming() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: api.receiveIncoming, onSuccess: () => invalidate(keys.incoming, keys.products) });
}

export function useCreatePromotion() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: PromotionInput) => api.createPromotion(input), onSuccess: () => invalidate(keys.promotions) });
}

export function useSetPromotionActive() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.setPromotionActive(id, active),
    onSuccess: () => invalidate(keys.promotions),
  });
}

export function useUpdateSettings() {
  const client = useQueryClient();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (patch: Partial<Settings>) => api.updateSettings(patch),
    // Switches and number fields must respond at once, so the cache updates before the request returns.
    onMutate: async (patch) => {
      await client.cancelQueries({ queryKey: keys.settings });
      const previous = client.getQueryData<Settings>(keys.settings);
      if (previous) {
        client.setQueryData<Settings>(keys.settings, {
          ...previous,
          ...patch,
          tierDiscounts: { ...previous.tierDiscounts, ...patch.tierDiscounts },
          toggles: { ...previous.toggles, ...patch.toggles },
        });
      }
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) client.setQueryData(keys.settings, context.previous);
    },
    onSettled: () => invalidate(keys.settings),
  });
}
